/**
 * Authentic Lusion Preloader with Buttery-Smooth 60-120 FPS GSAP Number Rolling
 * 
 * - Stable, rock-solid width: All 3 columns have permanently reserved dimensions (ZERO layout resizing at 100)
 * - HUD-aligned Bottom-Center placement with responsive vertical clamping
 * - GPU hardware-accelerated sub-pixel translation (gsap.quickSetter in px + contain: strict)
 * - Single continuous GSAP timeline (0 -> 100) with dynamic timeScale modulation (eliminates velocity discontinuities)
 * - Accessibility-throttled aria-valuenow (prevents AXTree recalculation thrash)
 * - Silky GSAP curtain lift unveiling the 3D WebGL scene
 */

import gsap from 'gsap';

export class AnimaxLoader {
  private root: HTMLElement;
  private counterEl: HTMLElement;
  private colHundreds!: HTMLElement;
  private trackHundreds!: HTMLElement;
  private colTens!: HTMLElement;
  private trackTens!: HTMLElement;
  private colUnits!: HTMLElement;
  private trackUnits!: HTMLElement;

  private isFinished = false;
  private isAssetsReady = false;
  private isBraking = false;
  private lastAriaVal = -1;
  private singleDigitHeight = 0;

  private setUnitsY!: (value: number) => void;
  private setTensY!: (value: number) => void;
  private setHundredsY!: (value: number) => void;

  private currentProgress = { val: 0 };
  private onCompleteCallback?: () => void;
  private tween?: gsap.core.Tween;
  private finishPromise?: Promise<void>;

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
      <!-- Masked Number-Flipping Odometer (Fixed dimensions, zero resizing, centered) -->
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

    this.counterEl = this.root.querySelector('#lusionCounter') as HTMLElement;
    this.colHundreds = this.root.querySelector('#colHundreds') as HTMLElement;
    this.trackHundreds = this.root.querySelector('#trackHundreds') as HTMLElement;
    this.colTens = this.root.querySelector('#colTens') as HTMLElement;
    this.trackTens = this.root.querySelector('#trackTens') as HTMLElement;
    this.colUnits = this.root.querySelector('#colUnits') as HTMLElement;
    this.trackUnits = this.root.querySelector('#trackUnits') as HTMLElement;

    // Initialize clean transform origin for left-aligned counter
    gsap.set(this.counterEl, { xPercent: 0, x: 0 });

    // Initialize ultra-fast hardware quickSetters for sub-pixel pixel translations
    this.setUnitsY = gsap.quickSetter(this.trackUnits, 'y', 'px') as (value: number) => void;
    this.setTensY = gsap.quickSetter(this.trackTens, 'y', 'px') as (value: number) => void;
    this.setHundredsY = gsap.quickSetter(this.trackHundreds, 'y', 'px') as (value: number) => void;

    // Pre-measure digit height once attached
    this.singleDigitHeight = this.measureDigitHeight();

    // Responsive recalculation on viewport resize
    window.addEventListener('resize', this.handleResize, { passive: true });

    // Initialize columns at 0
    this.updateColumns(0);

