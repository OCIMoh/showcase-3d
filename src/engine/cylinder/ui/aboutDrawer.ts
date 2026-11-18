/**
 * About Studio Drawer Component
 * Upgraded for Phase 3:
 * - 100% Zero repository links and zero external redirects
 * - Curated Selected Works list with in-situ interactive preview
 * - Kinetic staggered entrance reveals via GSAP
 * - Pointer drag-to-dismiss gesture with spring return
 * - Magnetic attraction on Close and Action buttons
 * - Tactile acoustic micro-interactions
 */

import gsap from 'gsap';
import { BrandConfig } from '../core/config';
import { ShowcaseProject } from '../../../data/showcaseProjects';
import { attachMagneticEffect } from './overlay';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class AboutDrawerComponent {
  public root: HTMLElement;
  private panelEl: HTMLElement;
  private backdropEl: HTMLElement;
  private closeBtn: HTMLButtonElement;
  private actionBtn: HTMLElement | null = null;
  private onCloseCallback?: () => void;
  private onSelectProject?: (proj: ShowcaseProject) => void;
  private cleanupFns: Array<() => void> = [];
  private isAnimating = false;

  // Drag-to-dismiss state
  private isDragging = false;
  private dragStartX = 0;
  private currentDragX = 0;

  constructor(
    parent: HTMLElement,
    brand: BrandConfig,
    projects: ShowcaseProject[],
    onClose?: () => void,
    onSelectProject?: (proj: ShowcaseProject) => void
  ) {
    this.onCloseCallback = onClose;
    this.onSelectProject = onSelectProject;

    this.root = document.createElement('aside');
    this.root.className = 'ma-drawer ma-drawer--about';
    this.root.id = 'maAboutDrawer';
    this.root.setAttribute('aria-label', 'About Studio');
    this.root.setAttribute('aria-hidden', 'true');

    this.root.innerHTML = `
      <div class="ma-drawer__backdrop" id="maAboutBackdrop"></div>
      <div class="ma-drawer__panel" id="maAboutPanel">
        <div class="ma-drawer__drag-handle" id="maAboutDragHandle" aria-hidden="true"></div>
        <div class="ma-drawer__bar">
          <span class="ma-drawer__badge">${escapeHtml(brand.badge)}</span>
          <button class="ma-drawer__close-btn" id="maAboutClose" type="button" aria-label="Close About Drawer">
            <span>CLOSE [ESC]</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="ma-drawer__scroll">
          <div class="ma-about__section ma-about__section--hero">
            <h2 class="ma-about__headline">${escapeHtml(brand.aboutHeadline)}</h2>
            <p class="ma-about__bio">${escapeHtml(brand.aboutBio)}</p>
          </div>

          <div class="ma-about__grid">
            <div class="ma-about__col">
              <h4 class="ma-about__col-title">CORE DISCIPLINES</h4>
              <ul class="ma-about__list ma-about__list--disciplines">
                <li><span class="ma-bullet">•</span> Native WebGL & GLSL Shaders</li>
                <li><span class="ma-bullet">•</span> 3D Cylindrical Geometry & Vertex Bending</li>
                <li><span class="ma-bullet">•</span> In-Situ Mesh Expansion Transitions</li>
                <li><span class="ma-bullet">•</span> 3D Vertical Barrel Galleries</li>
                <li><span class="ma-bullet">•</span> Generative Web Audio Synthesis</li>
                <li><span class="ma-bullet">•</span> Kinetic Fluid Typography & Physics</li>
              </ul>
            </div>
            <div class="ma-about__col">
              <h4 class="ma-about__col-title">SELECTED WORKS</h4>
              <ul class="ma-about__list ma-about__list--works" id="maAboutWorksList"></ul>
            </div>
          </div>

          <div class="ma-about__actions">
            <a href="mailto:${escapeHtml(brand.contactEmail)}" class="ma-btn ma-btn--primary" id="maAboutActionBtn">
              <span>START A PROJECT ↗</span>
            </a>
            <div class="ma-about__colophon">
              <span>EDITION 2026 // ALL ASSETS IN-SITU</span>
            </div>
          </div>
        </div>
      </div>
    `;

    parent.appendChild(this.root);

    this.panelEl = this.root.querySelector('#maAboutPanel') as HTMLElement;
    this.backdropEl = this.root.querySelector('#maAboutBackdrop') as HTMLElement;
    this.closeBtn = this.root.querySelector('#maAboutClose') as HTMLButtonElement;
    this.actionBtn = this.root.querySelector('#maAboutActionBtn') as HTMLElement;

    // Populate Selected Works with In-Situ Click Navigation (Zero external repo links!)
    const listEl = this.root.querySelector('#maAboutWorksList');
    if (listEl) {
      projects.slice(0, 6).forEach((p) => {
        const li = document.createElement('li');
        li.className = 'ma-about__work-item';
        li.setAttribute('role', 'button');
        li.setAttribute('tabindex', '0');
        li.setAttribute('aria-label', `View ${p.title}`);

        const shortTitle = p.title.split('—')[0].trim();
        const shortCat = p.category.split('//')[0].trim();

        li.innerHTML = `
          <div class="ma-about__work-item-inner">
            <span class="ma-about__work-title">${escapeHtml(shortTitle)}</span>
            <span class="ma-about__work-meta">${escapeHtml(shortCat)}</span>
          </div>
          <span class="ma-about__work-arrow">→</span>
        `;

        li.addEventListener('click', () => {
          this.close();
          this.onSelectProject?.(p);
        });

        li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.close();
            this.onSelectProject?.(p);
          }
        });

        listEl.appendChild(li);
      });
    }

    this.closeBtn.addEventListener('click', () => this.close());
    this.backdropEl.addEventListener('click', () => this.close());

    // Attach Magnetic Physics to Close and Action Buttons
    this.cleanupFns.push(attachMagneticEffect(this.closeBtn, { maxDistance: 45, pullFactor: 0.32, rotateIcon: true }));
    if (this.actionBtn) {
      this.cleanupFns.push(attachMagneticEffect(this.actionBtn, { maxDistance: 45, pullFactor: 0.28 }));
    }

    // Attach Pointer Drag-To-Dismiss Gestures
    this.initDragToDismiss();
  }

  /**
   * Gesture recognizer: lets the user drag or swipe the drawer panel rightward to dismiss.
   */
  private initDragToDismiss(): void {
    const onPointerDown = (e: PointerEvent) => {
      // Only drag if originating from handle or top bar or within panel margins
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('.ma-about__work-item')) {
        return;
      }

      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.currentDragX = 0;
      this.panelEl.setPointerCapture?.(e.pointerId);
      gsap.killTweensOf(this.panelEl);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = Math.max(0, e.clientX - this.dragStartX);
      this.currentDragX = dx;
      gsap.set(this.panelEl, { x: dx });
      // Fade backdrop as dragged out
      const progress = Math.min(1, dx / 400);
      gsap.set(this.backdropEl, { opacity: 1 - progress * 0.7 });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      try {
        this.panelEl.releasePointerCapture?.(e.pointerId);
      } catch {
        // no-op
      }

      if (this.currentDragX > 90) {
        // Dismiss
        this.close();
      } else {
        // Elastic snap back
        gsap.to(this.panelEl, {
          x: 0,
          duration: 0.45,
          ease: 'power3.out'
        });
        gsap.to(this.backdropEl, {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out'
        });
      }
    };

    this.panelEl.addEventListener('pointerdown', onPointerDown);
    this.panelEl.addEventListener('pointermove', onPointerMove);
    this.panelEl.addEventListener('pointerup', onPointerUp);
    this.panelEl.addEventListener('pointercancel', onPointerUp);

    this.cleanupFns.push(() => {
      this.panelEl.removeEventListener('pointerdown', onPointerDown);
      this.panelEl.removeEventListener('pointermove', onPointerMove);
      this.panelEl.removeEventListener('pointerup', onPointerUp);
      this.panelEl.removeEventListener('pointercancel', onPointerUp);
    });
  }

  /**
   * Opens the drawer with kinetic staggered entrance choreography.
   */
  public open(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    this.root.classList.add('is-open');
    this.root.setAttribute('aria-hidden', 'false');

    gsap.killTweensOf([this.panelEl, this.backdropEl]);

    // Panel slide-in
    gsap.fromTo(
      this.panelEl,
      { x: '100%' },
      {
        x: '0%',
        duration: 0.55,
        ease: 'power3.out',
        onComplete: () => {
          this.isAnimating = false;
        }
      }
    );

    // Backdrop fade
    gsap.fromTo(
      this.backdropEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.45, ease: 'power2.out' }
    );

    // Kinetic Staggered Cascade for Inner Editorial Elements
    const barEl = this.root.querySelector('.ma-drawer__bar');
    const headlineEl = this.root.querySelector('.ma-about__headline');
    const bioEl = this.root.querySelector('.ma-about__bio');
    const cols = Array.from(this.root.querySelectorAll('.ma-about__col'));
    const items = Array.from(this.root.querySelectorAll('.ma-about__list li'));
    const actionsEl = this.root.querySelector('.ma-about__actions');

    const tl = gsap.timeline({ delay: 0.12 });

    if (barEl) {
      tl.fromTo(barEl, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0);
    }
    if (headlineEl) {
      tl.fromTo(headlineEl, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.06);
    }
    if (bioEl) {
      tl.fromTo(bioEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.12);
    }
    if (cols.length > 0) {
      tl.fromTo(cols, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.35, ease: 'power2.out' }, 0.18);
    }
    if (items.length > 0) {
      tl.fromTo(items, { opacity: 0, x: 8 }, { opacity: 1, x: 0, stagger: 0.025, duration: 0.3, ease: 'power2.out' }, 0.24);
    }
    if (actionsEl) {
      tl.fromTo(actionsEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.3);
    }
  }

  /**
   * Closes the drawer with smooth acceleration exit.
   */
  public close(): void {
    if (!this.isOpen()) return;

    gsap.killTweensOf([this.panelEl, this.backdropEl]);

    gsap.to(this.panelEl, {
      x: '100%',
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => {
        this.root.classList.remove('is-open');
        this.root.setAttribute('aria-hidden', 'true');
        gsap.set(this.panelEl, { x: '100%' });
        this.onCloseCallback?.();
      }
    });

    gsap.to(this.backdropEl, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in'
    });
  }

  public isOpen(): boolean {
    return this.root.classList.contains('is-open');
  }

  public destroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    gsap.killTweensOf(this.panelEl);
    gsap.killTweensOf(this.backdropEl);
    this.root.remove();
  }
}
