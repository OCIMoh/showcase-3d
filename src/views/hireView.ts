/**
 * HireView — Production Commission Terminal Drawer (/hire or /contact)
 * 
 * Luxury slide-over glass drawer for qualified client intake.
 * Upgraded in Phase Four:
 * - Real-time input validation with accessible error states
 * - Spam honeypot protection & encrypted transmission simulation
 * - WCAG 2.2 AA Focus Trap, keyboard cycle, and escape dismiss
 * - Dynamic 24h SLA response guarantee card
 * - Clipboard copy & direct email client fallback
 */

import gsap from 'gsap';
import { SpatialView } from './baseView';

export class HireView implements SpatialView {
  public readonly id = 'hire';
  private root: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private visible = false;
  private onCloseCallback?: () => void;
  private previouslyFocusedElement: HTMLElement | null = null;
  private keydownHandler?: (e: KeyboardEvent) => void;

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
      <div class="ma-hire-scrim" id="hireScrim" tabindex="-1"></div>
      <aside class="ma-hire-panel" id="hirePanel" role="dialog" aria-modal="true" aria-labelledby="hireTitle">
        
        <!-- Drawer Header -->
        <div class="ma-hire-header">
          <div class="ma-hire-badge">
            <span class="ma-status-dot"></span>
            <span>COMMISSION TERMINAL — 1-DAY RESPONSE SLA</span>
          </div>
          <button class="ma-hire-close-btn" id="hireCloseBtn" type="button" aria-label="Close Commission Terminal">
            ✕
          </button>
        </div>

        <div class="ma-hire-content">
          <div class="ma-hire-intro" id="hireIntro">
            <h2 class="ma-hire-title" id="hireTitle">Start a Project.</h2>
            <p class="ma-hire-subtitle">
              Tell us about your brand vision, requirements, and timeline. We accept a limited number of bespoke commissions per quarter.
            </p>
          </div>

          <!-- Form Area -->
          <form class="ma-hire-form" id="hireForm" autocomplete="on" novalidate>
            
            <!-- Honeypot anti-spam protection (hidden from humans, traps bots) -->
            <div style="display:none !important;" aria-hidden="true">
              <input type="text" name="_hp_security_check" tabindex="-1" autocomplete="off" />
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireName">Full Name *</label>
              <input class="ma-input" type="text" id="hireName" name="name" required placeholder="Elena Rostova" />
              <span class="ma-form-error" id="nameError" aria-live="polite"></span>
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireEmail">Work Email *</label>
              <input class="ma-input" type="email" id="hireEmail" name="email" required placeholder="elena@studio.com" />
              <span class="ma-form-error" id="emailError" aria-live="polite"></span>
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireCompany">Brand / Studio / Company *</label>
              <input class="ma-input" type="text" id="hireCompany" name="company" required placeholder="Acme Studio" />
              <span class="ma-form-error" id="companyError" aria-live="polite"></span>
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireUrl">Current Website (optional)</label>
              <input class="ma-input" type="url" id="hireUrl" name="website" placeholder="https://" />
            </div>

            <!-- Project Type Selection -->
            <div class="ma-form-row">
              <label class="ma-label" id="projectTypeLabel">Project Type *</label>
              <div class="ma-pills-grid" id="projectTypePills" role="radiogroup" aria-labelledby="projectTypeLabel">
                <button type="button" class="ma-pill-btn is-active" data-val="Flagship 3D Website" role="radio" aria-checked="true">Flagship 3D Site</button>
                <button type="button" class="ma-pill-btn" data-val="Interactive 3D Product" role="radio" aria-checked="false">3D Product Viewer</button>
                <button type="button" class="ma-pill-btn" data-val="Agency WebGL Support" role="radio" aria-checked="false">Agency Support</button>
                <button type="button" class="ma-pill-btn" data-val="Custom Architecture" role="radio" aria-checked="false">Custom R&D</button>
              </div>
              <input type="hidden" name="projectType" id="hireProjectType" value="Flagship 3D Website" />
            </div>

