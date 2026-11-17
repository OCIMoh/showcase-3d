/**
 * ContactView — Minimalist Contact Page & Location Information (English)
 */

export function createContactView(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.innerHTML = `
    <header class="page-header">
      <span class="page-eyebrow">Get in Touch • Inquiries & Orders</span>
      <h1 class="page-title">Contact the Estate</h1>
      <p class="page-desc">
        We are at your service for questions about our botanical preserves, bespoke wholesale orders, and guided estate tours.
      </p>
    </header>

    <div class="contact-container">
      <div class="contact-card">
        <h3 style="font-family:var(--font-serif); font-size:1.4rem; color:var(--color-border); margin-bottom:20px;">
          Estate & Laboratory
        </h3>

        <div style="margin-bottom:24px; line-height:1.7; color:var(--color-text-muted);">
          <strong style="color:var(--color-border); font-family:var(--font-serif);">Floridia Estate:</strong><br/>
          Seconda strada c.da Piana S. Croce sn<br/>
          96014 Floridia (SR), Sicily — Italy
        </div>

        <div style="margin-bottom:24px; line-height:1.7; color:var(--color-text-muted);">
          <strong style="color:var(--color-border); font-family:var(--font-serif);">Catania Offices:</strong><br/>
          Via Generale Ameglio, 13<br/>
          95123 Catania (CT), Sicily
        </div>

        <div style="margin-bottom:24px; line-height:1.7; color:var(--color-text-muted);">
          <strong style="color:var(--color-border); font-family:var(--font-serif);">Direct Contacts:</strong><br/>
          Email: info@agrumeafarm-template.com<br/>
          Tel: +39 095 812 3456
        </div>

        <div style="padding:16px; background:rgba(233,78,27,0.06); border-radius:12px; border:1px solid rgba(233,78,27,0.2);">
          <span style="font-size:0.75rem; letter-spacing:0.1em; color:var(--color-orange); text-transform:uppercase; font-weight:600;">
            • LOCAL SICILIAN TIME:
          </span>
          <div id="sicilyClock" style="font-family:var(--font-serif); font-size:1.1rem; color:var(--color-border); margin-top:4px;">
            14:30 CET
          </div>
        </div>
      </div>

      <div class="contact-card">
        <form id="contactForm">
          <div class="form-group">
            <label class="form-label" for="contactName">Full Name</label>
            <input type="text" id="contactName" class="form-input" placeholder="e.g. Eleanor Vance" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="contactEmail">Email Address</label>
            <input type="email" id="contactEmail" class="form-input" placeholder="eleanor@example.com" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="contactSubject">Subject</label>
            <select id="contactSubject" class="form-input">
              <option value="dispensa">Pantry Catalog Inquiry</option>
              <option value="visite">Book an Estate Visit / Tasting</option>
              <option value="horeca">Wholesale & Culinary Supply</option>
              <option value="altro">General Inquiries</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="contactMessage">Message</label>
            <textarea id="contactMessage" class="form-textarea" rows="4" placeholder="How may we assist you today?" required></textarea>
          </div>

          <button type="submit" class="btn-submit">
            Send Message
          </button>
        </form>
      </div>
    </div>
  `;

  setTimeout(() => {
    const form = container.querySelector('#contactForm') as HTMLFormElement;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit') as HTMLButtonElement;
      if (btn) {
        btn.textContent = 'Message Sent Successfully! ✓';
        btn.style.backgroundColor = '#2f743e';
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.style.backgroundColor = '';
          form.reset();
        }, 3000);
      }
    });

    // Sicilian clock updater
    const clockEl = container.querySelector('#sicilyClock');
    if (clockEl) {
      const updateClock = () => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-US', { timeZone: 'Europe/Rome' }) + ' (Sicily, CET)';
      };
      updateClock();
      setInterval(updateClock, 1000);
    }
  }, 0);

  return container;
}
