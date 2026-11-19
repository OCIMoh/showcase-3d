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
import * as d3 from 'd3';
import { escapeHtml } from '../utils/html';

export { escapeHtml };

export interface ArcHudCallbacks {
  onSelectProject?: () => void;
  onDragDelta?: (deltaProgress: number) => void;
  onFling?: (vy: number) => void;
  onScrubProgress?: (t: number) => void;
}

export class ArcHudComponent {
  public root: HTMLElement;
  private trackEl: SVGPathElement;
  private thumbEl: SVGCircleElement;
  private thumbGlowEl: SVGCircleElement;
  private ticksGroup: SVGGElement;
  private flipperEl: HTMLElement;
  private drumRingEl: HTMLElement;
  private faceTitleEls: HTMLElement[] = [];
  private facetEls: HTMLElement[] = [];
  private lastPopulatedK = -999999;
  private callbacks?: ArcHudCallbacks;

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

  constructor(
    parent: HTMLElement,
    projectTitles: string[] = ['Touché'],
    callbacks?: ArcHudCallbacks
  ) {
    this.projectTitles = projectTitles.length > 0 ? projectTitles : ['Touché'];
    this.callbacks = callbacks;
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
          <div class="ma-cuboid-gleam"></div>
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
          <g class="ma-arc-hud__ticks" id="maArcTicks"></g>
          <circle class="ma-arc-hud__thumb-glow" id="maArcThumbGlow" cx="100" cy="8" r="6" fill="rgba(255,255,255,0.18)" />
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
    this.thumbGlowEl = this.root.querySelector('#maArcThumbGlow') as unknown as SVGCircleElement;
    this.ticksGroup = this.root.querySelector('#maArcTicks') as unknown as SVGGElement;
    this.flipperEl = this.root.querySelector('#maCuboidFlipper') as HTMLElement;
    this.drumRingEl = this.root.querySelector('#maCuboidRing') as HTMLElement;

    this.faceTitleEls = Array.from(this.root.querySelectorAll('.ma-cuboid-facet__title')) as HTMLElement[];
    this.facetEls = Array.from(this.root.querySelectorAll('.ma-cuboid-facet')) as HTMLElement[];

    // Render initial D3 ticks
    this.renderD3Ticks(8);

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

    // Direct Pointer Reactive Tilt, Drag & Flick on Tumbler
    this.initInteractiveTumbler();

    // Direct Interactive D3 Arc Scrubbing
    this.initInteractiveArcScrub();
  }

  /**
   * Generates D3 Swiss Chronograph Bezel Telemetry Ticks perpendicular to the quadratic arc curve.
   */
  private renderD3Ticks(midY: number): void {
    if (!this.ticksGroup) return;

    const numTicks = 25;
    const tickIndices = d3.range(numTicks);
    const tScale = d3.scaleLinear().domain([0, numTicks - 1]).range([0, 1]);

    const tickData = tickIndices.map(i => {
      const t = tScale(i);
      // Quadratic bezier point:
      const x = (1 - t) * (1 - t) * 12 + 2 * (1 - t) * t * 100 + t * t * 188;
      const y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * midY + t * t * 40;

      // Tangent vector:
      const tx = 176;
      const ty = 2 * (1 - 2 * t) * (midY - 40);
      const len = Math.max(0.001, Math.sqrt(tx * tx + ty * ty));

      // Unit normal perpendicular to arc:
      const nx = ty / len;
      const ny = -tx / len;

      const isMajor = i % 4 === 0;
      const tickLen = isMajor ? 4.2 : 2.2;

      return {
        i,
        t,
        isMajor,
        x1: x,
        y1: y,
        x2: x + nx * tickLen,
        y2: y + ny * tickLen
      };
    });

    d3.select(this.ticksGroup)
      .selectAll<SVGLineElement, typeof tickData[0]>('line.ma-arc-tick')
      .data(tickData, (d: any) => d.i)
      .join(
        enter => enter.append('line')
          .attr('class', d => `ma-arc-tick ${d.isMajor ? 'ma-arc-tick--major' : ''}`)
          .attr('stroke', d => d.isMajor ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.18)')
          .attr('stroke-width', d => d.isMajor ? 1.2 : 0.8)
          .attr('x1', d => d.x1.toFixed(2))
          .attr('y1', d => d.y1.toFixed(2))
          .attr('x2', d => d.x2.toFixed(2))
          .attr('y2', d => d.y2.toFixed(2)),
        update => update
          .attr('x1', d => d.x1.toFixed(2))
          .attr('y1', d => d.y1.toFixed(2))
          .attr('x2', d => d.x2.toFixed(2))
          .attr('y2', d => d.y2.toFixed(2))
      );
  }

