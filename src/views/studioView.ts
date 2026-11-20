/**
 * StudioView — Editorial Studio & Services Overlay (/studio)
 * 
 * Merges About, Services, 3-Step Process, Pricing Brackets, and AEO/GEO FAQ
 * into a luxury editorial split-screen experience floating over the ambient 3D cylinder.
 */

import gsap from 'gsap';
import { SpatialView } from './baseView';

export class StudioView implements SpatialView {
  public readonly id = 'studio';
  private root: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private visible = false;
  private onCloseCallback?: () => void;
  private onHireCallback?: () => void;

  constructor(options: { onClose?: () => void; onHire?: () => void } = {}) {
    this.onCloseCallback = options.onClose;
    this.onHireCallback = options.onHire;
  }

  public mount(container: HTMLElement): void {
    this.container = container;
    this.root = document.createElement('div');
    this.root.className = 'ma-studio-overlay';
    this.root.id = 'studioView';
    this.root.setAttribute('aria-hidden', 'true');
    this.root.style.display = 'none';

    this.root.innerHTML = `
      <div class="ma-studio-backdrop"></div>
      <div class="ma-studio-scroller" id="studioScroller">
        <div class="ma-studio-container">
          
          <!-- Top Bar Action -->
          <div class="ma-studio-header-bar">
            <span class="ma-studio-tag">STUDIO & SERVICES — SHOWCASE3D.CLOUD</span>
            <button class="ma-studio-close-btn" id="studioCloseBtn" type="button" aria-label="Close Studio">
              <span class="ma-studio-close-icon">✕</span>
              <span class="ma-studio-close-label">RETURN TO WORK</span>
            </button>
          </div>

          <!-- Hero Section -->
          <section class="ma-studio-hero">
            <div class="ma-studio-eyebrow">CREATIVE TECHNOLOGY & SPATIAL WEB DESIGN</div>
            <h1 class="ma-studio-headline">Where digital spaces come to life.</h1>
            <p class="ma-studio-lead">
              We design and engineer bespoke, high-performance 3D websites that turn ordinary brand visits into unforgettable interactive spaces. Every project balances museum-grade aesthetics with 60 FPS mobile performance.
            </p>

            <div class="ma-studio-stats">
              <div class="ma-studio-stat-item">
                <span class="ma-stat-val">&lt; 1 MB</span>
                <span class="ma-stat-label">Initial Codebase</span>
              </div>
              <div class="ma-studio-stat-item">
                <span class="ma-stat-val">60 FPS</span>
                <span class="ma-stat-label">Mobile Frame Budget</span>
              </div>
              <div class="ma-studio-stat-item">
                <span class="ma-stat-val">WebGL 2.0</span>
                <span class="ma-stat-label">Custom GLSL Shaders</span>
              </div>
              <div class="ma-studio-stat-item">
                <span class="ma-stat-val">Worldwide</span>
                <span class="ma-stat-label">Remote Availability</span>
              </div>
            </div>
          </section>

          <!-- Philosophy Grid -->
          <section class="ma-studio-section">
            <h2 class="ma-studio-section-title">The Three Pillars</h2>
            <div class="ma-studio-grid">
              <div class="ma-studio-card">
                <div class="ma-card-num">01</div>
                <h3 class="ma-card-title">Performance Before Splendor</h3>
                <p class="ma-card-body">
                  A 3D website that freezes a phone is a broken website. We enforce strict draw-call budgets, geometry instancing, and lazy asset buffering so interactive web spaces stay silky smooth on any device.
                </p>
              </div>
              <div class="ma-studio-card">
                <div class="ma-card-num">02</div>
                <h3 class="ma-card-title">Calm Contemporary Gallery</h3>
                <p class="ma-card-body">
                  No neon overload or chaotic dashboard clutter. We build spacious, confident, warm-monochrome spaces where your brand and products supply the color and energy.
                </p>
              </div>
              <div class="ma-studio-card">
                <div class="ma-card-num">03</div>
                <h3 class="ma-card-title">Commercial Conversion</h3>
                <p class="ma-card-body">
                  Our interactive showcases don’t just win design awards; they convert visitors into qualified high-budget clients, investors, and loyal brand advocates.
                </p>
              </div>
            </div>
          </section>

          <!-- 3-Step Process -->
          <section class="ma-studio-section">
            <h2 class="ma-studio-section-title">How We Deliver: 3-Step Timeline</h2>
            <div class="ma-process-timeline">
              <div class="ma-process-step">
                <div class="ma-step-indicator">
                  <span class="ma-step-phase">WEEKS 1–2</span>
                  <div class="ma-step-bullet"></div>
                </div>
                <div class="ma-step-content">
                  <h3 class="ma-step-title">Discovery & Spatial Art Direction</h3>
                  <p class="ma-step-desc">
                    Art direction, moodboards, creative concept definition, and custom 3D asset preparation (geometry simplification, GLTF texture compression).
                  </p>
                </div>
              </div>

              <div class="ma-process-step">
                <div class="ma-step-indicator">
                  <span class="ma-step-phase">WEEKS 3–4</span>
                  <div class="ma-step-bullet"></div>
                </div>
                <div class="ma-step-content">
                  <h3 class="ma-step-title">Interactive WebGL Prototyping</h3>
                  <p class="ma-step-desc">
                    Camera physics choreography, custom GLSL vertex/fragment shaders, tactile haptics, spatial audio synthesis, and responsive mesh scaling.
                  </p>
                </div>
              </div>

              <div class="ma-process-step">
                <div class="ma-step-indicator">
                  <span class="ma-step-phase">WEEKS 5–6</span>
                  <div class="ma-step-bullet"></div>
                </div>
                <div class="ma-step-content">
                  <h3 class="ma-step-title">Polish, Optimization & Global Launch</h3>
                  <p class="ma-step-desc">
                    Mobile Lighthouse 90+ auditing, cross-browser validation (Chrome, Safari, Firefox, Edge, iOS/Android), SEO/AEO structured data injection, and production DNS deployment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Service Offerings -->
          <section class="ma-studio-section">
            <h2 class="ma-studio-section-title">Capabilities & Offerings</h2>
            <div class="ma-services-list">
              <div class="ma-service-row">
                <div class="ma-service-col-main">
                  <h3 class="ma-service-name">Bespoke 3D Brand Experiences</h3>
                  <p class="ma-service-summary">Flagship immersive digital spaces for modern brands, luxury products, and design forward studios.</p>
                </div>
                <div class="ma-service-col-meta">
                  <span class="ma-service-pill">4–6 Weeks Delivery</span>
                  <span class="ma-service-pill">From $12,500</span>
                </div>
              </div>

              <div class="ma-service-row">
                <div class="ma-service-col-main">
                  <h3 class="ma-service-name">Interactive 3D Product Visualizers</h3>
                  <p class="ma-service-summary">Real-time customizable 3D product configurators with lighting controls, tactile material swaps, and seamless e-commerce integration.</p>
                </div>
                <div class="ma-service-col-meta">
                  <span class="ma-service-pill">3–5 Weeks Delivery</span>
                  <span class="ma-service-pill">From $8,500</span>
                </div>
              </div>

              <div class="ma-service-row">
                <div class="ma-service-col-main">
                  <h3 class="ma-service-name">Creative Engineering for Agencies</h3>
                  <p class="ma-service-summary">White-label WebGL engineering, GLSL shader authoring, and performance audits for premier design and advertising agencies worldwide.</p>
                </div>
                <div class="ma-service-col-meta">
                  <span class="ma-service-pill">Sprint / Retainer</span>
                  <span class="ma-service-pill">Custom Scope</span>
                </div>
              </div>
            </div>
          </section>

          <!-- AEO / GEO Structured FAQ -->
          <section class="ma-studio-section">
            <h2 class="ma-studio-section-title">Frequently Answered Questions</h2>
            <div class="ma-faq-accordion">
              <details class="ma-faq-item" open>
                <summary class="ma-faq-q">How do you ensure 3D websites run smoothly on mobile devices?</summary>
                <div class="ma-faq-a">
                  We enforce sub-1MB initial bundles, responsive geometry LOD (level-of-detail), and power-efficient rendering loops. When text overlays appear, the 3D scene automatically throttles its framerate to save battery life.
                </div>
              </details>

              <details class="ma-faq-item">
                <summary class="ma-faq-q">What technology stack do you build with?</summary>
                <div class="ma-faq-a">
                  We specialize in pure WebGL 2.0, Three.js, custom GLSL shaders, GSAP animation orchestration, TypeScript, and modern SSR/SSG frameworks (Astro and Next.js).
                </div>
              </details>

              <details class="ma-faq-item">
                <summary class="ma-faq-q">Do 3D websites hurt search engine rankings (SEO)?</summary>
                <div class="ma-faq-a">
                  No. With our persistent decoupled architecture, all page copy, headings, and metadata reside in standard semantic HTML crawlable by search bots and AI answer engines. The 3D canvas runs independently without blocking page indexing.
                </div>
              </details>
            </div>
          </section>

          <!-- Studio Hire CTA Footer -->
          <section class="ma-studio-cta">
            <h2 class="ma-cta-headline">Ready to build something unforgettable?</h2>
            <p class="ma-cta-sub">Tell us about your brand, vision, and timeline. We respond to all qualified briefs within one business day.</p>
            <div class="ma-cta-actions">
              <button class="ma-cta-hire-btn" id="studioHireBtn" type="button">START A PROJECT Brief ↗</button>
              <button class="ma-cta-back-btn" id="studioBackBtn" type="button">EXPLORE SELECTED WORK</button>
            </div>
          </section>

        </div>
      </div>
    `;

    this.container.appendChild(this.root);
    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this.root) return;

    const closeBtn = this.root.querySelector('#studioCloseBtn');
    closeBtn?.addEventListener('click', () => this.onCloseCallback?.());

    const backBtn = this.root.querySelector('#studioBackBtn');
    backBtn?.addEventListener('click', () => this.onCloseCallback?.());

    const hireBtn = this.root.querySelector('#studioHireBtn');
    hireBtn?.addEventListener('click', () => this.onHireCallback?.());
  }

  public async enter(): Promise<void> {
    if (!this.root) return;
    this.visible = true;
    this.root.style.display = 'block';
    this.root.setAttribute('aria-hidden', 'false');

    const scroller = this.root.querySelector('#studioScroller');
    if (scroller) scroller.scrollTop = 0;

    gsap.killTweensOf(this.root);
    gsap.fromTo(
      this.root,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }
    );
  }

  public async exit(): Promise<void> {
    if (!this.root || !this.visible) return;
    this.visible = false;
    this.root.setAttribute('aria-hidden', 'true');

    gsap.killTweensOf(this.root);
    await new Promise<void>((resolve) => {
      gsap.to(this.root!, {
        opacity: 0,
        y: -16,
        duration: 0.35,
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