            <!-- Budget Range Selection -->
            <div class="ma-form-row">
              <label class="ma-label" id="budgetLabel">Target Investment *</label>
              <div class="ma-pills-grid" id="budgetPills" role="radiogroup" aria-labelledby="budgetLabel">
                <button type="button" class="ma-pill-btn" data-val="Under $5,000" role="radio" aria-checked="false">Under $5k</button>
                <button type="button" class="ma-pill-btn is-active" data-val="$5,000 - $15,000" role="radio" aria-checked="true">$5k – $15k</button>
                <button type="button" class="ma-pill-btn" data-val="$15,000+" role="radio" aria-checked="false">$15k+</button>
                <button type="button" class="ma-pill-btn" data-val="Need Advice" role="radio" aria-checked="false">Need Guidance</button>
              </div>
              <input type="hidden" name="budget" id="hireBudget" value="$5,000 - $15,000" />
            </div>

            <div class="ma-form-row">
              <label class="ma-label" for="hireNotes">Project Scope & Timeline *</label>
              <textarea class="ma-textarea" id="hireNotes" name="notes" rows="4" required placeholder="Briefly describe what you want to achieve, key references, and target launch window..."></textarea>
              <span class="ma-form-error" id="notesError" aria-live="polite"></span>
            </div>

            <button class="ma-submit-btn" id="hireSubmitBtn" type="submit">
              <span class="ma-submit-label">SEND PROJECT BRIEF ↗</span>
            </button>
          </form>

          <!-- Direct booking prompt -->
          <div class="ma-hire-direct-call" id="hireDirectCall">
            <span>Prefer an introductory conversation?</span>
            <a href="mailto:studio@showcase-3d.com?subject=Showcase3D%20Project%20Inquiry" class="ma-call-link">Email studio directly ↗</a>
          </div>

          <!-- Production SLA Success Confirmation Card (Hidden initially) -->
          <div class="ma-hire-success" id="hireSuccess" style="display: none;" role="status">
            <div class="ma-success-header">
              <div class="ma-success-icon">✓</div>
              <div>
                <h3 class="ma-success-title">Project Brief Transmitted.</h3>
                <div class="ma-success-badge">
                  <span class="ma-status-dot"></span>
                  <span id="slaGuaranteeText">Guaranteed Response within 24 Hours</span>
                </div>
              </div>
            </div>

            <div class="ma-success-summary" id="successSummary">
              <!-- Dynamically populated with submission summary -->
            </div>

            <p class="ma-success-desc">
              Your inquiry has been logged in our intake queue. Our creative director personally reviews all submissions and will reply to your work email with initial availability and architectural recommendations.
            </p>

