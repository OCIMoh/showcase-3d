/**
 * SplitEditorialCarousel — Bi-Directional Counter-Motion Editorial Showcase
 * Inspired by Aesop (aesop.com), Byredo, and Locomotive Scroll.
 * 
 * Features:
 * 1. 50/50 Dual Counter-Motion: Jars slide UP while Editorial Text slides DOWN to meet at center
 * 2. Kinetic Masked Typography: Editorial titles and botanical notes reveal through overflow clip-paths
 * 3. Magnetic Inertial Snapping: Silky smooth LERP momentum with auto-docking to the nearest product
 * 4. Micro-Interactions: Jar 3D parallax hover, ingredients pill tags, terroir monograph
 * 5. Full Input Support: Wheel, pointer drag, keyboard arrows, vertical scrub rail
 * 6. Responsive: 50/50 desktop split transitions seamlessly to adaptive mobile stack
 * 7. 100% CORS-immune, 60fps hardware accelerated, zero external runtime dependencies
 */

import { Product } from '../data/products';

export interface SplitCarouselOptions {
  container: HTMLElement;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export class SplitEditorialCarousel {
  private container: HTMLElement;
  private products: Product[];
  private onSelectProduct?: (product: Product) => void;

  private wrapper!: HTMLElement;
  private textColumn!: HTMLElement;
  private visualColumn!: HTMLElement;
  private textPanels: HTMLElement[] = [];
  private visualPanels: HTMLElement[] = [];

  // HUD Elements
  private counterCurrent!: HTMLElement;
  private counterTotal!: HTMLElement;
  private scrubProgress!: HTMLElement;
  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;

  // Kinematics & Magnetic Snap State
  public currentPos = 0;       // Continuous smoothed position [0, N-1]
  public targetPos = 0;        // Target position
  private velocity = 0;
  private lastPos = 0;
  private lerpFactor = 0.082;
  private snapTimeoutId = 0;
  private isSnapping = false;

  // Drag tracking
  private isDragging = false;
  private hasDragged = false;
  private startY = 0;
  private startTargetPos = 0;
  private lastDragY = 0;
  private lastDragTime = 0;
  private dragVelocity = 0;

  // Dimensions
  private isMobile = false;

  // Animation & Loop
  private isRunning = true;
  private animationFrameId = 0;
  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }[] = [];

