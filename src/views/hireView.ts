/**
 * HireView — Commission Terminal Drawer (/hire or /contact)
 * 
 * Luxury slide-over glass drawer for qualified project intake.
 * Includes budget bracket selectors, project types, spam honeypot, and SLA badge.
 */

import gsap from 'gsap';
import { SpatialView } from './baseView';

export class HireView implements SpatialView {
  public readonly id = 'hire';
  private root: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private visible = false;
  private onCloseCallback?: () => void;

  constructor(options: { onClose?: () => void } = {}) {
    this.onCloseCallback = options.onClose;
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.root = document.createElement('div');
    this.root.className = 'ma-hire-drawer-root';
    this.root.id = 'hireDrawer';
    this.root.setAttribute('aria-hidden', 'true');
    this.root.style.display = 'none';

    this.root.innerHTML = `
      <div class="ma-hire-scrim" id="hireScrim"></div>
      <aside class="ma-hire-panel" id="hirePanel" role="dialog" aria-modal="true" aria-labelledby="hireTitle">
        
        <!-- Drawer Header -->
        <div class="ma-hire-header">
          <div class="ma-hire-badge">
            <span class="ma-status-dot"></span>
            <span>COMMISSION TERMINAL — 1 DAY RESPONSE SLA</span>
          </div>
          <button class="ma-hire-close-btn" id="hireCloseBtn" type="button" aria-label="Close Terminal">
            ✕
          </button>
        </div>

        <div class="ma-hire-content">
          <div class="ma-hire-intro">
            <h2 class="ma-hire-title" id="hireTitle">Start a Project.</h2>
            <p class="ma-hire-subtitle">
              Tell us about your brand vision, requirements, and timeline. We accept a limited number of bespoke commissions per quarter.
            </p>
          </div>

          <!-- Form Area -->
          <form class="ma-hire-form" id="hireForm" autocomplete="on">
            
            <!-- Honeypot anti-spam protection -->
            <input type="text" name="_hp_security_check" style="display:none !important;" tabindex="-1" autocomplete="off" />

            <div class="ma-form-row">
              <label class="ma-label" for="hireName">Full Name *</label>
              <input class="ma-input" type="text" id="hireName" name="name" required placeholder="Elena Rostova" />
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireEmail">Work Email *</label>
              <input class="ma-input" type="email" id="hireEmail" name="email" required placeholder="elena@studio.com" />
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireCompany">Brand / Studio / Company *</label>
              <input class="ma-input" type="text" id="hireCompany" name="company" required placeholder="Acme Studio" />
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireUrl">Current Website (optional)</label>
              <input class="ma-input" type="url" id="hireUrl" name="website" placeholder="https://" />
            </div>

            <!-- Project Type Selection -->
            <div class="ma-form-row">
              <label class="ma-label">Project Type *</label>
              <div class="ma-pills-grid" id="projectTypePills">
                <button type="button" class="ma-pill-btn is-active" data-val="Flagship 3D Website">Flagship 3D Site</button>
                <button type="button" class="ma-pill-btn" data-val="Interactive 3D Product">3D Product Viewer</button>
                <button type="button" class="ma-pill-btn" data-val="Agency WebGL Support">Agency Support</button>
                <button type="button" class="ma-pill-btn" data-val="Custom Architecture">Custom R&D</button>
              </div>
              <input type="hidden" name="projectType" id="hireProjectType" value="Flagship 3D Website" />
            </div>

            <!-- Budget Range Selection -->
            <div class="ma-form-row">
              <label class="ma-label">Target Investment *</label>
              <div class="ma-pills-grid" id="budgetPills">
                <button type="button" class="ma-pill-btn" data-val="Under $5,000">Under $5k</button>
                <button type="button" class="ma-pill-btn is-active" data-val="$5,000 - $15,000">$5k – $15k</button>
                <button type="button" class="ma-pill-btn" data-val="$15,000+">$15k+</button>
                <button type="button" class="ma-pill-btn" data-val="Need Advice">Need Guidance</button>
              </div>
              <input type="hidden" name="budget" id="hireBudget" value="$5,000 - $15,000" />
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireNotes">Project Scope & Timeline *</label>
              <textarea class="ma-textarea" id="hireNotes" name="notes" rows="4" required placeholder="Briefly describe what you want to achieve, any key reference links, and target delivery date..."></textarea>
            </div>

            <button class="ma-submit-btn" id="hireSubmitBtn" type="submit">
              <span>SEND PROJECT BRIEF ↗</span>
            </button>
          </form>

          <!-- Direct booking prompt -->
          <div class="ma-hire-direct-call">
            <span>Prefer an introductory conversation?</span>
            <a href="mailto:hello@showcase3d.cloud?subject=Showcase3D%20Project%20Inquiry" class="ma-call-link">Email studio directly ↗</a>
          </div>

          <!-- Success State View (hidden by default) -->
          <div class="ma-hire-success" id="hireSuccess" style="display: none;">
            <div class="ma-success-icon">✓</div>
            <h3 class="ma-success-title">Brief Received.</h3>
            <p class="ma-success-desc">
              Thank you for reaching out. We have received your inquiry and our creative director will respond to your work email within one business day.
            </p>
            <button class="ma-submit-btn" id="hireDoneBtn" type="button">
              RETURN TO WORK
            </button>
          </div>

        </div>
      </aside>
    `;

    this.container.appendChild(this.root);
    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.root) return;

