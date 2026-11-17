/**
 * Virtual Smooth Scroll Controller using Lenis
 */

import Lenis from 'lenis';

export let globalScrollManager: ScrollManager | null = null;

export class ScrollManager {
  private lenis: Lenis | null = null;
  private rafId: number | null = null;

  constructor() {
    this.init();
    globalScrollManager = this;
  }

  private init(): void {
    try {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 1.8
      });

      const raf = (time: number) => {
        this.lenis?.raf(time);
        this.rafId = requestAnimationFrame(raf);
      };

      this.rafId = requestAnimationFrame(raf);
    } catch (err) {
      console.warn('Lenis smooth scroll fallback to native scroll', err);
    }
  }

  public scrollTo(target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean }): void {
    this.lenis?.scrollTo(target, options);
  }

  public stop(): void {
    this.lenis?.stop();
  }

  public start(): void {
    this.lenis?.start();
  }

  public destroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lenis?.destroy();
  }
}

