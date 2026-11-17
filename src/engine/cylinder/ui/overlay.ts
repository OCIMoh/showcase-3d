/**
 * DOM Overlay Management: Minimal Header, Bento Grid Case Study, Accessible SEO Nav
 */

import { BrandConfig } from '../core/config';
import { ShowcaseProject } from '../../../data/showcaseProjects';
import { escapeHtml } from './aboutDrawer';

export interface OverlayCallbacks {
  onCloseCaseStudy: () => void;
  onNextProject: () => void;
  onPrevProject: () => void;
  onToggleSound: () => void;
  onOpenAbout: () => void;
}

export class OverlayComponent {
  public root: HTMLElement;
  public headerEl: HTMLElement;
  public caseOverlayEl: HTMLElement;
  public soundToggleBtn: HTMLButtonElement;
  public caseSoundBtn: HTMLButtonElement;
  public accessibleNavEl: HTMLElement;
  public caseScrollEl: HTMLElement;
  public bentoGridEl: HTMLElement;

  private catEl: HTMLElement;
  private roleEl: HTMLElement;
  private agencyEl: HTMLElement;
  private navTitleEl: HTMLElement;
  private viewLink: HTMLAnchorElement;

  constructor(
    parent: HTMLElement,
    brand: BrandConfig,
    projects: ShowcaseProject[],
    callbacks: OverlayCallbacks
  ) {
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
          <button class="ma-about-link" id="maAboutBtn" type="button" aria-label="Open Studio Profile">About</button>
        </div>
      </header>

      <!-- Case Study Overlay with Native Scrollable Bento Grid -->
      <div class="ma-case-overlay" id="maCaseOverlay" aria-hidden="true">
        <!-- Sticky Top Navigation Bar -->
        <div class="ma-case-topbar">
          <div class="ma-case-info">
            <div class="ma-case-info__cat" id="maCaseCat"></div>
            <div class="ma-case-info__role" id="maCaseRole">Frontend Engineering</div>
            <div class="ma-case-info__agency" id="maCaseAgency"></div>
          </div>

          <div class="ma-case-actions" id="maCaseActions">
            <a href="#" target="_blank" rel="noopener noreferrer" class="ma-case-view-link" id="maCaseViewLink">View Live Site ↗</a>
          </div>
        </div>

        <!-- Scrollable Bento Grid Body -->
        <div class="ma-case-scroll" id="maCaseScroll">
          <div class="ma-bento-grid" id="maCaseBento">
            <!-- Dynamically populated with raw DOM elements -->
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
        <div class="ma-case-nav">
          <button class="ma-case-nav__btn ma-case-nav__btn--prev" id="maCasePrevBtn" type="button" aria-label="Previous Project">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <span class="ma-case-nav__title" id="maCaseNavTitle">Project</span>
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
    this.caseScrollEl = this.root.querySelector('#maCaseScroll')!;
    this.bentoGridEl = this.root.querySelector('#maCaseBento')!;

    this.catEl = this.root.querySelector('#maCaseCat')!;
    this.roleEl = this.root.querySelector('#maCaseRole')!;
    this.agencyEl = this.root.querySelector('#maCaseAgency')!;
    this.navTitleEl = this.root.querySelector('#maCaseNavTitle')!;
    this.viewLink = this.root.querySelector('#maCaseViewLink')!;

    // Bind event handlers
    this.soundToggleBtn.addEventListener('click', callbacks.onToggleSound);
    this.caseSoundBtn.addEventListener('click', callbacks.onToggleSound);
    this.root.querySelector('#maAboutBtn')?.addEventListener('click', callbacks.onOpenAbout);
    this.root.querySelector('#maCaseCloseBtn')?.addEventListener('click', callbacks.onCloseCaseStudy);
    this.root.querySelector('#maCaseNextBtn')?.addEventListener('click', callbacks.onNextProject);
    this.root.querySelector('#maCasePrevBtn')?.addEventListener('click', callbacks.onPrevProject);
  }

  public updateCaseStudy(proj: ShowcaseProject): void {
    if (this.catEl) this.catEl.textContent = proj.category.split('//')[0].trim();
    if (this.roleEl) this.roleEl.textContent = 'Frontend Engineering';
    if (this.agencyEl) this.agencyEl.textContent = `Client: ${proj.client}`;
    if (this.navTitleEl) this.navTitleEl.textContent = proj.title.split('—')[0].trim();

    if (this.viewLink) {
      this.viewLink.href = proj.liveUrl;
      this.viewLink.style.display = proj.isLive ? 'inline-block' : 'none';
    }

    // Scroll back to top when opening or switching projects
    if (this.caseScrollEl) {
      this.caseScrollEl.scrollTop = 0;
    }

    // Render Raw DOM Bento Grid
    this.renderBentoGrid(proj);
  }

