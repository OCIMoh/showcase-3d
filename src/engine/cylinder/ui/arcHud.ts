/**
 * Arc HUD Component: Bottom dynamic curved SVG trajectory with scrub thumb
 * Upgraded with:
 * - 3D Barrel Cuboid Tumbler with Reactive Rigid-Body Mechanics
 * - Housner Tipping-Point Non-Linear Potential Well Dynamics (45° threshold snap)
 * - Elastic Restitution Micro-Recoil Shudder on Flat-Face Landing
 * - Geometric Center-of-Mass Vertical Bob (1.414x corner apex translation)
 * - Dynamic Rotational Squish & Stretch with Velocity
 * - Direct 3D Cursor Perspective Tilt on Hover
 * - In-camera SVG path stroke draw on entrance
 * - Spring-tension glider bead with physical lead/lag
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
  private projectTitles: string[];

  // --- Reactive Rigid-Body Physics State ---
  private currentDrumAngle = 0;      // Current rotational position in degrees
  private drumAngularVel = 0;        // Angular velocity (deg/frame)
  private recoilOffset = 0;          // Dynamic restitution micro-shudder angle (deg)
  private recoilVel = 0;             // Recoil velocity
  private lastLatchQuadrant = 0;     // Last crossed 90-degree quadrant for landing impact
  private targetTiltX = 0;           // Direct cursor interactive tilt (X)
  private targetTiltY = 0;           // Direct cursor interactive tilt (Y)
  private currentTiltX = 0;
  private currentTiltY = 0;
  private cleanupFns: Array<() => void> = [];

  constructor(parent: HTMLElement, projectTitles: string[] = ['Touché']) {
    this.projectTitles = projectTitles.length > 0 ? projectTitles : ['Touché'];
    this.root = document.createElement('footer');
    this.root.className = 'ma-arc-hud';
    this.root.id = 'maArcHud';
    this.root.setAttribute('aria-label', 'Carousel Arc Scrubber');

    // Build True 4-Sided 90° Rectangular Cuboid Geometry (H=25.2px, D=25.2px, R=12.6px — 5% height increase)
    const halfD = 13;
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
      <div class="ma-cuboid-cap ma-cuboid-cap--left" style="transform: translateX(-${halfD}px) rotateY(-90deg);"></div>
      <div class="ma-cuboid-cap ma-cuboid-cap--right" style="transform: translateX(${halfD}px) rotateY(90deg);"></div>
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

    // Direct Pointer Reactive Tilt on Tumbler
    this.initInteractiveTilt();
  }

  /**
   * Directly reacts to cursor proximity over the tumbler with 3D perspective tilting.
   */
  private initInteractiveTilt(): void {
    if (!this.flipperEl) return;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = this.flipperEl.getBoundingClientRect();
      const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      this.targetTiltY = Math.max(-12, Math.min(12, nx * 9.5));
      this.targetTiltX = Math.max(-8, Math.min(8, -ny * 7.5));
    };

    const onPointerLeave = () => {
      this.targetTiltY = 0;
      this.targetTiltX = 0;
    };

    this.flipperEl.addEventListener('pointermove', onPointerMove);
    this.flipperEl.addEventListener('pointerleave', onPointerLeave);

    this.cleanupFns.push(() => {
      this.flipperEl.removeEventListener('pointermove', onPointerMove);
      this.flipperEl.removeEventListener('pointerleave', onPointerLeave);
    });
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

    // 2. --- Reactive Rigid-Body Tumbler Mechanics ---
    const targetContinuousAngle = -continuousProgress * 90;

    // A. Housner Tipping Dynamics: Non-linear magnetic potential well
    // At 45 deg, the 1.414x corner reaches tipping apex; magnetic pull accelerates forward into flat face
    const quadPhase = (((targetContinuousAngle % 90) + 90) % 90);
    const radPhase = (quadPhase / 90) * Math.PI; // 0 to PI
    const tippingPull = -Math.sin(2 * radPhase) * 3.8;
    const physicalTargetAngle = targetContinuousAngle + tippingPull;

    // B. Rotational Spring-Damper Inertia
    const deltaAngle = physicalTargetAngle - this.currentDrumAngle;
    const springForce = deltaAngle * 0.36;
    this.drumAngularVel = (this.drumAngularVel + springForce) * 0.72;
    this.currentDrumAngle += this.drumAngularVel;

    // C. Elastic Restitution (Flat-Face Impact Shudder)
    // Detect when crossing near a 90-degree quadrant
    const currentQuad = Math.round(this.currentDrumAngle / 90);
    if (currentQuad !== this.lastLatchQuadrant) {
      this.lastLatchQuadrant = currentQuad;
      const impactSpeed = Math.abs(this.drumAngularVel);
      if (impactSpeed > 0.6) {
        this.recoilVel = -Math.sign(this.drumAngularVel) * Math.min(3.2, impactSpeed * 0.24);
      }
    }

    // Step restitution spring (decaying 2-cycle micro-shudder)
    this.recoilOffset += this.recoilVel;
    this.recoilVel = (this.recoilVel - this.recoilOffset * 0.48) * 0.64;
    if (Math.abs(this.recoilOffset) < 0.01 && Math.abs(this.recoilVel) < 0.01) {
      this.recoilOffset = 0;
      this.recoilVel = 0;
    }

    // D. Geometric Center-of-Mass Vertical Bob
    // Corner apex is 1.414x longer than flat face (16.97px vs 12px), causing physical vertical lift
    const totalDisplayAngle = this.currentDrumAngle + this.recoilOffset + this.currentTiltX;
    const radAngle = (totalDisplayAngle * Math.PI) / 180;
    const bobY = -Math.abs(Math.sin(2 * radAngle)) * 2.2;

    // E. Dynamic Rotational Velocity Squish & Stretch
    const absSpeed = Math.abs(this.drumAngularVel);
    const squishY = Math.max(0.92, 1.0 - absSpeed * 0.0035);
    const stretchZ = Math.min(1.08, 1.0 + absSpeed * 0.0025);

    // F. Cursor Interactive Tilt Damping
    this.currentTiltX += (this.targetTiltX - this.currentTiltX) * 0.16;
    this.currentTiltY += (this.targetTiltY - this.currentTiltY) * 0.16;

    // G. Apply Full 3D Physics Matrix Transform
    if (this.drumRingEl) {
      this.drumRingEl.style.transform = `translateY(${bobY.toFixed(2)}px) rotateY(${this.currentTiltY.toFixed(2)}deg) rotateX(${totalDisplayAngle.toFixed(2)}deg) scaleY(${squishY.toFixed(3)}) scaleZ(${stretchZ.toFixed(3)})`;

      // H. Directional Dynamic Cosine Lighting (reacts to bounce & cursor tilt)
      for (let f = 0; f < 4; f++) {
        const phi = f * (Math.PI / 2) + radAngle;
        const cosVal = Math.cos(phi);
        const facet = this.facetEls[f];
        if (facet) {
          if (cosVal > 0.04) {
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

    // 3. Sync SVG track path curve
    if (this.trackEl) {
      const midY = (8 * this.arcCurveAmount + 40 * (1 - this.arcCurveAmount)).toFixed(1);
      this.trackEl.setAttribute('d', `M 12 40 Q 100 ${midY} 188 40`);
    }

    // 4. Move thumb along quadratic bezier with organic spring follow
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

    // 1. In-camera SVG path stroke draw
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
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    gsap.killTweensOf(this);
    if (this.trackEl) gsap.killTweensOf(this.trackEl);
    if (this.flipperEl) gsap.killTweensOf(this.flipperEl);
    this.root.remove();
  }
}
