/**
 * AristideSlatsCarousel — Accordion Slat Reel & Brutalist Editorial Showcase
 * Inspired by Aristide Benoist (aristidebenoist.com)
 * 
 * Features:
 * 1. Horizontal Reel of Slender Vertical Slats (Architectural Book-Spines / Film-Ribbons)
 * 2. Monochromatic Duotone Idle State: Slats display cropped, high-contrast monochrome jar imagery
 * 3. Dynamic Accordion Expansion: Hovering/focusing expands slat from 80px to 320px in width,
 *    blooming into vibrant full-color with warm ambient halo and rich typography
 * 4. Aristide Top Bar & Acoustic Tick Meter: 48 vertical ticks tracking scroll progress in real time
 * 5. Weighty Virtual Scroll Momentum: Continuous infinite double-modulo wrapping with buttery LERP
 * 6. Brutalist Editorial Framing: Ultra-condensed brand title, coordinates, and minimalist footer
 * 7. 100% CORS-immune, 60fps hardware accelerated, complete lifecycle teardown
 */

import { Product } from '../data/products';

export interface AristideCarouselOptions {
  container: HTMLElement;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

interface SlatItem {
  element: HTMLElement;
  product: Product;
  index: number;
  baseWidth: number;
  expandedWidth: number;
}

export class AristideSlatsCarousel {
  private container: HTMLElement;
  private products: Product[];
  private onSelectProduct?: (product: Product) => void;

  private wrapper!: HTMLElement;
  private reelTrack!: HTMLElement;
  private tickElements: HTMLElement[] = [];
  private slatItems: SlatItem[] = [];

  // Kinematics & Infinite Reel
  public currentX = 0;           // Current smoothed scroll position (px)
  public targetX = 0;            // Target scroll position (px)
  private velocity = 0;
  private lastX = 0;
  private lerpFactor = 0.075;    // Oiled mechanical friction
  private defaultSlatWidth = 85;
  private expandedSlatWidth = 320;
  private slatGap = 10;
  private singleSetWidth = 0;
  private totalCopies = 3;       // 3 sets of products for seamless infinite wrap
  private activeHoveredIndex: number | null = null;

  // Drag tracking
  private isDragging = false;
  private hasDragged = false;
  private startClientX = 0;
  private startClientY = 0;
  private startTargetX = 0;
  private lastClientX = 0;
  private lastDragTime = 0;
  private dragVelocity = 0;

  // Animation & Loop
  private isRunning = true;
  private animationFrameId = 0;
  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }[] = [];

  constructor(options: AristideCarouselOptions) {
    this.container = options.container;
    this.products = options.products;
    this.onSelectProduct = options.onSelectProduct;

    this.calculateDimensions();
    this.buildDOM();
    this.bindEvents();

    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private calculateDimensions(): void {
    const w = window.innerWidth;
    if (w < 600) {
      this.defaultSlatWidth = 58;
      this.expandedSlatWidth = 240;
      this.slatGap = 6;
    } else if (w < 1024) {
      this.defaultSlatWidth = 72;
      this.expandedSlatWidth = 280;
      this.slatGap = 8;
    } else {
      this.defaultSlatWidth = 85;
      this.expandedSlatWidth = 320;
      this.slatGap = 10;
    }

    this.singleSetWidth = this.products.length * (this.defaultSlatWidth + this.slatGap);
  }

  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ab-showcase';
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'Aristide Benoist Accordion Slats Reel Showcase');

    const numTicks = 42;
    const ticksHtml = Array.from({ length: numTicks })
      .map((_, i) => `<span class="ab-tick" data-tick="${i}"></span>`)
      .join('');

    this.wrapper.innerHTML = `
      <!-- Top Brutalist Header Bar (Aristide Benchmark) -->
      <header class="ab-header" aria-hidden="true">
        <div class="ab-header__brand">AGRUMÊA</div>
        
        <!-- Aristide Signature Central Acoustic/Scrub Tick Meter -->
        <div class="ab-header__meter" id="abTickMeter">
          ${ticksHtml}
        </div>

        <div class="ab-header__meta">DISPENSA // 1894</div>
      </header>

      <!-- Center Infinite Slat Reel Viewport -->
      <div class="ab-viewport" id="abViewport">
        <div class="ab-track" id="abTrack">
          <!-- Slats injected dynamically in 3 sets for infinite wrap -->
        </div>
      </div>

      <!-- Bottom Minimalist Footer (Aristide Benchmark) -->
      <footer class="ab-footer" aria-hidden="true">
        <div class="ab-footer__col">
          <span>ARTISANAL SICILIAN HARVEST</span>
          <span class="ab-footer__sub">AVAILABLE DISPENSA 2026</span>
        </div>

        <div class="ab-footer__hint">
          <span>DRAG // SCROLL // HOVER SLAT TO EXPAND</span>
        </div>

        <div class="ab-footer__col ab-footer__col--right">
          <span>MOUNT ETNA TERROIR</span>
          <span class="ab-footer__sub">100% ORGANIC BOTANICALS</span>
        </div>
      </footer>
    `;

