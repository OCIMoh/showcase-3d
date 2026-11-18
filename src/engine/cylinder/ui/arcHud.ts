/**
 * Arc HUD Component: Bottom dynamic curved SVG trajectory with scrub thumb & active title
 */

import gsap from 'gsap';

export class ArcHudComponent {
  public root: HTMLElement;
  private trackEl: SVGPathElement;
  private thumbEl: SVGCircleElement;
  private titleEl: HTMLElement;
  public arcCurveAmount = 1.0;
  private currentActiveIndex = -1;

  constructor(parent: HTMLElement, initialTitle = 'Repositories') {
    this.root = document.createElement('footer');
    this.root.className = 'ma-arc-hud';
    this.root.id = 'maArcHud';
    this.root.setAttribute('aria-label', 'Carousel Arc Scrubber');

    this.root.innerHTML = `
      <div class="ma-arc-hud__arc-wrap">
        <svg class="ma-arc-hud__svg" viewBox="0 0 200 48" preserveAspectRatio="none">
          <path class="ma-arc-hud__track" id="maArcTrack" d="M 12 40 Q 100 8 188 40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
          <circle class="ma-arc-hud__thumb" id="maArcThumb" cx="100" cy="8" r="3.2" fill="#ffffff" />
        </svg>
      </div>
      <div class="ma-arc-hud__title" id="maArcTitle"></div>
    `;

    parent.appendChild(this.root);

    this.trackEl = this.root.querySelector('#maArcTrack') as unknown as SVGPathElement;
    this.thumbEl = this.root.querySelector('#maArcThumb') as unknown as SVGCircleElement;
    this.titleEl = this.root.querySelector('#maArcTitle')!;
    this.titleEl.textContent = initialTitle;
  }

  public update(
    normIndex: number,
    totalItems: number,
    activeTitle: string,
    onIndexChange?: (newIndex: number) => void
  ): void {
    const activeIdx = Math.round(normIndex) % totalItems;
    if (activeIdx !== this.currentActiveIndex) {
      this.currentActiveIndex = activeIdx;
      this.titleEl.textContent = activeTitle;
      onIndexChange?.(activeIdx);
    }

    // Sync SVG track path curve
    if (this.trackEl) {
      const midY = (8 * this.arcCurveAmount + 40 * (1 - this.arcCurveAmount)).toFixed(1);
      this.trackEl.setAttribute('d', `M 12 40 Q 100 ${midY} 188 40`);
    }

    // Move thumb along quadratic bezier
    if (this.thumbEl) {
      const t = totalItems > 1 ? normIndex / (totalItems - 1) : 0.5;
      const clampedT = Math.max(0, Math.min(1, t));

      const x =
        (1 - clampedT) * (1 - clampedT) * 12 +
        2 * (1 - clampedT) * clampedT * 100 +
        clampedT * clampedT * 188;
      const y =
        (1 - clampedT) * (1 - clampedT) * 40 +
        2 * (1 - clampedT) * clampedT * (8 * this.arcCurveAmount + 40 * (1 - this.arcCurveAmount)) +
        clampedT * clampedT * 40;

      this.thumbEl.setAttribute('cx', x.toFixed(1));
      this.thumbEl.setAttribute('cy', y.toFixed(1));
    }
  }

  public animateEntrance(reducedMotion = false): void {
    if (reducedMotion) {
      this.arcCurveAmount = 1.0;
      return;
    }
    this.arcCurveAmount = 0.0;
    gsap.killTweensOf(this);
    gsap.to(this, {
      arcCurveAmount: 1.0,
      duration: 1.65,
      ease: 'expo.out'
    });
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
    this.root.remove();
  }
}