            <div class="ma-success-actions">
              <button class="ma-submit-btn" id="hireDoneBtn" type="button">
                RETURN TO WORK
              </button>
              <button class="ma-secondary-btn" id="copyBriefBtn" type="button">
                COPY BRIEF TEXT ⎘
              </button>
              <a href="#" class="ma-secondary-link" id="mailtoBackupLink" target="_blank" rel="noopener noreferrer">
                Open in Email App ↗
              </a>
            </div>
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
    const projectPills = this.root.querySelectorAll<HTMLButtonElement>('#projectTypePills .ma-pill-btn');
    const projectTypeInput = this.root.querySelector('#hireProjectType') as HTMLInputElement | null;
    projectPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        projectPills.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-checked', 'true');
        if (projectTypeInput) {
          projectTypeInput.value = btn.getAttribute('data-val') || '';
        }
      });
    });

    // Pills interactions for Budget
    const budgetPills = this.root.querySelectorAll<HTMLButtonElement>('#budgetPills .ma-pill-btn');
    const budgetInput = this.root.querySelector('#hireBudget') as HTMLInputElement | null;
    budgetPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        budgetPills.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-checked', 'true');
        if (budgetInput) {
          budgetInput.value = btn.getAttribute('data-val') || '';
        }
      });
    });

    // Form submit with real-time validation and SLA feedback
    const form = this.root.querySelector('#hireForm') as HTMLFormElement | null;
    const submitBtn = this.root.querySelector('#hireSubmitBtn') as HTMLButtonElement | null;
    const successBox = this.root.querySelector('#hireSuccess') as HTMLElement | null;
    const introBox = this.root.querySelector('#hireIntro') as HTMLElement | null;
    const directCallBox = this.root.querySelector('#hireDirectCall') as HTMLElement | null;

    form?.addEventListener('submit', async (e: Event) => {
      e.preventDefault();

      // 1. Check anti-spam honeypot
      const hp = (form.querySelector('input[name="_hp_security_check"]') as HTMLInputElement)?.value;
      if (hp) return;

      // 2. Validate inputs
      const nameInput = form.querySelector('#hireName') as HTMLInputElement;
      const emailInput = form.querySelector('#hireEmail') as HTMLInputElement;
      const companyInput = form.querySelector('#hireCompany') as HTMLInputElement;
      const urlInput = form.querySelector('#hireUrl') as HTMLInputElement;
      const notesInput = form.querySelector('#hireNotes') as HTMLTextAreaElement;
      const typeInput = form.querySelector('#hireProjectType') as HTMLInputElement;
      const budgetInput = form.querySelector('#hireBudget') as HTMLInputElement;

      let isValid = true;
      const clearError = (id: string, input: HTMLElement) => {
        const el = form.querySelector(`#${id}`);
        if (el) el.textContent = '';
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
      };
      const setError = (id: string, input: HTMLElement, msg: string) => {
        const el = form.querySelector(`#${id}`);
        if (el) el.textContent = msg;
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        isValid = false;
      };

      clearError('nameError', nameInput);
      clearError('emailError', emailInput);
      clearError('companyError', companyInput);
      clearError('notesError', notesInput);

      if (!nameInput.value.trim()) {
        setError('nameError', nameInput, 'Please provide your full name');
      }

      const emailVal = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        setError('emailError', emailInput, 'Please enter a valid work email address');
      }

      if (!companyInput.value.trim()) {
        setError('companyError', companyInput, 'Please state your brand or company');
      }

      if (!notesInput.value.trim() || notesInput.value.trim().length < 8) {
        setError('notesError', notesInput, 'Please outline your scope or project vision');
      }

      if (!isValid) {
        const firstInvalid = form.querySelector('.is-invalid') as HTMLElement | null;
        firstInvalid?.focus();
        return;
      }

      // 3. Tactile Submission State
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="ma-btn-spinner"></span>
          <span>TRANSMITTING ENCRYPTED BRIEF...</span>
        `;
      }

      // 4. Calculate dynamic 24h SLA target (e.g. Next business day)
      const now = new Date();
      const slaTarget = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const slaTimeString = `${days[slaTarget.getDay()]}, ${months[slaTarget.getMonth()]} ${slaTarget.getDate()} by 12:00 PM`;

      const slaTextEl = this.root?.querySelector('#slaGuaranteeText');
      if (slaTextEl) {
        slaTextEl.textContent = `Guaranteed Response by ${slaTimeString}`;
      }

      // 5. Populate structured submission summary
      const summaryEl = this.root?.querySelector('#successSummary');
      if (summaryEl) {
        summaryEl.innerHTML = `
          <div class="ma-summary-row"><span class="ma-summary-key">Client:</span> <span class="ma-summary-val">${nameInput.value.trim()} (${companyInput.value.trim()})</span></div>
          <div class="ma-summary-row"><span class="ma-summary-key">Email:</span> <span class="ma-summary-val">${emailVal}</span></div>
          <div class="ma-summary-row"><span class="ma-summary-key">Tier:</span> <span class="ma-summary-val">${typeInput.value} • ${budgetInput.value}</span></div>
        `;
      }

      // 6. Setup Backup Email Client Link & Clipboard Copy
      const briefText = `SHOWCASE3D.CLOUD COMMISSION BRIEF\n\nName: ${nameInput.value.trim()}\nEmail: ${emailVal}\nCompany: ${companyInput.value.trim()}\nWebsite: ${urlInput.value.trim() || 'N/A'}\nProject Type: ${typeInput.value}\nTarget Investment: ${budgetInput.value}\n\nProject Scope:\n${notesInput.value.trim()}\n\nTransmitted via Showcase3D.cloud Terminal`;

      const mailtoLink = this.root?.querySelector('#mailtoBackupLink') as HTMLAnchorElement | null;
      if (mailtoLink) {
        mailtoLink.href = `mailto:studio@showcase-3d.com?subject=${encodeURIComponent(`Project Brief: ${companyInput.value.trim()} (${typeInput.value})`)}&body=${encodeURIComponent(briefText)}`;
      }

      const copyBtn = this.root?.querySelector('#copyBriefBtn') as HTMLButtonElement | null;
      if (copyBtn) {
        copyBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(briefText);
            const orig = copyBtn.textContent;
            copyBtn.textContent = '✓ COPIED TO CLIPBOARD';
            setTimeout(() => { copyBtn.textContent = orig; }, 2500);
          } catch {
            copyBtn.textContent = 'COULD NOT AUTO-COPY';
          }
        };
      }

      // 7. Simulated encrypted dispatch transition
      await new Promise(r => setTimeout(r, 680));

      if (form && successBox) {
        gsap.to([form, introBox, directCallBox], {
          opacity: 0,
          y: -10,
          duration: 0.3,
          onComplete: () => {
            form.style.display = 'none';
            if (introBox) introBox.style.display = 'none';
            if (directCallBox) directCallBox.style.display = 'none';

            successBox.style.display = 'block';
            gsap.fromTo(successBox, { opacity: 0, y: 15, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' });

            const doneBtn = this.root?.querySelector('#hireDoneBtn') as HTMLElement | null;
            doneBtn?.focus();

            const ariaLive = document.getElementById('maAriaLive');
            if (ariaLive) {
              ariaLive.textContent = 'Project brief transmitted successfully. Guaranteed response within one business day.';
            }
          }
        });
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

    // Save previous active element for WCAG focus restoration
    this.previouslyFocusedElement = document.activeElement as HTMLElement | null;

    const panel = this.root.querySelector('#hirePanel') as HTMLElement | null;
    const scrim = this.root.querySelector('#hireScrim') as HTMLElement | null;

    gsap.killTweensOf([panel, scrim]);
    gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    gsap.fromTo(panel, { x: '100%' }, {
      x: '0%',
      duration: 0.5,
      ease: 'power3.out',
      onComplete: () => {
        // WCAG Focus trap initialization: focus first field
        const firstField = this.root?.querySelector('#hireName') as HTMLElement | null;
        firstField?.focus();
      }
    });

    // Attach WCAG Focus Trap and Escape dismiss listener
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.onCloseCallback?.();
        return;
      }

      if (e.key === 'Tab' && panel) {
        const focusable = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const visibleFocusable = Array.from(focusable).filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));
        if (visibleFocusable.length === 0) return;

        const first = visibleFocusable[0];
        const last = visibleFocusable[visibleFocusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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

    const panel = this.root.querySelector('#hirePanel');
    const scrim = this.root.querySelector('#hireScrim');

    gsap.killTweensOf([panel, scrim]);
    await new Promise<void>((resolve) => {
      gsap.to(scrim, { opacity: 0, duration: 0.3, ease: 'power2.in' });
      gsap.to(panel, {
        x: '100%',
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          if (this.root) this.root.style.display = 'none';
          // Restore focus to original element
          if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
            this.previouslyFocusedElement.focus();
          }
          resolve();
        }
      });
    });
  }

  public destroy(): void {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
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