    this.container.appendChild(this.wrapper);

    this.reelTrack = this.wrapper.querySelector('#abTrack')!;
    this.tickElements = Array.from(this.wrapper.querySelectorAll<HTMLElement>('.ab-tick'));

    // Create 3 cloned sets of products to ensure seamless infinite horizontal wrapping
    for (let c = 0; c < this.totalCopies; c++) {
      this.products.forEach((prod, pIdx) => {
        const globalIdx = c * this.products.length + pIdx;
        const formattedNum = String(pIdx + 1).padStart(2, '0');

        const slat = document.createElement('article');
        slat.className = 'ab-slat';
        slat.dataset.globalIndex = String(globalIdx);
        slat.dataset.productIndex = String(pIdx);
        slat.dataset.slug = prod.slug;

        slat.innerHTML = `
          <div class="ab-slat__inner">
            <!-- Background Image Crop (Monochrome duotone in idle, color in hover) -->
            <div class="ab-slat__bg">
              <img 
                class="ab-slat__img" 
                src="${prod.jarUrl}" 
                alt="${prod.title}" 
                loading="${globalIdx < 8 ? 'eager' : 'lazy'}" 
                decoding="async" 
                draggable="false"
              />
            </div>

            <!-- Idle Slat Spine Label (Vertical Numeral & Category) -->
            <div class="ab-slat__spine">
              <span class="ab-slat__num">${formattedNum}</span>
              <span class="ab-slat__cat-vert">${prod.category.toUpperCase()}</span>
            </div>

            <!-- Expanded State Monograph Overlay -->
            <div class="ab-slat__expanded-content">
              <div class="ab-slat__halo"></div>
              <div class="ab-slat__meta-top">
                <span class="ab-slat__sec-id">SEC // ${formattedNum}</span>
                <span class="ab-slat__weight">${prod.weight}</span>
              </div>

              <div class="ab-slat__title-block">
                <h2 class="ab-slat__title">${prod.title}</h2>
                <p class="ab-slat__latin">${prod.latinSubtitle}</p>
              </div>

              <div class="ab-slat__footer-row">
                <span class="ab-slat__price">${prod.price}</span>
                <button class="ab-slat__cta-btn" type="button" data-slug="${prod.slug}">
                  <span>EXPLORE</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;

        // Hover handling to trigger accordion expansion
        slat.addEventListener('mouseenter', () => {
          this.setHoveredSlat(globalIdx);
        });

        slat.addEventListener('mouseleave', () => {
          if (this.activeHoveredIndex === globalIdx) {
            this.setHoveredSlat(null);
          }
        });

        // Click handling
        slat.addEventListener('click', (e) => {
          if (this.hasDragged) {
            e.preventDefault();
            return;
          }

          // If clicking CTA or already expanded
          const isCta = (e.target as HTMLElement).closest('.ab-slat__cta-btn');
          if (isCta || this.activeHoveredIndex === globalIdx) {
            if (this.onSelectProduct) {
              this.onSelectProduct(prod);
            }
          } else {
            // Click unexpanded slat -> expand & center it
            this.setHoveredSlat(globalIdx);
            this.centerOnSlat(globalIdx);
          }
        });

        this.reelTrack.appendChild(slat);
        this.slatItems.push({
          element: slat,
          product: prod,
          index: globalIdx,
          baseWidth: this.defaultSlatWidth,
          expandedWidth: this.expandedSlatWidth
        });
      });
    }
  }

  private setHoveredSlat(index: number | null): void {
    this.activeHoveredIndex = index;

    this.slatItems.forEach(item => {
      if (item.index === index) {
        item.element.classList.add('is-expanded');
      } else {
        item.element.classList.remove('is-expanded');
      }
    });
  }

  private centerOnSlat(globalIndex: number): void {
    const itemWidth = this.defaultSlatWidth + this.slatGap;
    const slatCenter = globalIndex * itemWidth + itemWidth / 2;
    const viewCenter = window.innerWidth / 2;
    this.targetX = -(slatCenter - viewCenter);
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
      if ((e.target as HTMLElement).closest('button, .ab-header, .ab-footer')) return;

      this.isDragging = true;
      this.hasDragged = false;
      this.startClientX = e.clientX;
      this.startClientY = e.clientY;
      this.lastClientX = e.clientX;
      this.lastDragTime = performance.now();
      this.startTargetX = this.targetX;
      this.dragVelocity = 0;

      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.startClientX;
      const deltaY = e.clientY - this.startClientY;

      if (!this.hasDragged && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
        this.hasDragged = true;
      }

      this.targetX = this.startTargetX + deltaX * 1.15;

      // Track drag velocity
      const now = performance.now();
      const dt = Math.max(1, now - this.lastDragTime);
      const moveDelta = e.clientX - this.lastClientX;
      this.dragVelocity = (moveDelta / dt) * 16.67;
      this.lastClientX = e.clientX;
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

      // Timepiece momentum flick
      if (Math.abs(this.dragVelocity) > 3) {
        this.targetX += this.dragVelocity * 14;
      }
    };

    add(this.wrapper, 'pointerdown', onPointerDown as EventListener);
    add(window, 'pointermove', onPointerMove as EventListener);
    add(window, 'pointerup', onPointerUp as EventListener);
    add(window, 'pointercancel', onPointerUp as EventListener);

    // Mouse Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const sensitivity = 1.35;
      this.targetX -= delta * sensitivity;
    };
    add(this.wrapper, 'wheel', onWheel as EventListener, { passive: false });

    // Keyboard Arrow Navigation
    const onKeyDown = (e: KeyboardEvent) => {
      const step = this.defaultSlatWidth + this.slatGap;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.targetX -= step * 2;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.targetX += step * 2;
      }
    };
    add(window, 'keydown', onKeyDown as EventListener);

    // Window Resize
    const onResize = () => {
      this.calculateDimensions();
    };
    add(window, 'resize', onResize);
  }

  private loop(): void {
    if (!this.isRunning) return;

    // Smooth LERP momentum
    this.currentX += (this.targetX - this.currentX) * this.lerpFactor;

    // Velocity tracking for micro-shear
    this.velocity = (this.currentX - this.lastX) * 60;
    this.lastX = this.currentX;

    // Seamless infinite wrap around the singleSetWidth
    if (this.singleSetWidth > 0) {
      while (this.currentX > 0) {
        this.currentX -= this.singleSetWidth;
        this.targetX -= this.singleSetWidth;
      }
      while (this.currentX < -this.singleSetWidth) {
        this.currentX += this.singleSetWidth;
        this.targetX += this.singleSetWidth;
      }
    }

    // Apply translation to the reel track
    if (this.reelTrack) {
      // Subtle velocity shear angle
      const shearAngle = Math.max(-2.5, Math.min(2.5, -this.velocity * 0.08));
      this.reelTrack.style.transform = `translate3d(${this.currentX.toFixed(1)}px, 0, 0) skewX(${shearAngle.toFixed(2)}deg)`;
    }

    // Update Aristide Tick Meter
    this.renderTicks();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private renderTicks(): void {
    if (!this.tickElements.length || this.singleSetWidth <= 0) return;

    // Calculate normalized progress [0, 1] through the single set
    const rawProgress = ((-this.currentX % this.singleSetWidth) + this.singleSetWidth) % this.singleSetWidth;
    const progressRatio = rawProgress / this.singleSetWidth;

    const numTicks = this.tickElements.length;
    const activeTickIdx = Math.floor(progressRatio * numTicks);

    for (let i = 0; i < numTicks; i++) {
      const tick = this.tickElements[i];
      const dist = Math.abs(i - activeTickIdx);
      if (dist === 0) {
        tick.style.background = 'var(--color-orange)';
        tick.style.height = '14px';
        tick.style.opacity = '1';
      } else if (dist === 1) {
        tick.style.background = 'rgba(229, 90, 43, 0.7)';
        tick.style.height = '11px';
        tick.style.opacity = '0.75';
      } else if (dist === 2) {
        tick.style.background = 'rgba(253, 243, 235, 0.5)';
        tick.style.height = '8px';
        tick.style.opacity = '0.45';
      } else {
        tick.style.background = 'rgba(253, 243, 235, 0.2)';
        tick.style.height = '6px';
        tick.style.opacity = '0.25';
      }
    }
  }

  public destroy(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);

    // Unbind all events cleanly
    this.boundEvents.forEach(({ target, type, handler, options }) => {
      target.removeEventListener(type, handler, options);
    });
    this.boundEvents = [];

    // Remove DOM
    if (this.wrapper && this.wrapper.parentElement) {
      this.wrapper.parentElement.removeChild(this.wrapper);
    }

    this.slatItems = [];
    this.tickElements = [];
  }
}