  /**
   * #1 Direct Drag & Flick Interaction + 3D Perspective Tilt on Tumbler
   */
  private initInteractiveTumbler(): void {
    if (!this.flipperEl) return;

    let isPointerDown = false;
    let startY = 0;
    let startX = 0;
    let lastY = 0;
    let lastTime = 0;
    let vy = 0;
    let hasMoved = false;

    const onPointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      isPointerDown = true;
      hasMoved = false;
      startY = e.clientY;
      startX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      vy = 0;
      try {
        this.flipperEl.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        const rect = this.flipperEl.getBoundingClientRect();
        const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        this.targetTiltY = Math.max(-12, Math.min(12, nx * 9.5));
        this.targetTiltX = Math.max(-8, Math.min(8, -ny * 7.5));
      }

      if (!isPointerDown) return;
      e.stopPropagation();

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dy = e.clientY - lastY;
      const totalDist = Math.hypot(e.clientX - startX, e.clientY - startY);

      if (totalDist > 4) {
        hasMoved = true;
      }

      if (hasMoved) {
        vy = dy / dt;
        // Dragging up (dy < 0) advances forward to next project
        const delta = -dy * 0.035;
        this.callbacks?.onDragDelta?.(delta);
      }

      lastY = e.clientY;
      lastTime = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      e.stopPropagation();
      isPointerDown = false;
      try {
        this.flipperEl.releasePointerCapture(e.pointerId);
      } catch {}

      if (hasMoved) {
        // Fling with velocity
        this.callbacks?.onFling?.(-vy * 16);
      } else {
        // #2 Click-to-Inspect: Open Case Study
        this.handleTumblerClick();
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      try {
        this.flipperEl.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerEnter = () => {
      const currentQuad = Math.round(this.currentDrumAngle / 90);
      const frontFaceIdx = ((currentQuad % 4) + 4) % 4;
      const frontFacet = this.facetEls[frontFaceIdx];
      const gleam = frontFacet?.querySelector('.ma-cuboid-gleam');
      if (gleam) {
        gsap.fromTo(gleam,
          { xPercent: -150, opacity: 0 },
          { xPercent: 150, opacity: 0.55, duration: 0.48, ease: 'power2.out' }
        );
      }
    };

    const onPointerLeave = () => {
      this.targetTiltY = 0;
      this.targetTiltX = 0;
    };

    this.flipperEl.addEventListener('pointerdown', onPointerDown);
    this.flipperEl.addEventListener('pointermove', onPointerMove);
    this.flipperEl.addEventListener('pointerup', onPointerUp);
    this.flipperEl.addEventListener('pointercancel', onPointerCancel);
    this.flipperEl.addEventListener('pointerenter', onPointerEnter);
    this.flipperEl.addEventListener('pointerleave', onPointerLeave);

    this.cleanupFns.push(() => {
      this.flipperEl.removeEventListener('pointerdown', onPointerDown);
      this.flipperEl.removeEventListener('pointermove', onPointerMove);
      this.flipperEl.removeEventListener('pointerup', onPointerUp);
      this.flipperEl.removeEventListener('pointercancel', onPointerCancel);
      this.flipperEl.removeEventListener('pointerenter', onPointerEnter);
      this.flipperEl.removeEventListener('pointerleave', onPointerLeave);
    });
  }

  /**
   * #2 Click-to-Inspect: Tactile micro-press spring recoil and case study trigger.
   */
  private handleTumblerClick(): void {
    gsap.fromTo(
      this.flipperEl,
      { scale: 0.94, y: 2 },
      { scale: 1.0, y: 0, duration: 0.35, ease: 'back.out(2.5)' }
    );

    const currentQuad = Math.round(this.currentDrumAngle / 90);
    const frontFaceIdx = ((currentQuad % 4) + 4) % 4;
    const frontFacet = this.facetEls[frontFaceIdx];
    const gleam = frontFacet?.querySelector('.ma-cuboid-gleam');
    if (gleam) {
      gsap.fromTo(gleam,
        { xPercent: -150, opacity: 0 },
        { xPercent: 150, opacity: 0.85, duration: 0.45, ease: 'power2.out' }
      );
    }

    this.callbacks?.onSelectProject?.();
  }

  /**
   * #4 Interactive D3 Arc Scrubbing: Direct click & drag anywhere on the curved arc track.
   */
  private initInteractiveArcScrub(): void {
    const arcWrap = this.root.querySelector('.ma-arc-hud__arc-wrap') as HTMLElement;
    if (!arcWrap) return;

    let isScrubbing = false;

    const updateScrub = (e: PointerEvent) => {
      const rect = arcWrap.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width;
      // Track spans from x=12 to x=188 on 200px viewBox (~6% margins)
      const t = Math.max(0, Math.min(1, (normX - 0.06) / 0.88));
      this.callbacks?.onScrubProgress?.(t);
    };

    const onPointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      isScrubbing = true;
      try {
        arcWrap.setPointerCapture(e.pointerId);
      } catch {}
      updateScrub(e);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isScrubbing) return;
      e.stopPropagation();
      updateScrub(e);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isScrubbing) return;
      e.stopPropagation();
      isScrubbing = false;
      try {
        arcWrap.releasePointerCapture(e.pointerId);
      } catch {}
    };

    arcWrap.addEventListener('pointerdown', onPointerDown);
    arcWrap.addEventListener('pointermove', onPointerMove);
    arcWrap.addEventListener('pointerup', onPointerUp);
    arcWrap.addEventListener('pointercancel', onPointerUp);

