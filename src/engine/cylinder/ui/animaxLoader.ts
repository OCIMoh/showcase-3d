/**
 * Authentic Lusion Preloader with Buttery-Smooth 60 FPS GSAP Number Rolling
 * 
 * - Stable, rock-solid width: All 3 columns have permanently reserved dimensions (ZERO layout resizing at 100)
 * - Generous, balanced editorial position (no longer crammed against the bottom edge)
 * - GPU hardware-accelerated sub-pixel translation (translate3d + backface-visibility: hidden)
 * - Continuous GSAP sub-pixel timeline driver
 * - Silky GSAP curtain lift (power4.inOut) smoothly unveiling the 3D WebGL scene
 */

import gsap from 'gsap';

export class AnimaxLoader {
  private root: HTMLElement;
  private colHundreds!: HTMLElement;
  private trackHundreds!: HTMLElement;
  private colTens!: HTMLElement;
  private trackTens!: HTMLElement;
  private colUnits!: HTMLElement;
  private trackUnits!: HTMLElement;

  private isFinished = false;
  private isAssetsReady = false;
  private currentProgress = { val: 0 };
  private onCompleteCallback?: () => void;
  private tween?: gsap.core.Tween;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'lusion-loader';
    this.root.id = 'animaxLoader';
    this.root.setAttribute('role', 'progressbar');
    this.root.setAttribute('aria-label', 'Loading');
    this.root.setAttribute('aria-valuemin', '0');
    this.root.setAttribute('aria-valuemax', '100');
    this.root.setAttribute('aria-valuenow', '0');

    // Build 101 unit spans (0-9 repeated 10 times, plus final 0 at index 100)
    let unitSpans = '';
    for (let i = 0; i <= 100; i++) {
      unitSpans += `<span>${i % 10}</span>`;
    }

    // Build 11 tens spans (0-9 plus final 0 at index 10)
    let tensSpans = '';
    for (let i = 0; i <= 10; i++) {
      tensSpans += `<span>${i % 10}</span>`;
    }

    this.root.innerHTML = `
      <!-- Masked Number-Flipping Odometer (Fixed dimensions, zero resizing) -->
      <div class="lusion-counter" id="lusionCounter">
        <!-- Hundreds Column (Fixed reserved width, slides '1' in at 100 without resizing container) -->
        <div class="digit-col digit-col--hundreds" id="colHundreds">
          <div class="digit-track" id="trackHundreds">
            <span>&nbsp;</span>
            <span>1</span>
          </div>
        </div>

        <!-- Tens Column (0 -> 9 -> 0, fixed reserved width) -->
        <div class="digit-col digit-col--tens" id="colTens">
          <div class="digit-track" id="trackTens">
            ${tensSpans}
          </div>
        </div>

        <!-- Units Column (Continuous Analog Rolling Stream 0 -> 100, fixed reserved width) -->
        <div class="digit-col digit-col--units" id="colUnits">
          <div class="digit-track" id="trackUnits">
            ${unitSpans}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.root);

    this.colHundreds = this.root.querySelector('#colHundreds') as HTMLElement;
    this.trackHundreds = this.root.querySelector('#trackHundreds') as HTMLElement;
    this.colTens = this.root.querySelector('#colTens') as HTMLElement;
    this.trackTens = this.root.querySelector('#trackTens') as HTMLElement;
    this.colUnits = this.root.querySelector('#colUnits') as HTMLElement;
    this.trackUnits = this.root.querySelector('#trackUnits') as HTMLElement;

    // Start continuous, buttery-smooth GSAP progression
    this.startSmoothCounter();
  }

  /**
   * Starts a smooth, continuous 60 FPS sub-pixel tween.
   * Runs smoothly towards 92% over 1.4s, and smoothly accelerates to 100% as soon
   * as the assets are ready without ANY freezing, jumping, or stalling.
   */
  private startSmoothCounter(): void {
    this.tween = gsap.to(this.currentProgress, {
      val: 92,
      duration: 1.4,
      ease: 'power1.inOut',
      onUpdate: () => {
        this.updateColumns(this.currentProgress.val);
      },
      onComplete: () => {
        if (this.isAssetsReady) {
          this.finishToCompletion();
        }
      }
    });
  }

  /**
   * Translates column strips smoothly with GPU sub-pixel positioning.
   * Container width remains 100% static and stable throughout.
   */
  private updateColumns(p: number): void {
    const clamped = Math.min(100, Math.max(0, p));
    this.root.setAttribute('aria-valuenow', Math.round(clamped).toString());

    // 1. Units Column (101 items total, continuous analog roll)
    const unitPercent = -(clamped / 101) * 100;
    this.trackUnits.style.transform = `translate3d(0, ${unitPercent.toFixed(4)}%, 0)`;

    // 2. Tens Column (11 items total, continuous roll)
    const tensPercent = -(clamped / 110) * 100;
    this.trackTens.style.transform = `translate3d(0, ${tensPercent.toFixed(4)}%, 0)`;

    // 3. Hundreds Column (rolls '1' into its already-reserved slot at 100% - ZERO horizontal layout shift)
    if (clamped < 96) {
      this.trackHundreds.style.transform = 'translate3d(0, 0%, 0)';
    } else {
      const factor = Math.min(1, Math.max(0, (clamped - 96) / 4));
      this.trackHundreds.style.transform = `translate3d(0, ${(-factor * 50).toFixed(4)}%, 0)`;
    }
  }

  public setProgress(_pct: number, _message?: string): void {
    // Uncoupled from stepped network spikes to guarantee silky 60 FPS motion
  }

  public onComplete(cb: () => void): void {
    this.onCompleteCallback = cb;
  }

  /**
   * Called when assets have finished buffering.
   * Smoothly finishes the tween to 100% and triggers outro without stalling.
   */
  public finish(): Promise<void> {
    return new Promise((resolve) => {
      this.isAssetsReady = true;
      this.onCompleteCallback = resolve;
      this.finishToCompletion();
    });
  }

  private finishToCompletion(): void {
    if (this.isFinished) return;

    if (this.tween) {
      this.tween.kill();
    }

    // Smoothly glide from current progress to 100% with gentle deceleration
    const remainingDistance = 100 - this.currentProgress.val;
    const duration = Math.max(0.35, (remainingDistance / 100) * 0.9);

    this.tween = gsap.to(this.currentProgress, {
      val: 100,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        this.updateColumns(this.currentProgress.val);
      },
      onComplete: () => {
        this.triggerOutro();
      }
    });
  }

  private triggerOutro(): void {
    if (this.isFinished) return;
    this.isFinished = true;

    // Lock exact final alignment
    this.updateColumns(100);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const outroTl = gsap.timeline({
      defaults: { overwrite: 'auto' },
      onComplete: () => {
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
        }
        if (this.root.parentElement) {
          this.root.parentElement.removeChild(this.root);
        }
      }
    });

    if (prefersReduced) {
      outroTl.to(this.root, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut'
      });
      return;
    }

    const counter = this.root.querySelector('#lusionCounter') as HTMLElement;

    // Slight beat on 100 for dramatic impact, then smooth curtain lift
    outroTl
      .to({}, { duration: 0.2 })
      .to(counter, {
        y: -40,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.inOut'
      })
      .to(
        this.root,
        {
          yPercent: -100,
          duration: 0.85,
          ease: 'power4.inOut'
        },
        '-=0.25'
      );
  }

  public destroy(): void {
    if (this.tween) {
      this.tween.kill();
    }
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
  }
}