  private renderBentoGrid(proj: ShowcaseProject): void {
    const heroImg = proj.previewImageUrl || proj.galleryImages?.[0] || '';
    const secondaryImgs = (proj.galleryImages || []).slice(1).filter(Boolean);

    const highlights = proj.highlights && proj.highlights.length >= 3
      ? proj.highlights
      : [
          'High-performance 60 FPS WebGL shader pipeline',
          'Fluid state transitions and kinetic micro-animations',
          'Responsive multi-viewport touch architecture'
        ];

    const cleanTitle = escapeHtml(proj.title.split('—')[0].trim());
    const accentColor = proj.color || '#3a86ff';

    this.bentoGridEl.innerHTML = `
      <!-- Row 1: Symmetrical Hero Showcase + Narrative Overview -->
      <section class="ma-bento-card ma-bento-card--hero" style="--accent: ${accentColor}">
        <div class="ma-bento-card__badge-row">
          <span class="ma-bento-badge ma-bento-badge--cat">${escapeHtml(proj.category)}</span>
          ${proj.isLive ? '<span class="ma-bento-badge ma-bento-badge--live"><span class="ma-live-dot"></span>LIVE DEPLOYMENT</span>' : ''}
        </div>
        <div class="ma-bento-hero-img-wrap">
          ${heroImg ? `<img class="ma-bento-hero-img" src="${heroImg}" alt="${cleanTitle} Preview" loading="eager" />` : ''}
        </div>
      </section>

      <section class="ma-bento-card ma-bento-card--meta" style="--accent: ${accentColor}">
        <div class="ma-bento-kicker">${escapeHtml(proj.client.toUpperCase())} // ${escapeHtml(proj.year)}</div>
        <h1 class="ma-bento-title">${cleanTitle}</h1>
        <p class="ma-bento-desc">${escapeHtml(proj.description)}</p>

        <div class="ma-bento-cta-row">
          ${proj.isLive ? `
            <a href="${escapeHtml(proj.liveUrl)}" target="_blank" rel="noopener noreferrer" class="ma-bento-btn ma-bento-btn--primary">
              <span>EXPLORE LIVE SITE ↗</span>
            </a>
          ` : ''}
        </div>

        <div class="ma-bento-metric-badge">
          <span class="ma-bento-metric-dot"></span>
          <span>${escapeHtml(proj.metrics)}</span>
        </div>
      </section>

      <!-- Row 2: Triple Capability Feature Modules (3-col Bento Symmetry) -->
      <section class="ma-bento-card ma-bento-card--feature">
        <div class="ma-bento-feature-check">✓</div>
        <div class="ma-bento-feature-content">
          <h3 class="ma-bento-feature-title">${escapeHtml(highlights[0])}</h3>
          <span class="ma-bento-feature-sub">Verified Production Module · Zero Latency</span>
        </div>
      </section>

      <section class="ma-bento-card ma-bento-card--feature">
        <div class="ma-bento-feature-check">✓</div>
        <div class="ma-bento-feature-content">
          <h3 class="ma-bento-feature-title">${escapeHtml(highlights[1])}</h3>
          <span class="ma-bento-feature-sub">Interactive Architecture · Fluid States</span>
        </div>
      </section>

      <section class="ma-bento-card ma-bento-card--feature">
        <div class="ma-bento-feature-check">✓</div>
        <div class="ma-bento-feature-content">
          <h3 class="ma-bento-feature-title">${escapeHtml(highlights[2])}</h3>
          <span class="ma-bento-feature-sub">Responsive Multi-Viewport Engineering</span>
        </div>
      </section>

      <!-- Row 3: Secondary Screenshot Gallery Tiles & System Tech Architecture -->
      ${secondaryImgs.length > 0 ? `
        <section class="ma-bento-card ma-bento-card--gallery">
          <div class="ma-bento-gallery-grid ma-bento-gallery-grid--${Math.min(secondaryImgs.length, 3)}">
            ${secondaryImgs.map((imgSrc, i) => `
              <div class="ma-bento-gallery-item">
                <img src="${imgSrc}" alt="${cleanTitle} Detail ${i + 1}" loading="lazy" />
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <section class="ma-bento-card ma-bento-card--specs ${secondaryImgs.length === 0 ? 'ma-bento-card--full' : ''}">
        <h3 class="ma-bento-specs-title">SYSTEM ARCHITECTURE & DISCIPLINES</h3>
        <div class="ma-bento-chips-row">
          ${proj.techStack.map(t => `<span class="ma-bento-chip">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="ma-bento-panels-row">
          <div class="ma-bento-mini-panel">
            <span class="ma-mini-label">RUNTIME ENGINE</span>
            <strong class="ma-mini-val">WebGL & Native DOM</strong>
          </div>
          <div class="ma-bento-mini-panel">
            <span class="ma-mini-label">FRAME TIMINGS</span>
            <strong class="ma-mini-val">60 FPS Hardware</strong>
          </div>
          <div class="ma-bento-mini-panel">
            <span class="ma-mini-label">DEPLOYMENT</span>
            <strong class="ma-mini-val">Global Edge CDN</strong>
          </div>
        </div>
      </section>
    `;
  }

  public setCaseStudyOpen(open: boolean): void {
    if (open) {
      this.caseOverlayEl.classList.add('is-open');
      this.caseOverlayEl.setAttribute('aria-hidden', 'false');
      this.headerEl.classList.add('is-hidden');
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
    this.root.remove();
  }
}
