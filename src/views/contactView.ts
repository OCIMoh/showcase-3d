/**
 * ContactView — The Direct Spatial Dispatch Stage (/contact)
 * 
 * Approach 2: Radical Minimalist (Aristide Benoist / Studio Freight standard).
 * Features:
 * - Zero form fields, zero input autofill glitches, zero pop-up modal box
 * - 3D subject sits unoccluded in the center of the viewport
 * - Monumental italic Instrument Serif headline: "Let's build something monumental."
 * - Single magnetic action pill: Direct Email ("johndoe.@example.com") with fixed-width zero-jitter copy feedback
 * - Understated, human editorial colophon (Paris CET time, 2027 commissions)
 * - Robust GSAP lifecycle: fromTo guarantees pristine visibility on every open
 */

import gsap from 'gsap';
import { SpatialView } from './baseView';
import { attachMagneticEffect } from '../engine/cylinder/ui/overlay';

export class ContactView implements SpatialView {
  public readonly id = 'contact';
  private root: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private visible = false;
  private onCloseCallback?: () => void;
  private previouslyFocusedElement: HTMLElement | null = null;
  private keydownHandler?: (e: KeyboardEvent) => void;
  private cleanupFns: Array<() => void> = [];

  constructor(options: { onClose?: () => void } = {}) {
    this.onCloseCallback = options.onClose;
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.root = document.createElement('div');
    this.root.className = 'ma-dispatch-stage-root';
    this.root.id = 'contactStage';
    this.root.setAttribute('aria-hidden', 'true');
    this.root.style.display = 'none';

    this.root.innerHTML = `
      <!-- Ambient Stage Scrim (Radial vignette, tap outside to return) -->
      <div class="ma-dispatch-scrim" id="dispatchScrim" tabindex="-1"></div>

      <div class="ma-dispatch-shell" role="region" aria-label="Direct Atelier Dispatch">
        
        <!-- Top Bar: Monospace Identity & Return Trigger -->
        <header class="ma-dispatch-header">
          <div class="ma-dispatch-badge">
            <span class="ma-status-dot"></span>
            <span>02 // DIRECT ATELIER DISPATCH · SHOWCASE-3D</span>
          </div>
          <button class="ma-dispatch-close-btn ma-contact-close-btn" id="contactCloseBtn" type="button" aria-label="Return to Archive">
            <span class="ma-dispatch-close-text">RETURN TO WORK</span>
            <span class="ma-dispatch-close-key">[ ESC ]</span>
          </button>
        </header>

        <!-- Centerpiece Focal Typography & Magnetic Dispatch Action -->
        <main class="ma-dispatch-center">
          <div class="ma-mask-line">
            <span class="ma-dispatch-kicker">COMMISSIONS &amp; SPATIAL WEB PARTNERSHIPS</span>
          </div>

          <h1 class="ma-dispatch-headline">
            <div class="ma-mask-line"><span>Let’s build something</span></div>
            <div class="ma-mask-line"><span>monumental.</span></div>
          </h1>

          <div class="ma-mask-line">
            <p class="ma-dispatch-subhead">
              Direct atelier communication. We accept four bespoke WebGL commissions per quarter to preserve uncompromising visual fidelity and 60 FPS mobile performance.
            </p>
          </div>

          <!-- Single Centered Magnetic Dispatch Action Pill -->
          <div class="ma-dispatch-actions" id="dispatchActions">
            <button class="ma-dispatch-pill" id="dispatchPillEmail" type="button" aria-label="Copy atelier email to clipboard">
              <span class="ma-pill-icon">✉</span>
              <span class="ma-pill-label">johndoe.@example.com</span>
              <span class="ma-pill-tag" id="dispatchPillStatus">[ COPY ]</span>
            </button>
          </div>
        </main>

        <!-- Understated Human Editorial Colophon (Zero Marketing Slop) -->
        <footer class="ma-dispatch-footer" role="contentinfo">
          <span class="ma-footer-colophon">SHOWCASE-3D ATELIER</span>
          <span class="ma-footer-dot">·</span>
          <span class="ma-footer-colophon" id="dispatchParisTime">PARIS 17:45 CET</span>
          <span class="ma-footer-dot">·</span>
          <span class="ma-footer-colophon">COMMISSIONS OPEN FOR 2027</span>
        </footer>

      </div>
    `;

    this.container.appendChild(this.root);
    this.updateParisTime();
    this.bindEvents();
  }

  private updateParisTime(): void {
    const el = this.root?.querySelector('#dispatchParisTime');
    if (!el) return;
    try {
      const now = new Date();
      const parisFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      el.textContent = `PARIS ${parisFormatter.format(now)} CET`;
    } catch {
      el.textContent = 'PARIS 17:45 CET';
    }
  }

