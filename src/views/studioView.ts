/**
 * StudioView — Swiss Spatial Split-Ledger (/studio or /about)
 * 
 * 45/55 Asymmetric Spatial Architecture:
 * - Floats over the persistent 3D WebGL cylinder
 * - Live 3D flacon glides to the right 55% with optical WebGL depth-of-field blur
 * - Left 44vw presents an ultra-clean, human Swiss editorial monograph.
 * 
 * Features:
 * - Studio Overview & Thesis (Instrument Serif)
 * - Creative Philosophy (Three Tenets)
 * - Capabilities & Disciplines
 * - Studio Colophon & Telemetry
 * - Direct Studio Inquiry CTA
 * 
 * Sourced directly from src/data/studioContent.ts (docs/content.md)
 * Governed by: @style-animaxxing, @animaxxing, @creative-direction, @awwwards
 */

import gsap from 'gsap';
import { SpatialView } from './baseView';
import { STUDIO_CONTENT } from '../data/studioContent';
import { attachMagneticEffect } from '../engine/cylinder/ui/overlay';

export class StudioView implements SpatialView {
  public readonly id = 'studio';
  private root: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private visible = false;
  private onCloseCallback?: () => void;
  private onContactCallback?: () => void;
  private keydownHandler?: (e: KeyboardEvent) => void;
  private cleanupFns: Array<() => void> = [];

  constructor(options: { onClose?: () => void; onContact?: () => void } = {}) {
    this.onCloseCallback = options.onClose;
    this.onContactCallback = options.onContact;
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.root = document.createElement('div');
    this.root.className = 'ma-studio-ledger-root';
    this.root.id = 'studioView';
    this.root.setAttribute('aria-hidden', 'true');
    this.root.style.display = 'none';

    const { brand, philosophy, capabilities, colophon, contact } = STUDIO_CONTENT;

    const headlineHtml = brand.headlineLines
      .map(line => `<span class="ma-mask-line"><span class="ma-line-inner">${line}</span></span>`)
      .join('\n              ');

    const paragraphsHtml = brand.bioParagraphs
      .map(p => `<div class="ma-mask-line"><p class="ma-line-inner ma-ledger-thesis-p">${p}</p></div>`)
      .join('\n            ');

    const philosophyHtml = philosophy
      .map(item => `
              <div class="ma-studio-item">
                <h3 class="ma-item-title">${item.title}</h3>
                <p class="ma-item-desc">${item.body}</p>
              </div>`
      ).join('');

    const capabilitiesHtml = capabilities
      .map(cap => `
              <div class="ma-studio-item">
                <h3 class="ma-item-title">${cap.title}</h3>
                <p class="ma-item-desc">${cap.body}</p>
              </div>`
      ).join('');

    const colophonHtml = colophon
      .map(row => `
              <div class="ma-ledger-row">
                <span class="ma-row-label">${row.label}</span>
                <span class="ma-row-val">${row.value}</span>
              </div>`
      ).join('');

    this.root.innerHTML = `
      <!-- Left-edge soft warm scrim (leaves the right 55% crystal-clear for the 3D scene) -->
      <div class="ma-studio-scrim" id="studioScrim"></div>

      <!-- Left 44vw Swiss Editorial Ledger Panel -->
      <aside class="ma-studio-ledger-panel" id="studioPanel" role="dialog" aria-modal="true" aria-label="Showcase-3D Studio">
        
        <!-- Top Action Bar -->
        <div class="ma-ledger-header">
          <span class="ma-ledger-mono-tag">${brand.tag}</span>
          <button class="ma-ledger-close-btn ma-studio-close-btn" id="studioCloseBtn" type="button" aria-label="Return to Archive">
            <span class="ma-ledger-close-label">RETURN</span>
            <span class="ma-ledger-close-key">[ ESC ]</span>
          </button>
        </div>

        <!-- Scrollable Column Content -->
        <div class="ma-ledger-body" id="studioBody">
          
          <!-- 1. Headline & Studio Overview -->
          <section class="ma-ledger-section">
            <h1 class="ma-ledger-headline">
              ${headlineHtml}
            </h1>

            <div class="ma-ledger-bio-group">
              ${paragraphsHtml}
            </div>
          </section>

          <!-- 2. Creative Philosophy -->
          <section class="ma-ledger-section">
            <div class="ma-mask-line">
              <h2 class="ma-line-inner ma-ledger-subhead">PHILOSOPHY</h2>
            </div>
            
            <div class="ma-studio-items-grid">
              ${philosophyHtml}
            </div>
          </section>

          <!-- 3. Capabilities -->
          <section class="ma-ledger-section">
            <div class="ma-mask-line">
              <h2 class="ma-line-inner ma-ledger-subhead">CAPABILITIES</h2>
            </div>
            
            <div class="ma-studio-items-grid">
              ${capabilitiesHtml}
            </div>
          </section>

          <!-- 4. Studio Colophon & Telemetry -->
          <section class="ma-ledger-section">
            <div class="ma-mask-line">
              <h2 class="ma-line-inner ma-ledger-subhead">STUDIO TELEMETRY & SPECIFICATIONS</h2>
            </div>

            <div class="ma-ledger-table">
              ${colophonHtml}
            </div>
          </section>

          <!-- 5. Direct Human Action CTA -->
          <section class="ma-ledger-footer">
            <button class="ma-ledger-cta-btn ma-cta-contact-btn" id="studioContactBtn" type="button">
              <span>${contact.actionLabel}</span>
            </button>
            <span class="ma-ledger-note">${contact.note}</span>
          </section>

        </div>
      </aside>
    `;

    this.container.appendChild(this.root);
    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.root) return;