  constructor(options: SplitCarouselOptions) {
    this.container = options.container;
    this.products = options.products;
    this.onSelectProduct = options.onSelectProduct;

    this.checkMobile();
    this.buildDOM();
    this.bindEvents();

    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 860;
  }

  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'split-carousel';
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'Bi-Directional Editorial Split Showcase');

    const totalCountStr = String(this.products.length).padStart(2, '0');

    this.wrapper.innerHTML = `
      <!-- Ambient Background Arch Layer -->
      <div class="split-carousel__ambient-bg" aria-hidden="true">
        <div class="split-carousel__bg-glow"></div>
      </div>

      <!-- Center Dividing Axis Line (Desktop) -->
      <div class="split-carousel__axis" aria-hidden="true"></div>

      <!-- Left Column: Editorial Monograph & Typographic Story -->
      <div class="split-carousel__col split-carousel__col--text" id="splitTextCol">
        <!-- Panels injected dynamically -->
      </div>

      <!-- Right Column: Monumental Floating Product Showcase -->
      <div class="split-carousel__col split-carousel__col--visual" id="splitVisualCol">
        <!-- Panels injected dynamically -->
      </div>

      <!-- Editorial HUD Navigation & Counter Dock -->
      <nav class="split-carousel__hud" aria-label="Editorial Controls">
        <div class="split-carousel__counter">
          <span class="split-carousel__counter-now" id="splitCounterNow">01</span>
          <span class="split-carousel__counter-divider">/</span>
          <span class="split-carousel__counter-total" id="splitCounterTotal">${totalCountStr}</span>
        </div>

        <div class="split-carousel__scrub" id="splitScrubRail" role="slider" aria-label="Editorial Progress" aria-valuemin="1" aria-valuemax="${this.products.length}" aria-valuenow="1" tabindex="0">
          <div class="split-carousel__scrub-bar" id="splitScrubBar"></div>
        </div>

        <div class="split-carousel__nav-btns">
          <button class="split-carousel__btn split-carousel__btn--prev" id="splitPrevBtn" aria-label="Previous editorial product" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
          <button class="split-carousel__btn split-carousel__btn--next" id="splitNextBtn" aria-label="Next editorial product" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </button>
        </div>
      </nav>
    `;

    this.container.appendChild(this.wrapper);

    this.textColumn = this.wrapper.querySelector('#splitTextCol')!;
    this.visualColumn = this.wrapper.querySelector('#splitVisualCol')!;
    this.counterCurrent = this.wrapper.querySelector('#splitCounterNow')!;
    this.counterTotal = this.wrapper.querySelector('#splitCounterTotal')!;
    this.scrubProgress = this.wrapper.querySelector('#splitScrubBar')!;
    this.prevBtn = this.wrapper.querySelector('#splitPrevBtn')!;
    this.nextBtn = this.wrapper.querySelector('#splitNextBtn')!;

    // Build the panels for each product
    this.products.forEach((prod, idx) => {
      const formattedNum = String(idx + 1).padStart(2, '0');
      const categoryTag = prod.category.toUpperCase();

      // 1. Text Panel
      const textPanel = document.createElement('article');
      textPanel.className = 'split-text-panel';
      textPanel.dataset.index = String(idx);

      const ingredientsHtml = prod.ingredients
        .slice(0, 4)
        .map(ing => `<span class="split-text-panel__pill">${ing}</span>`)
        .join('');

      textPanel.innerHTML = `
        <div class="split-text-panel__inner">
          <div class="split-text-panel__meta-row">
            <span class="split-text-panel__tag">${categoryTag} • ARCHIVE</span>
            <span class="split-text-panel__weight">${prod.weight}</span>
          </div>

          <div class="split-text-panel__mask">
            <span class="split-text-panel__origin">${prod.origin}</span>
          </div>

          <div class="split-text-panel__mask split-text-panel__mask--title">
            <h2 class="split-text-panel__title">${prod.title}</h2>
          </div>

          <div class="split-text-panel__mask">
            <p class="split-text-panel__latin">${prod.latinSubtitle}</p>
          </div>

          <div class="split-text-panel__mask split-text-panel__mask--desc">
            <p class="split-text-panel__desc">${prod.description}</p>
          </div>

          <div class="split-text-panel__ingredients">
            <span class="split-text-panel__ing-title">TERROIR BOTANICALS:</span>
            <div class="split-text-panel__pills">
              ${ingredientsHtml}
            </div>
          </div>

          <div class="split-text-panel__footer">
            <span class="split-text-panel__price">${prod.price}</span>
            <button class="split-text-panel__cta" type="button" data-slug="${prod.slug}">
              <span>DISCOVER HARVEST</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </button>
          </div>
        </div>
      `;

      // Wire CTA button click
      const ctaBtn = textPanel.querySelector('.split-text-panel__cta');
      if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
          if (this.onSelectProduct) {
            this.onSelectProduct(prod);
          }
        });
      }

      this.textColumn.appendChild(textPanel);
      this.textPanels.push(textPanel);

      // 2. Visual Panel (Monumental Glass Jar)
      const visualPanel = document.createElement('div');
      visualPanel.className = 'split-visual-panel';
      visualPanel.dataset.index = String(idx);

      visualPanel.innerHTML = `
        <div class="split-visual-panel__inner">
          <!-- Ambient Circular Terroir Plate -->
          <div class="split-visual-panel__halo"></div>

          <!-- Monumental Jar with Parallax Depth -->
          <div class="split-visual-panel__stage">
            <img 
              class="split-visual-panel__img" 
              src="${prod.jarUrl}" 
              alt="${prod.title}" 
              loading="${idx < 3 ? 'eager' : 'lazy'}" 
              decoding="async" 
              draggable="false"
            />
          </div>

          <!-- Bottom Roman Plate Tag -->
          <div class="split-visual-panel__watermark">
            <span>NO. ${formattedNum}</span>
            <span>SICILIA</span>
          </div>
        </div>
      `;

      // Visual panel click to navigate
      visualPanel.addEventListener('click', () => {
        if (this.hasDragged) return;
        const activeIdx = Math.round(this.currentPos);
        if (idx === activeIdx) {
          if (this.onSelectProduct) {
            this.onSelectProduct(prod);
          }
        } else {
          this.snapToIndex(idx);
        }
      });

      this.visualColumn.appendChild(visualPanel);
      this.visualPanels.push(visualPanel);
    });
  }

  private bindEvents(): void {
    const add = (
      target: EventTarget,
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) => {
      target.addEventListener(type, handler, options);
      this.boundEvents.push({ target, type, handler, options });
    };

    // Pointer Drag Handling
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, .split-carousel__scrub')) return;

      this.isDragging = true;
      this.hasDragged = false;
      this.startY = e.clientY;
      this.lastDragY = e.clientY;
      this.lastDragTime = performance.now();
      this.startTargetPos = this.targetPos;
      this.dragVelocity = 0;

      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;

      const deltaY = e.clientY - this.startY;
      if (!this.hasDragged && Math.abs(deltaY) > 6) {
        this.hasDragged = true;
      }

      // 1 screen height swipe ≈ 1.2 product slides
      const screenH = window.innerHeight || 800;
      const posDelta = -(deltaY / (screenH * 0.75));
      this.targetPos = Math.max(-0.25, Math.min(this.products.length - 0.75, this.startTargetPos + posDelta));

      // Calculate instantaneous drag velocity
      const now = performance.now();
      const dt = Math.max(1, now - this.lastDragTime);
      const moveDelta = e.clientY - this.lastDragY;
      this.dragVelocity = (moveDelta / dt) * 16.67;
      this.lastDragY = e.clientY;
      this.lastDragTime = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }

      // Magnetic Flick Momentum & Snap
      if (Math.abs(this.dragVelocity) > 4) {
        const momentumSlides = -(this.dragVelocity / 60);
        this.targetPos += momentumSlides;
      }

      // Magnetically dock to nearest integer product
      this.snapToNearest();
    };

    add(this.wrapper, 'pointerdown', onPointerDown as EventListener);
    add(window, 'pointermove', onPointerMove as EventListener);
    add(window, 'pointerup', onPointerUp as EventListener);
    add(window, 'pointercancel', onPointerUp as EventListener);

    // Mouse Wheel (Virtual Scroll with Inertia)
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      const sensitivity = 0.0018;

      this.targetPos = Math.max(0, Math.min(this.products.length - 1, this.targetPos + delta * sensitivity));

      // Clear any pending magnetic snap while actively wheeling
      window.clearTimeout(this.snapTimeoutId);
      this.isSnapping = false;

      // Magnetic snap after user pauses wheeling for 120ms
      this.snapTimeoutId = window.setTimeout(() => {
        this.snapToNearest();
      }, 120);
    };
    add(this.wrapper, 'wheel', onWheel as EventListener, { passive: false });

    // Keyboard Arrow Navigation
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.stepBy(1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stepBy(-1);
      }
    };
    add(window, 'keydown', onKeyDown as EventListener);

    // Prev / Next Navigation Buttons
    if (this.prevBtn) {
      add(this.prevBtn, 'click', () => this.stepBy(-1));
    }
    if (this.nextBtn) {
      add(this.nextBtn, 'click', () => this.stepBy(1));
    }

    // Scrub Rail Interaction
    const scrubRail = this.wrapper.querySelector('#splitScrubRail');
    if (scrubRail) {
      add(scrubRail, 'pointerdown', (e: Event) => {
        const pe = e as PointerEvent;
        const rect = (scrubRail as HTMLElement).getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (pe.clientY - rect.top) / rect.height));
        const targetIdx = Math.round(progress * (this.products.length - 1));
        this.snapToIndex(targetIdx);
      });
    }

    // Window Resize
    const onResize = () => {
      this.checkMobile();
    };
    add(window, 'resize', onResize);
  }

  public stepBy(direction: number): void {
    const currentIdx = Math.round(this.currentPos);
    const nextIdx = Math.max(0, Math.min(this.products.length - 1, currentIdx + direction));
    this.snapToIndex(nextIdx);
  }

  public snapToIndex(index: number): void {
    this.targetPos = Math.max(0, Math.min(this.products.length - 1, index));
  }

  private snapToNearest(): void {
    const targetIdx = Math.round(this.targetPos);
    this.targetPos = Math.max(0, Math.min(this.products.length - 1, targetIdx));
  }

  private loop(): void {
    if (!this.isRunning) return;

    // Smooth LERP momentum
    this.currentPos += (this.targetPos - this.currentPos) * this.lerpFactor;

    // Velocity tracking for micro-parallax
    this.velocity = (this.currentPos - this.lastPos) * 60;
    this.lastPos = this.currentPos;

    // Render counter-motion columns
    this.renderColumns();

    // Render HUD
    this.renderHUD();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private renderColumns(): void {
    const num = this.products.length;

    for (let i = 0; i < num; i++) {
      const textPanel = this.textPanels[i];
      const visualPanel = this.visualPanels[i];
      if (!textPanel || !visualPanel) continue;

      // Relative distance of item i from current continuous position
      // When i === currentPos: diff = 0 (exact focal center)
      const diff = i - this.currentPos;

      // -------------------------------------------------------------
      // 1. Right Column (Visual): Slides UP as pos increases
      // -------------------------------------------------------------
      // Standard scroll: Y_vis = diff * 100%
      const visY = diff * 100;
      // Parallax depth scale & opacity: center is 1.0, adjacent items recede slightly
      const visScale = Math.max(0.78, 1 - Math.abs(diff) * 0.18);
      const visOpacity = Math.max(0, Math.min(1, 1 - Math.abs(diff) * 0.85));
      const visJarParallax = -diff * 45; // Jar floats ahead of panel

      visualPanel.style.transform = `translate3d(0, ${visY.toFixed(2)}%, 0)`;
      visualPanel.style.opacity = visOpacity.toFixed(3);
      visualPanel.style.pointerEvents = Math.abs(diff) < 0.4 ? 'auto' : 'none';

      const jarImg = visualPanel.querySelector<HTMLElement>('.split-visual-panel__img');
      if (jarImg) {
        jarImg.style.transform = `translate3d(0, ${visJarParallax.toFixed(1)}px, 0) scale(${visScale.toFixed(3)})`;
      }

      // -------------------------------------------------------------
      // 2. Left Column (Editorial Text): COUNTER-MOTION
      // -------------------------------------------------------------
      // On desktop: counter-motion means text slides DOWN as jar slides UP!
      // When diff > 0 (item is upcoming), text enters from ABOVE (-100% * diff)
      // When diff < 0 (item is past), text exits DOWNWARDS (+100% * -diff)
      const textY = this.isMobile ? (diff * 100) : (-diff * 100);
      const textOpacity = Math.max(0, Math.min(1, 1 - Math.abs(diff) * 0.95));

      textPanel.style.transform = `translate3d(0, ${textY.toFixed(2)}%, 0)`;
      textPanel.style.opacity = textOpacity.toFixed(3);
      textPanel.style.pointerEvents = Math.abs(diff) < 0.4 ? 'auto' : 'none';

      // Kinetic Masked Typographic Stagger:
      // Inner text lines stagger their entry when item approaches center
      const titleEl = textPanel.querySelector<HTMLElement>('.split-text-panel__title');
      const descEl = textPanel.querySelector<HTMLElement>('.split-text-panel__desc');
      const ctaEl = textPanel.querySelector<HTMLElement>('.split-text-panel__footer');

      if (titleEl && descEl && ctaEl) {
        const titleShift = this.isMobile ? (diff * 25) : (-diff * 35);
        const descShift = this.isMobile ? (diff * 18) : (-diff * 22);

        titleEl.style.transform = `translate3d(0, ${titleShift.toFixed(1)}px, 0)`;
        descEl.style.transform = `translate3d(0, ${descShift.toFixed(1)}px, 0)`;
      }

      // Active state class
      if (Math.abs(diff) < 0.35) {
        textPanel.classList.add('is-active-editorial');
        visualPanel.classList.add('is-active-editorial');
      } else {
        textPanel.classList.remove('is-active-editorial');
        visualPanel.classList.remove('is-active-editorial');
      }
    }
  }

  private renderHUD(): void {
    const activeIdx = Math.max(0, Math.min(this.products.length - 1, Math.round(this.currentPos)));

    // Counter
    if (this.counterCurrent) {
      this.counterCurrent.textContent = String(activeIdx + 1).padStart(2, '0');
    }

    // Scrub Bar Progress
    if (this.scrubProgress) {
      const progress = this.currentPos / (this.products.length - 1);
      const pct = Math.max(0, Math.min(100, progress * 100));
      this.scrubProgress.style.height = `${pct.toFixed(1)}%`;
    }

    // Prev / Next button state
    if (this.prevBtn) {
      this.prevBtn.style.opacity = activeIdx === 0 ? '0.35' : '1';
      this.prevBtn.style.pointerEvents = activeIdx === 0 ? 'none' : 'auto';
    }
    if (this.nextBtn) {
      this.nextBtn.style.opacity = activeIdx === this.products.length - 1 ? '0.35' : '1';
      this.nextBtn.style.pointerEvents = activeIdx === this.products.length - 1 ? 'none' : 'auto';
    }
  }

  public destroy(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    window.clearTimeout(this.snapTimeoutId);

    // Unbind all events cleanly
    this.boundEvents.forEach(({ target, type, handler, options }) => {
      target.removeEventListener(type, handler, options);
    });
    this.boundEvents = [];

    // Remove DOM
    if (this.wrapper && this.wrapper.parentElement) {
      this.wrapper.parentElement.removeChild(this.wrapper);
    }

    this.textPanels = [];
    this.visualPanels = [];
  }
}