    this.cleanupFns.push(() => {
      arcWrap.removeEventListener('pointerdown', onPointerDown);
      arcWrap.removeEventListener('pointermove', onPointerMove);
      arcWrap.removeEventListener('pointerup', onPointerUp);
      arcWrap.removeEventListener('pointercancel', onPointerUp);
    });
  }

  public getBounds(): DOMRect {
    return this.flipperEl.getBoundingClientRect();
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
    const quadPhase = (((targetContinuousAngle % 90) + 90) % 90);
    const radPhase = (quadPhase / 90) * Math.PI;
    const tippingPull = -Math.sin(2 * radPhase) * 3.8;
    const physicalTargetAngle = targetContinuousAngle + tippingPull;

    // B. Rotational Spring-Damper Inertia
    const deltaAngle = physicalTargetAngle - this.currentDrumAngle;
    const springForce = deltaAngle * 0.36;
    this.drumAngularVel = (this.drumAngularVel + springForce) * 0.72;
    this.currentDrumAngle += this.drumAngularVel;

    // C. Elastic Restitution (Flat-Face Impact Shudder & Specular Caustic Gleam)
    const currentQuad = Math.round(this.currentDrumAngle / 90);
    if (currentQuad !== this.lastLatchQuadrant) {
      this.lastLatchQuadrant = currentQuad;
      const impactSpeed = Math.abs(this.drumAngularVel);
      if (impactSpeed > 0.6) {
        this.recoilVel = -Math.sign(this.drumAngularVel) * Math.min(3.2, impactSpeed * 0.24);
      }

      // Trigger specular caustic gleam sweep across the front facet
      const frontFaceIdx = ((currentQuad % 4) + 4) % 4;
      const frontFacet = this.facetEls[frontFaceIdx];
      const gleam = frontFacet?.querySelector('.ma-cuboid-gleam');
      if (gleam) {
        gsap.fromTo(gleam,
          { xPercent: -150, opacity: 0 },
          { xPercent: 150, opacity: 0.75, duration: 0.52, ease: 'power2.out' }
        );
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

      // H. Directional Dynamic Cosine Lighting
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

    // 3. Sync SVG track path curve & D3 chronograph ticks
    const midYNum = 8 * this.arcCurveAmount + 40 * (1 - this.arcCurveAmount);
    if (this.trackEl) {
      this.trackEl.setAttribute('d', `M 12 40 Q 100 ${midYNum.toFixed(1)} 188 40`);
    }
    this.renderD3Ticks(midYNum);

    // 4. Move thumb & glow along quadratic bezier with organic spring follow & D3 telemetry highlights
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

      if (this.thumbGlowEl) {
        this.thumbGlowEl.setAttribute('cx', x.toFixed(1));
        this.thumbGlowEl.setAttribute('cy', y.toFixed(1));
        const absVel = Math.abs(this.drumAngularVel);
        const glowR = 4.8 + Math.min(5.5, absVel * 0.32);
        this.thumbGlowEl.setAttribute('r', glowR.toFixed(1));
        const glowOpacity = 0.15 + Math.min(0.35, absVel * 0.04);
        this.thumbGlowEl.setAttribute('fill', `rgba(255,255,255,${glowOpacity.toFixed(2)})`);
      }

      // D3 proximity telemetry: illuminate ticks near thumb
      const currentT = this.currentT;
      d3.select(this.ticksGroup)
        .selectAll<SVGLineElement, { t: number; isMajor: boolean }>('line.ma-arc-tick')
        .each(function(d: any) {
          if (!d) return;
          const dist = Math.abs(d.t - currentT);
          const proximity = Math.max(0, 1 - dist / 0.14);
          if (proximity > 0) {
            const baseOp = d.isMajor ? 0.36 : 0.18;
            const op = baseOp + proximity * (1 - baseOp);
            const color = d3.interpolateRgb('rgba(255,255,255,0.22)', '#ffffff')(proximity);
            this.setAttribute('opacity', op.toFixed(2));
            this.setAttribute('stroke', color);
            if (proximity > 0.65) {
              this.classList.add('ma-arc-tick--active');
            } else {
              this.classList.remove('ma-arc-tick--active');
            }
          } else {
            this.setAttribute('opacity', (d.isMajor ? 0.36 : 0.18).toString());
            this.setAttribute('stroke', d.isMajor ? 'rgba(255,255,255,0.36)' : 'rgba(255,255,255,0.18)');
            this.classList.remove('ma-arc-tick--active');
          }
        });
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

    // 2. D3 Staggered tick entrance
    if (this.ticksGroup) {
      d3.select(this.ticksGroup)
        .selectAll('line.ma-arc-tick')
        .style('opacity', 0)
        .transition()
        .delay((_d: any, i: number) => 220 + i * 16)
        .duration(420)
        .style('opacity', (d: any) => d?.isMajor ? 0.36 : 0.18);
    }

    // 3. Arc curve vertical relaxation
    gsap.to(this, {
      arcCurveAmount: 1.0,
      duration: 1.4,
      ease: 'expo.out',
      delay: 0.1
    });

    // 4. Freestanding Cuboid Flipper spring entrance
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