    const closeBtn = this.root.querySelector<HTMLElement>('#studioCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.onCloseCallback?.());
      this.cleanupFns.push(attachMagneticEffect(closeBtn, { maxDistance: 45, pullFactor: 0.28 }));
    }

    const scrim = this.root.querySelector('#studioScrim');
    scrim?.addEventListener('click', (e) => {
      if (e.target === scrim) {
        this.onCloseCallback?.();
      }
    });

    const contactBtn = this.root.querySelector<HTMLElement>('#studioContactBtn');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => this.onContactCallback?.());
      this.cleanupFns.push(attachMagneticEffect(contactBtn, { maxDistance: 45, pullFactor: 0.32 }));
    }
  }

  public async enter(): Promise<void> {
    if (!this.root) return;
    this.visible = true;
    this.root.style.display = 'block';
    this.root.setAttribute('aria-hidden', 'false');

    const panel = this.root.querySelector<HTMLElement>('#studioPanel');
    const scrim = this.root.querySelector<HTMLElement>('#studioScrim');
    const lines = this.root.querySelectorAll<HTMLElement>('.ma-line-inner');
    const rows = this.root.querySelectorAll<HTMLElement>('.ma-ledger-row, .ma-studio-item');

    const body = this.root.querySelector<HTMLElement>('#studioBody');
    if (body) body.scrollTop = 0;

    gsap.killTweensOf([this.root, panel, scrim, lines, rows]);

    // 1. Fade scrim smoothly
    if (scrim) {
      gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.65, ease: 'power2.out' });
    }

    // 2. Slide panel in from left
    if (panel) {
      gsap.fromTo(
        panel,
        { xPercent: -10, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      );
    }

    // 3. Staggered masked line reveals
    if (lines.length > 0) {
      gsap.fromTo(
        lines,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.04, delay: 0.1, ease: 'power3.out' }
      );
    }

    // 4. Staggered hairline table rows & items
    if (rows.length > 0) {
      gsap.fromTo(
        rows,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.03, delay: 0.22, ease: 'power2.out' }
      );
    }

    // Keydown handler for ESC key dismiss
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.onCloseCallback?.();
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }

  public async exit(): Promise<void> {
    if (!this.root || !this.visible) return;
    this.visible = false;
    this.root.setAttribute('aria-hidden', 'true');

    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = undefined;
    }

    const panel = this.root.querySelector<HTMLElement>('#studioPanel');
    const scrim = this.root.querySelector<HTMLElement>('#studioScrim');
    const lines = this.root.querySelectorAll<HTMLElement>('.ma-line-inner');

    gsap.killTweensOf([this.root, panel, scrim, lines]);

    await new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (this.root) this.root.style.display = 'none';
          resolve();
        }
      });

      if (lines.length > 0) {
        tl.to(lines, { yPercent: 110, opacity: 0, duration: 0.35, stagger: 0.02, ease: 'power2.in' }, 0);
      }

      if (panel) {
        tl.to(panel, { xPercent: -10, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.05);
      }

      if (scrim) {
        tl.to(scrim, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0.05);
      }
    });
  }

  public destroy(): void {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    if (this.root && this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
    this.root = null;
    this.visible = false;
  }

  public getElement(): HTMLElement | null {
    return this.root;
  }

  public isVisible(): boolean {
    return this.visible;
  }
}