    const closeBtn = this.root.querySelector('#hireCloseBtn');
    closeBtn?.addEventListener('click', () => this.onCloseCallback?.());

    const scrim = this.root.querySelector('#hireScrim');
    scrim?.addEventListener('click', () => this.onCloseCallback?.());

    // Pills interactions for Project Type
    const projectPills = this.root.querySelectorAll('#projectTypePills .ma-pill-btn');
    const projectTypeInput = this.root.querySelector('#hireProjectType') as HTMLInputElement | null;
    projectPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        projectPills.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (projectTypeInput) {
          projectTypeInput.value = btn.getAttribute('data-val') || '';
        }
      });
    });

    // Pills interactions for Budget
    const budgetPills = this.root.querySelectorAll('#budgetPills .ma-pill-btn');
    const budgetInput = this.root.querySelector('#hireBudget') as HTMLInputElement | null;
    budgetPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        budgetPills.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (budgetInput) {
          budgetInput.value = btn.getAttribute('data-val') || '';
        }
      });
    });

    // Form submit
    const form = this.root.querySelector('#hireForm') as HTMLFormElement | null;
    const successBox = this.root.querySelector('#hireSuccess') as HTMLElement | null;
    form?.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      const honeypot = (form.querySelector('input[name="_hp_security_check"]') as HTMLInputElement)?.value;
      if (honeypot) {
        // Spam detected, silent return
        return;
      }

      // Show success state
      if (form && successBox) {
        form.style.display = 'none';
        successBox.style.display = 'block';
        gsap.fromTo(successBox, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.2)' });
      }
    });

    const doneBtn = this.root.querySelector('#hireDoneBtn');
    doneBtn?.addEventListener('click', () => this.onCloseCallback?.());
  }

  public async enter(): Promise<void> {
    if (!this.root) return;
    this.visible = true;
    this.root.style.display = 'block';
    this.root.setAttribute('aria-hidden', 'false');

    const panel = this.root.querySelector('#hirePanel');
    const scrim = this.root.querySelector('#hireScrim');

    gsap.killTweensOf([panel, scrim]);
    gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo(panel, { x: '100%' }, { x: '0%', duration: 0.55, ease: 'power3.out' });
  }

  public async exit(): Promise<void> {
    if (!this.root || !this.visible) return;
    this.visible = false;
    this.root.setAttribute('aria-hidden', 'true');

    const panel = this.root.querySelector('#hirePanel');
    const scrim = this.root.querySelector('#hireScrim');

    gsap.killTweensOf([panel, scrim]);
    await new Promise<void>((resolve) => {
      gsap.to(scrim, { opacity: 0, duration: 0.35, ease: 'power2.in' });
      gsap.to(panel, {
        x: '100%',
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          if (this.root) this.root.style.display = 'none';
          resolve();
        }
      });
    });
  }

  public destroy(): void {
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