  private bindEvents(): void {
    if (!this.root) return;

    // Close button & Scrim tap dismissal
    const closeBtn = this.root.querySelector<HTMLElement>('#contactCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.onCloseCallback?.());
      this.cleanupFns.push(attachMagneticEffect(closeBtn, { maxDistance: 45, pullFactor: 0.28 }));
    }

    const scrim = this.root.querySelector('#dispatchScrim');
    scrim?.addEventListener('click', () => this.onCloseCallback?.());

    // Single Magnetic Email Dispatch Pill (tactile pull + feedback)
    const emailPill = this.root.querySelector<HTMLButtonElement>('#dispatchPillEmail');
    const pillStatus = this.root.querySelector<HTMLElement>('#dispatchPillStatus');
    if (emailPill) {
      this.cleanupFns.push(attachMagneticEffect(emailPill, { maxDistance: 40, pullFactor: 0.22 }));
    }

    if (emailPill && pillStatus) {
      emailPill.addEventListener('click', async () => {
        const emailAddress = 'johndoe.@example.com';
        try {
          await navigator.clipboard.writeText(emailAddress);
          emailPill.classList.add('is-copied');
          pillStatus.textContent = '✓ COPIED';

          const ariaLive = document.getElementById('maAriaLive');
          if (ariaLive) ariaLive.textContent = 'Atelier email copied to clipboard.';

          setTimeout(() => {
            emailPill.classList.remove('is-copied');
            pillStatus.textContent = '[ COPY ]';
          }, 2400);
        } catch {
          window.location.href = `mailto:${emailAddress}?subject=Showcase-3D%20Commission%20Inquiry`;
        }
      });
    }
  }

  public async enter(): Promise<void> {
    if (!this.root) return;
    this.visible = true;
    this.root.style.display = 'block';
    this.root.setAttribute('aria-hidden', 'false');
    this.updateParisTime();

    this.previouslyFocusedElement = document.activeElement as HTMLElement | null;

    const scrim = this.root.querySelector<HTMLElement>('#dispatchScrim');
    const shell = this.root.querySelector<HTMLElement>('.ma-dispatch-shell');
    const maskLines = this.root.querySelectorAll<HTMLElement>('.ma-mask-line span, .ma-mask-line p');
    const actions = this.root.querySelector<HTMLElement>('#dispatchActions');
    const footer = this.root.querySelector<HTMLElement>('.ma-dispatch-footer');
    const header = this.root.querySelector<HTMLElement>('.ma-dispatch-header');

    // CRITICAL: Kill any existing/pending tweens on ALL containers to prevent race conditions
    gsap.killTweensOf([this.root, scrim, shell, header, actions, footer, ...Array.from(maskLines)]);

    // 1. Scrim fade in
    if (scrim) {
      gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' });
    }

    // 2. Shell emergence: CRITICAL FIX — explicitly resets opacity & Y transform so repeated opens are always visible
    if (shell) {
      gsap.fromTo(
        shell,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }

    // 3. Top bar header reveal
    if (header) {
      gsap.fromTo(header, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }

    // 4. Masked line reveals for monumental headline
    if (maskLines.length > 0) {
      gsap.fromTo(maskLines, { yPercent: 110 }, {
        yPercent: 0,
        duration: 0.85,
        stagger: 0.04,
        ease: 'power3.out'
      });
    }

    // 5. Staggered emergence of single action pill and calm footer
    if (actions) {
      gsap.fromTo(actions, { opacity: 0, y: 14 }, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        delay: 0.18,
        ease: 'power2.out'
      });
    }

    if (footer) {
      gsap.fromTo(footer, { opacity: 0 }, {
        opacity: 1,
        duration: 0.7,
        delay: 0.28,
        ease: 'power2.out'
      });
    }

    // Attach ESC key listener
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

    const scrim = this.root.querySelector<HTMLElement>('#dispatchScrim');
    const shell = this.root.querySelector<HTMLElement>('.ma-dispatch-shell');

    gsap.killTweensOf([this.root, scrim, shell]);
    await new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Guard against race conditions: if enter() was called while exiting, don't hide root
          if (!this.visible && this.root) {
            this.root.style.display = 'none';
          }
          if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
            this.previouslyFocusedElement.focus();
          }
          resolve();
        }
      });

      if (scrim) {
        tl.to(scrim, { opacity: 0, duration: 0.28, ease: 'power2.in' }, 0);
      }
      if (shell) {
        tl.to(shell, { opacity: 0, y: 12, duration: 0.32, ease: 'power2.in' }, 0);
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
