/**
 * About Studio Drawer Component
 */

import { BrandConfig } from '../core/config';
import { ShowcaseProject } from '../../../data/showcaseProjects';

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
  private onCloseCallback?: () => void;

  constructor(
    parent: HTMLElement,
    brand: BrandConfig,
    projects: ShowcaseProject[],
    onClose?: () => void
  ) {
    this.onCloseCallback = onClose;

    this.root = document.createElement('aside');
    this.root.className = 'ma-drawer ma-drawer--about';
    this.root.id = 'maAboutDrawer';
    this.root.setAttribute('aria-label', 'About Studio');
    this.root.setAttribute('aria-hidden', 'true');

    this.root.innerHTML = `
      <div class="ma-drawer__backdrop" id="maAboutBackdrop"></div>
      <div class="ma-drawer__panel" id="maAboutPanel">
        <div class="ma-drawer__bar">
          <span class="ma-drawer__badge">${escapeHtml(brand.badge)}</span>
          <button class="ma-drawer__close-btn" id="maAboutClose" type="button" aria-label="Close About Drawer">
            <span>CLOSE [ESC]</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="ma-drawer__scroll">
          <h2 class="ma-about__headline">${escapeHtml(brand.aboutHeadline)}</h2>
          <p class="ma-about__bio">${escapeHtml(brand.aboutBio)}</p>
          <div class="ma-about__grid">
            <div class="ma-about__col">
              <h4 class="ma-about__col-title">CORE DISCIPLINES</h4>
              <ul class="ma-about__list">
                <li>Native WebGL & GLSL Shaders</li>
                <li>3D Cylindrical Geometry & Vertex Bending</li>
                <li>In-Situ Mesh Expansion Transitions</li>
                <li>3D Vertical Barrel Galleries</li>
                <li>Generative Web Audio Synthesis</li>
              </ul>
            </div>
            <div class="ma-about__col">
              <h4 class="ma-about__col-title">FEATURED REPOSITORIES</h4>
              <ul class="ma-about__list" id="maAboutRepoList"></ul>
            </div>
          </div>
          <div class="ma-about__actions">
            <a href="${escapeHtml(brand.githubUrl)}" target="_blank" rel="noopener noreferrer" class="ma-btn ma-btn--primary">
              <span>VIEW GITHUB PROFILE ↗</span>
            </a>
          </div>
        </div>
      </div>
    `;

    parent.appendChild(this.root);

    // Populate featured repositories using safe DOM methods
    const listEl = this.root.querySelector('#maAboutRepoList');
    if (listEl) {
      projects.slice(0, 6).forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.title.split('—')[0].trim();
        listEl.appendChild(li);
      });
    }

    const closeBtn = this.root.querySelector('#maAboutClose');
    const backdrop = this.root.querySelector('#maAboutBackdrop');
    closeBtn?.addEventListener('click', () => this.close());
    backdrop?.addEventListener('click', () => this.close());
  }

  public open(): void {
    this.root.classList.add('is-open');
    this.root.setAttribute('aria-hidden', 'false');
  }

  public close(): void {
    this.root.classList.remove('is-open');
    this.root.setAttribute('aria-hidden', 'true');
    this.onCloseCallback?.();
  }

  public isOpen(): boolean {
    return this.root.classList.contains('is-open');
  }

  public destroy(): void {
    this.root.remove();
  }
}
