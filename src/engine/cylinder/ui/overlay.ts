/**
 * DOM Overlay Management: Minimal Header, In-Situ 3D Barrel HUD Overlay, Accessible SEO Nav
 * Upgraded with Phase 2 Animaxxing:
 * - Directional Kinetic Title Switcher (dual-buffer sliding typography with motion blur)
 * - Magnetic Tactile Interaction on action buttons (elastic spring physics)
 * - Staggered Top-Bar Info Entrance & Line-Mask Reveals
 */

import gsap from 'gsap';
import { BrandConfig } from '../core/config';
import { ShowcaseProject } from '../../../data/showcaseProjects';
import { escapeHtml } from './aboutDrawer';

export interface OverlayCallbacks {
  onCloseCaseStudy: () => void;
  onNextProject: () => void;
  onPrevProject: () => void;
  onToggleSound: () => void;
  onOpenAbout?: () => void;
}

export interface MagneticOptions {
  maxDistance?: number;
  pullFactor?: number;
  rotateIcon?: boolean;
}

/**
 * Creates physical magnetic cursor attraction on a button with elastic spring recoil.
 */
export function attachMagneticEffect(el: HTMLElement, opts: MagneticOptions = {}): () => void {
  if (typeof window === 'undefined' || window.matchMedia('(hover: none)').matches) {
    return () => {};
  }

  const maxDist = opts.maxDistance ?? 48;
  const pull = opts.pullFactor ?? 0.35;
  const rotateIcon = opts.rotateIcon ?? false;
  const icon = el.querySelector('svg');

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < maxDist) {
      gsap.to(el, {
        x: dx * pull,
        y: dy * pull,
        duration: 0.22,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      if (rotateIcon && icon) {
        gsap.to(icon, {
          rotation: 45,
          scale: 1.15,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }
  };

  const onPointerLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.65,
      ease: 'elastic.out(1.1, 0.35)',
      overwrite: 'auto'
    });
    if (rotateIcon && icon) {
      gsap.to(icon, {
        rotation: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  };

  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerleave', onPointerLeave);

  return () => {
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerleave', onPointerLeave);
    gsap.killTweensOf(el);
    if (icon) gsap.killTweensOf(icon);
  };
}

export class OverlayComponent {
  public root: HTMLElement;
  public headerEl: HTMLElement;
  public caseOverlayEl: HTMLElement;
  public soundToggleBtn: HTMLButtonElement;
  public caseSoundBtn: HTMLButtonElement;
  public accessibleNavEl: HTMLElement;
  public aboutLink: HTMLAnchorElement;

  private catEl: HTMLElement;
  private roleEl: HTMLElement;
  private agencyEl: HTMLElement;
  private titleWrapEl: HTMLElement;
  private activeTitleEl: HTMLElement;
  private viewLink: HTMLAnchorElement;
  private closeBtn: HTMLButtonElement;
  private prevBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  private caseNavEl: HTMLElement;

  private currentTitle = '';
  private cleanupFns: Array<() => void> = [];
  public prefersReducedMotion = false;

  constructor(
    parent: HTMLElement,
    brand: BrandConfig,
    projects: ShowcaseProject[],
    callbacks: OverlayCallbacks
  ) {
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.root = document.createElement('div');
    this.root.className = 'ma-overlay-container';

    this.root.innerHTML = `
      <!-- Minimal Top Header -->
      <header class="ma-minimal-header" id="maHeader">
        <div class="ma-minimal-header__brand">
          <div class="ma-brand-line-1">${escapeHtml(brand.brandLine1)}</div>
          <div class="ma-brand-line-2">${escapeHtml(brand.brandLine2)}</div>
        </div>

        <div class="ma-minimal-header__nav">
          <button class="ma-sound-toggle" id="maSoundToggle" type="button" aria-label="Toggle Spatial Audio">SOUND ON</button>
          <a class="ma-about-link" id="maAboutBtn" href="#" target="_blank" rel="noopener noreferrer" aria-label="Visit Project Website">About</a>
        </div>
      </header>

      <!-- Case Study In-Situ 3D Barrel HUD Overlay -->
      <div class="ma-case-overlay" id="maCaseOverlay" aria-hidden="true">
        <!-- Top Navigation Bar -->
        <div class="ma-case-topbar" id="maCaseTopbar">
          <div class="ma-case-info">
            <div class="ma-case-info__cat" id="maCaseCat"></div>
            <div class="ma-case-info__role" id="maCaseRole">Frontend Engineering</div>
            <div class="ma-case-info__agency" id="maCaseAgency"></div>
          </div>

          <div class="ma-case-actions" id="maCaseActions">
            <a href="#" target="_blank" rel="noopener noreferrer" class="ma-case-view-link" id="maCaseViewLink">View Live Site ↗</a>
          </div>
        </div>

        <!-- Bottom Left Sound Toggle Button -->
        <button class="ma-case-sound-btn" id="maCaseSoundBtn" type="button" aria-label="Toggle Sound">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/>
            <rect x="2" y="2" width="20" height="20" rx="4"/>
          </svg>
        </button>

        <!-- Bottom Center Navigation: ← Project Title → -->
        <div class="ma-case-nav" id="maCaseNav">
          <button class="ma-case-nav__btn ma-case-nav__btn--prev" id="maCasePrevBtn" type="button" aria-label="Previous Project">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="ma-case-nav__title-wrap" id="maCaseTitleWrap">
            <span class="ma-case-nav__title" id="maCaseNavTitle">Project</span>
          </div>
          <button class="ma-case-nav__btn ma-case-nav__btn--next" id="maCaseNextBtn" type="button" aria-label="Next Project">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Bottom Right Close Button: [✕] -->
        <button class="ma-case-close-btn" id="maCaseCloseBtn" type="button" aria-label="Close Case Study">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Accessible Visually-Hidden DOM List for Screen Readers and SEO -->
      <nav class="ma-sr-only" aria-label="Projects Catalog">
        <ul>
          ${projects
            .map(
              p =>
                `<li><a href="/projects/${escapeHtml(p.slug)}">${escapeHtml(
                  p.title
                )} - ${escapeHtml(p.category)} (${escapeHtml(p.client)})</a></li>`
            )
            .join('')}
        </ul>
      </nav>
    `;

    parent.appendChild(this.root);

    this.headerEl = this.root.querySelector('#maHeader')!;
    this.caseOverlayEl = this.root.querySelector('#maCaseOverlay')!;
    this.soundToggleBtn = this.root.querySelector('#maSoundToggle')!;
    this.caseSoundBtn = this.root.querySelector('#maCaseSoundBtn')!;
    this.accessibleNavEl = this.root.querySelector('.ma-sr-only')!;

    this.catEl = this.root.querySelector('#maCaseCat')!;
    this.roleEl = this.root.querySelector('#maCaseRole')!;
    this.agencyEl = this.root.querySelector('#maCaseAgency')!;
    this.titleWrapEl = this.root.querySelector('#maCaseTitleWrap')!;
    this.activeTitleEl = this.root.querySelector('#maCaseNavTitle')!;
    this.viewLink = this.root.querySelector('#maCaseViewLink')!;
    this.aboutLink = this.root.querySelector('#maAboutBtn') as HTMLAnchorElement;
    this.closeBtn = this.root.querySelector('#maCaseCloseBtn')!;
    this.prevBtn = this.root.querySelector('#maCasePrevBtn')!;
    this.nextBtn = this.root.querySelector('#maCaseNextBtn')!;
    this.caseNavEl = this.root.querySelector('#maCaseNav')!;

    // Bind event handlers
    this.soundToggleBtn.addEventListener('click', callbacks.onToggleSound);
    this.caseSoundBtn.addEventListener('click', callbacks.onToggleSound);
    if (callbacks.onOpenAbout) {
      this.aboutLink?.addEventListener('click', callbacks.onOpenAbout);
    }
    this.closeBtn.addEventListener('click', callbacks.onCloseCaseStudy);
    this.nextBtn.addEventListener('click', callbacks.onNextProject);
    this.prevBtn.addEventListener('click', callbacks.onPrevProject);

    // Attach Magnetic Physics to Action Buttons (Animaxxing/pointer-effects)
    this.cleanupFns.push(attachMagneticEffect(this.closeBtn, { maxDistance: 50, pullFactor: 0.38, rotateIcon: true }));
    this.cleanupFns.push(attachMagneticEffect(this.prevBtn, { maxDistance: 40, pullFactor: 0.32 }));
    this.cleanupFns.push(attachMagneticEffect(this.nextBtn, { maxDistance: 40, pullFactor: 0.32 }));
    this.cleanupFns.push(attachMagneticEffect(this.caseSoundBtn, { maxDistance: 45, pullFactor: 0.35 }));
    this.cleanupFns.push(attachMagneticEffect(this.soundToggleBtn, { maxDistance: 45, pullFactor: 0.28 }));
    if (this.aboutLink) this.cleanupFns.push(attachMagneticEffect(this.aboutLink, { maxDistance: 45, pullFactor: 0.28 }));
  }

  /**
   * Updates the About header button link to point directly to the currently centered project's live website.
   */
  public updateActiveCenterProject(proj: ShowcaseProject): void {
    if (this.aboutLink) {
      if (proj.liveUrl && !proj.liveUrl.includes('github.com')) {
        this.aboutLink.href = proj.liveUrl;
        this.aboutLink.target = '_blank';
      } else {
        this.aboutLink.href = `/projects/${proj.slug}`;
        this.aboutLink.removeAttribute('target');
      }
      this.aboutLink.setAttribute('title', `Visit ${proj.title.split('—')[0].trim()}`);
    }
  }

  public updateCaseStudy(proj: ShowcaseProject, direction: 'next' | 'prev' | 'none' = 'none'): void {
    if (this.catEl) this.catEl.textContent = proj.category.split('//')[0].trim();
    if (this.roleEl) this.roleEl.textContent = 'Frontend Engineering';
    if (this.agencyEl) this.agencyEl.textContent = `Client: ${proj.client}`;

    if (this.viewLink) {
      if (proj.isLive && proj.liveUrl && !proj.liveUrl.includes('github.com')) {
        this.viewLink.href = proj.liveUrl;
        this.viewLink.style.display = 'inline-block';
      } else {
        this.viewLink.href = '#';
        this.viewLink.style.display = 'none';
      }
    }

    // Directional Kinetic Title Switcher
    const newTitle = proj.title.split('—')[0].trim();
    if (this.currentTitle === newTitle) return;

    if (direction === 'none' || this.prefersReducedMotion || !this.titleWrapEl || !this.activeTitleEl) {
      this.currentTitle = newTitle;
      if (this.activeTitleEl) this.activeTitleEl.textContent = newTitle;
      return;
    }

    const oldEl = this.activeTitleEl;
    const newEl = document.createElement('span');
    newEl.className = 'ma-case-nav__title';
    newEl.textContent = newTitle;
    this.titleWrapEl.appendChild(newEl);
    this.activeTitleEl = newEl;
    this.currentTitle = newTitle;

    const xOut = direction === 'next' ? -28 : 28;
    const xIn = -xOut;

    gsap.killTweensOf(oldEl);
    gsap.to(oldEl, {
      x: xOut,
      opacity: 0,
      filter: 'blur(3px)',
      duration: 0.26,
      ease: 'power2.in',
      onComplete: () => oldEl.remove()
    });

    gsap.fromTo(
      newEl,
      { x: xIn, opacity: 0, filter: 'blur(3px)' },
      {
        x: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.38,
        ease: 'power3.out'
      }
    );
  }

  public setCaseStudyOpen(open: boolean): void {
    if (open) {
      this.caseOverlayEl.classList.add('is-open');
      this.caseOverlayEl.setAttribute('aria-hidden', 'false');
      this.headerEl.classList.add('is-hidden');

      if (!this.prefersReducedMotion) {
        // Staggered cascade entrance for top bar metadata
        const topItems = [this.catEl, this.roleEl, this.agencyEl, this.viewLink].filter(Boolean);
        gsap.killTweensOf(topItems);
        gsap.fromTo(
          topItems,
          { opacity: 0, y: -10, filter: 'blur(2px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.6,
            stagger: 0.06,
            ease: 'power3.out',
            delay: 0.12
          }
        );

        // Spring entrance for bottom controls
        const bottomControls = [this.caseSoundBtn, this.caseNavEl, this.closeBtn].filter(Boolean);
        gsap.killTweensOf(bottomControls);
        gsap.fromTo(
          bottomControls,
          { opacity: 0, y: 16, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.06,
            ease: 'power3.out',
            delay: 0.18
          }
        );
      }
    } else {
      this.caseOverlayEl.classList.remove('is-open');
      this.caseOverlayEl.setAttribute('aria-hidden', 'true');
      this.headerEl.classList.remove('is-hidden');
    }
  }

  public updateSoundState(isMuted: boolean): void {
    this.soundToggleBtn.textContent = isMuted ? 'SOUND OFF' : 'SOUND ON';
    this.soundToggleBtn.classList.toggle('is-muted', isMuted);
    this.caseSoundBtn.classList.toggle('is-muted', isMuted);
  }

  public destroy(): void {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    gsap.killTweensOf(this.activeTitleEl);
    this.root.remove();
  }
}
