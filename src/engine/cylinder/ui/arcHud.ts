/**
 * Arc HUD Component: Bottom dynamic curved SVG trajectory with scrub thumb
 * Upgraded with:
 * - 3D Barrel Cuboid Tumbler (continuous rotary drum in 3D perspective)
 * - In-camera SVG path stroke draw on entrance (animaxxing/svg-effects)
 * - Spring-tension glider bead with physical lead/lag (animaxxing/pointer-effects)
 * - 100% infinite 360° continuous rotation (zero numbers, zero pagination)
 */

import gsap from 'gsap';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class ArcHudComponent {
  public root: HTMLElement;
  private trackEl: SVGPathElement;
  private thumbEl: SVGCircleElement;
  private flipperEl: HTMLElement;
  private drumRingEl: HTMLElement;
  private faceTitleEls: HTMLElement[] = [];
  private facetEls: HTMLElement[] = [];
  private lastPopulatedK = -999999;

  public arcCurveAmount = 1.0;
  private currentActiveIndex = -1;
  private pathLength = 185;
  private currentT = 0.5;
  private currentDrumAngle = 0;
  private projectTitles: string[];

  constructor(parent: HTMLElement, projectTitles: string[] = ['Touché']) {
    this.projectTitles = projectTitles.length > 0 ? projectTitles : ['Touché'];
    this.root = document.createElement('footer');
    this.root.className = 'ma-arc-hud';
    this.root.id = 'maArcHud';
    this.root.setAttribute('aria-label', 'Carousel Arc Scrubber');

    // Build True 4-Sided 90° Rectangular Cuboid Geometry (H=24px, D=24px, R=12px)
    const halfD = 12;
    const facesConfig = [
      { id: 'front', angle: 0 },
      { id: 'top', angle: 90 },
      { id: 'back', angle: 180 },
      { id: 'bottom', angle: 270 }
    ];

    let facetsHtml = '';
    facesConfig.forEach((f, i) => {
      facetsHtml += `
        <div class="ma-cuboid-facet ma-cuboid-facet--${f.id}" data-face-idx="${i}" style="transform: rotateX(${f.angle}deg) translateZ(${halfD}px);">
          <span class="ma-cuboid-facet__title"></span>
        </div>
      `;
    });
    // Add 3D Volumetric End Caps to seal the rectangular box
    facetsHtml += `
      <div class="ma-cuboid-cap ma-cuboid-cap--left" style="transform: translateX(-12px) rotateY(-90deg);"></div>
      <div class="ma-cuboid-cap ma-cuboid-cap--right" style="transform: translateX(12px) rotateY(90deg);"></div>
    `;

    this.root.innerHTML = `
      <div class="ma-arc-hud__arc-wrap">
        <svg class="ma-arc-hud__svg" viewBox="0 0 200 48" preserveAspectRatio="none">
          <path class="ma-arc-hud__track" id="maArcTrack" d="M 12 40 Q 100 8 188 40" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" stroke-linecap="round"/>
          <circle class="ma-arc-hud__thumb" id="maArcThumb" cx="100" cy="8" r="3.2" fill="#ffffff" />
        </svg>
      </div>
      <div class="ma-cuboid-flipper" id="maCuboidFlipper">
        <div class="ma-cuboid-flipper__ring" id="maCuboidRing">
          ${facetsHtml}
        </div>
      </div>
    `;

    parent.appendChild(this.root);

    this.trackEl = this.root.querySelector('#maArcTrack') as unknown as SVGPathElement;
    this.thumbEl = this.root.querySelector('#maArcThumb') as unknown as SVGCircleElement;
    this.flipperEl = this.root.querySelector('#maCuboidFlipper') as HTMLElement;
    this.drumRingEl = this.root.querySelector('#maCuboidRing') as HTMLElement;

    this.faceTitleEls = Array.from(this.root.querySelectorAll('.ma-cuboid-facet__title')) as HTMLElement[];
    this.facetEls = Array.from(this.root.querySelectorAll('.ma-cuboid-facet')) as HTMLElement[];

    // Initial populate of the 4 faces with initial project titles
    this.updateFaceTitles(0);

    // Measure SVG Path Length for in-camera drawing
    if (this.trackEl && typeof this.trackEl.getTotalLength === 'function') {
      try {
        this.pathLength = Math.max(180, this.trackEl.getTotalLength());
      } catch {
        this.pathLength = 185;
      }
    }
    this.trackEl.style.strokeDasharray = `${this.pathLength}`;
    this.trackEl.style.strokeDashoffset = `${this.pathLength}`;
  }

  private updateFaceTitles(k: number): void {
    if (k === this.lastPopulatedK) return;
    this.lastPopulatedK = k;

    const num = Math.max(1, this.projectTitles.length);
    const frontFace = ((k % 4) + 4) % 4;
    const frontProj = ((k % num) + num) % num;

    const faceMap: Record<number, number> = {
      [frontFace]: frontProj,
      [(frontFace + 1) % 4]: (((k + 1) % num) + num) % num,
      [(frontFace + 2) % 4]: (((k + 2) % num) + num) % num,
      [(frontFace + 3) % 4]: (((k - 1) % num) + num) % num
    };

    for (let f = 0; f < 4; f++) {
      const projIdx = faceMap[f];
      if (this.faceTitleEls[f] && projIdx !== undefined) {
        this.faceTitleEls[f].textContent = this.projectTitles[projIdx] || '';
      }
    }
  }

  public update(
    normIndex: number,
    continuousProgress: number,
    totalItems: number,
    onIndexChange?: (newIndex: number) => void
  ): void {
    const num = Math.max(1, this.projectTitles.length);
    const activeIdx = Math.round(normIndex) % num;
    const cleanActiveIdx = ((activeIdx % num) + num) % num;

    if (cleanActiveIdx !== this.currentActiveIndex) {
      this.currentActiveIndex = cleanActiveIdx;
      onIndexChange?.(cleanActiveIdx);
    }

    // 1. Dynamic 4-Sided Cuboid Face Swapping
    const k = Math.round(continuousProgress);
    this.updateFaceTitles(k);

    // 2. Rotate 3D Rectangular Prism in real-time 1:1 with continuous scroll
    if (this.drumRingEl) {
      // 90 degrees per project item
      const targetDrumAngle = -continuousProgress * 90;

      // Smooth damped tracking
      this.currentDrumAngle += (targetDrumAngle - this.currentDrumAngle) * 0.22;
      this.drumRingEl.style.transform = `rotateX(${this.currentDrumAngle.toFixed(2)}deg)`;

      // 3. Dynamic directional lighting on the 4 faces
      const rad = (this.currentDrumAngle * Math.PI) / 180;
      for (let f = 0; f < 4; f++) {
        const phi = f * (Math.PI / 2) + rad;
        const cosVal = Math.cos(phi);
        const facet = this.facetEls[f];
        if (facet) {
          if (cosVal > 0.05) {
            const brightness = 0.42 + 0.58 * Math.pow(cosVal, 1.25);
            facet.style.opacity = brightness.toFixed(3);
            facet.style.visibility = 'visible';
          } else {
            facet.style.opacity = '0';
            facet.style.visibility = 'hidden';
          }
        }
      }
    }

    // 2. Sync SVG track path curve
    if (this.trackEl) {
      const midY = (8 * this.arcCurveAmount + 40 * (1 - this.arcCurveAmount)).toFixed(1);
      this.trackEl.setAttribute('d', `M 12 40 Q 100 ${midY} 188 40`);
    }

    // 3. Move thumb along quadratic bezier with organic spring follow
    if (this.thumbEl) {
      const targetT = totalItems > 1 ? normIndex / (totalItems - 1) : 0.5;
      const clampedTarget = Math.max(0, Math.min(1, targetT));

      // Gentle damping to eliminate micro-jitter; snappy jump across the 360 wrap boundary
      if (Math.abs(clampedTarget - this.currentT) > 0.55) {
        this.currentT = clampedTarget;
      } else {
        this.currentT += (clampedTarget - this.currentT) * 0.18;
      }
      const t = this.currentT;

      const midYNum = 8 * this.arcCurveAmount + 40 * (1 - this.arcCurveAmount);
      const x =
        (1 - t) * (1 - t) * 12 +
        2 * (1 - t) * t * 100 +
        t * t * 188;
      const y =
        (1 - t) * (1 - t) * 40 +
        2 * (1 - t) * t * midYNum +
        t * t * 40;

      this.thumbEl.setAttribute('cx', x.toFixed(1));
      this.thumbEl.setAttribute('cy', y.toFixed(1));
    }
  }

  public animateEntrance(reducedMotion = false): void {
    if (reducedMotion) {
      this.arcCurveAmount = 1.0;
      if (this.trackEl) this.trackEl.style.strokeDashoffset = '0';
      if (this.flipperEl) gsap.set(this.flipperEl, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    this.arcCurveAmount = 0.0;
    gsap.killTweensOf(this);
    if (this.trackEl) gsap.killTweensOf(this.trackEl);
    if (this.flipperEl) gsap.killTweensOf(this.flipperEl);

    // 1. In-camera SVG path stroke draw (animaxxing/svg-effects)
    if (this.trackEl) {
      gsap.fromTo(
        this.trackEl,
        { strokeDashoffset: this.pathLength },
        {
          strokeDashoffset: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.15
        }
      );
    }

    // 2. Arc curve vertical relaxation
    gsap.to(this, {
      arcCurveAmount: 1.0,
      duration: 1.4,
      ease: 'expo.out',
      delay: 0.1
    });

    // 3. Freestanding Cuboid Flipper spring entrance
    if (this.flipperEl) {
      gsap.fromTo(
        this.flipperEl,
        { opacity: 0, y: 14, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          delay: 0.3
        }
      );
    }
  }

  public setVisible(visible: boolean): void {
    if (visible) {
      this.root.classList.remove('is-hidden');
    } else {
      this.root.classList.add('is-hidden');
    }
  }

  public destroy(): void {
    gsap.killTweensOf(this);
    if (this.trackEl) gsap.killTweensOf(this.trackEl);
    if (this.flipperEl) gsap.killTweensOf(this.flipperEl);
    this.root.remove();
  }
}