    // Start continuous, buttery-smooth GSAP progression
    this.startSmoothCounter();
  }

  private measureDigitHeight(): number {
    if (!this.trackUnits) return 0;
    const span = this.trackUnits.querySelector('span');
    if (span) {
      const rect = span.getBoundingClientRect();
      if (rect.height > 0) {
        return rect.height;
      }
    }
    if (this.colUnits && this.colUnits.clientHeight > 0) {
      return this.colUnits.clientHeight;
    }
    const computedFs = parseFloat(window.getComputedStyle(this.counterEl || this.root).fontSize) || 96;
    return computedFs * 0.85;
  }

  private getDigitHeight(): number {
    if (this.singleDigitHeight <= 0) {
      this.singleDigitHeight = this.measureDigitHeight();
    }
    return this.singleDigitHeight;
  }

  private handleResize = (): void => {
    this.singleDigitHeight = this.measureDigitHeight();
    this.updateColumns(this.currentProgress.val);
  };

  /**
   * Starts a smooth, continuous sub-pixel timeline from 0 to 100.
   * Modulates timeScale dynamically when assets finish buffering,
   * eliminating velocity discontinuities, tween interruption, or stutter.
   */
  private startSmoothCounter(): void {
    this.tween = gsap.to(this.currentProgress, {
      val: 100,
      duration: 3.2,
      ease: 'power1.inOut',
      onUpdate: () => {
        const val = this.currentProgress.val;

        // Soft braking if assets are not ready yet as we approach completion ceiling
        if (!this.isAssetsReady) {
          if (val >= 92) {
            this.currentProgress.val = 92;
            this.updateColumns(92);
            this.tween?.pause();
            return;
          } else if (val >= 80 && !this.isBraking && this.tween) {
            this.isBraking = true;
            gsap.to(this.tween, { timeScale: 0.4, duration: 0.6, ease: 'power2.out' });
          }
        }

        this.updateColumns(val);
      },
      onComplete: () => {
        this.triggerOutro();
      }
    });
  }

  /**
   * Translates column strips smoothly with GPU sub-pixel positioning using gsap.quickSetter.
   * Container width remains 100% static and stable throughout.
   */
  private updateColumns(p: number): void {
    const clamped = Math.min(100, Math.max(0, p));
    const h = this.getDigitHeight();

    // 1. Throttle aria-valuenow to whole integer updates to prevent accessibility tree recalculation thrash
    const intVal = Math.round(clamped);
    if (intVal !== this.lastAriaVal) {
      this.lastAriaVal = intVal;
      this.root.setAttribute('aria-valuenow', String(intVal));
    }

    // 2. Units Column (101 items total, 0-100 continuous mapping: 1 progress unit = 1 row height)
    this.setUnitsY(-clamped * h);

    // 3. Tens Column (11 items total, 0-10 mapping: 10 progress units = 1 row height)
    this.setTensY(-(clamped / 10) * h);

    // 4. Hundreds Column (rolls '1' into its reserved slot between 95 and 100)
    if (clamped < 95) {
      this.setHundredsY(0);
    } else {
      const factor = Math.min(1, Math.max(0, (clamped - 95) / 5));
      this.setHundredsY(-factor * h);
    }
  }

  public setProgress(_pct: number, _message?: string): void {
    // Uncoupled from stepped network spikes to guarantee silky 60-120 FPS motion
  }

  public onComplete(cb: () => void): void {
    this.onCompleteCallback = cb;
  }

  /**
   * Called when assets have finished buffering.
   * Smoothly accelerates the continuous timeline to 100% and triggers outro without stalling.
   */
  public finish(): Promise<void> {
    if (this.finishPromise) return this.finishPromise;

    this.finishPromise = new Promise((resolve) => {
      this.isAssetsReady = true;
      this.onCompleteCallback = resolve;

      if (this.isFinished) {
        resolve();
        return;
      }

      if (this.tween) {
        if (this.tween.paused()) {
          this.tween.play();
        }
        // Smoothly accelerate to 1.6x so the remaining roll is visible and buttery
        gsap.to(this.tween, {
          timeScale: 1.6,
          duration: 0.5,
          ease: 'power2.out'
        });
      } else {
        this.triggerOutro();
      }
    });

    return this.finishPromise;
  }

  private triggerOutro(): void {
    if (this.isFinished) return;
    this.isFinished = true;

    window.removeEventListener('resize', this.handleResize);

    // Lock exact final alignment at 100
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

    // Slight beat on 100 for dramatic impact, then smooth curtain lift
    outroTl
      .to({}, { duration: 0.28 })
      .to(this.counterEl, {
        y: -36,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.inOut'
      })
      .to(
        this.root,
        {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut'
        },
        '-=0.25'
      );
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    if (this.tween) {
      this.tween.kill();
    }
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
  }
}
