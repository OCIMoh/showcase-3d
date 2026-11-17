/**
 * DOM Overlay Management: Minimal Header, Case Study Overlay, Accessible SEO Nav
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

  private catEl: HTMLElement;
  private roleEl: HTMLElement;
  private agencyEl: HTMLElement;
  private navTitleEl: HTMLElement;
  private viewLink: HTMLAnchorElement;
  private codeLink: HTMLAnchorElement;

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

      <!-- Case Study Overlay -->
      <div class="ma-case-overlay" id="maCaseOverlay" aria-hidden="true">
        <!-- Top Left Info -->
        <div class="ma-case-info">
          <div class="ma-case-info__cat" id="maCaseCat"></div>
          <div class="ma-case-info__role" id="maCaseRole">Frontend Development</div>
          <div class="ma-case-info__agency" id="maCaseAgency"></div>
        </div>

        <!-- Top Right Actions -->
        <div class="ma-case-actions" id="maCaseActions">
          <a href="#" target="_blank" rel="noopener noreferrer" class="ma-case-view-link" id="maCaseViewLink">View</a>
          <a href="#" target="_blank" rel="noopener noreferrer" class="ma-case-code-link" id="maCaseCodeLink">Code</a>
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

    this.catEl = this.root.querySelector('#maCaseCat')!;
    this.roleEl = this.root.querySelector('#maCaseRole')!;
    this.agencyEl = this.root.querySelector('#maCaseAgency')!;
    this.navTitleEl = this.root.querySelector('#maCaseNavTitle')!;
    this.viewLink = this.root.querySelector('#maCaseViewLink')!;
    this.codeLink = this.root.querySelector('#maCaseCodeLink')!;

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
    if (this.roleEl) this.roleEl.textContent = 'Frontend Development';
    if (this.agencyEl) this.agencyEl.textContent = `Client: ${proj.client}`;
    if (this.navTitleEl) this.navTitleEl.textContent = proj.title.split('—')[0].trim();

    if (this.viewLink) {
      this.viewLink.href = proj.liveUrl;
      this.viewLink.style.display = proj.isLive ? 'inline-block' : 'none';
    }
    if (this.codeLink) {
      this.codeLink.href = proj.githubUrl;
      this.codeLink.style.display = proj.githubUrl ? 'inline-block' : 'none';
    }
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
