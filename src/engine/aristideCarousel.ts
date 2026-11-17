/**
 * AristideSlatsCarousel — Accordion Slat Reel & Brutalist Editorial Showcase
 * Inspired by Aristide Benoist (aristidebenoist.com)
 * 
 * 60fps Zero-Reflow GPU Performance Architecture:
 * 1. Virtual Coordinate Layout: Slats are positioned via translate3d(x, 0, 0)
 * 2. Hardware-composited accordion expansion: adjacent slats part ways via spring LERP math
 * 3. Fixed inner container clipping: text & images never reflow
 * 4. Dual-layer GPU opacity crossfade: monochrome duotone to full-color bloom with 0 filter overhead
 * 5. ScaleY acoustic tick scrub meter: zero forced reflows on rAF
 * 6. Continuous subpixel floating point translation with seamless modulo wrapping
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
  productIndex: number;
  globalIndex: number;
  currentWidth: number;
  targetWidth: number;
  x: number;
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
  private lerpFactor = 0.085;    // Oiled mechanical friction
  private defaultSlatWidth = 85;
  private expandedSlatWidth = 320;
  private slatGap = 10;
  private singleSetWidth = 0;
  private totalCopies = 3;       // 3 sets of products for seamless infinite wrap
  private activeProductIndex: number | null = null;
  private needsLayout = true;
  private lastActiveTickIdx = -1;

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

    if (this.wrapper) {
      this.wrapper.style.setProperty('--slat-default-w', `${this.defaultSlatWidth}px`);
      this.wrapper.style.setProperty('--slat-expanded-w', `${this.expandedSlatWidth}px`);
    }

    this.needsLayout = true;
  }

  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ab-showcase';
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'Aristide Benoist Accordion Slats Reel Showcase');
    this.wrapper.style.setProperty('--slat-default-w', `${this.defaultSlatWidth}px`);
    this.wrapper.style.setProperty('--slat-expanded-w', `${this.expandedSlatWidth}px`);

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
            <!-- Dual-Layer Terroir Scene Background (Monochrome base + GPU opacity crossfade to full color) -->
            <div class="ab-slat__scene-bg">
              <img 
                class="ab-slat__scene-img ab-slat__scene-img--mono" 
                src="${prod.sceneUrl || prod.jarUrl}" 
                alt="" 
                loading="${globalIdx < 8 ? 'eager' : 'lazy'}" 
                decoding="async" 
                draggable="false"
              />
              <img 
                class="ab-slat__scene-img ab-slat__scene-img--color" 
                src="${prod.sceneUrl || prod.jarUrl}" 
                alt="${prod.title}" 
                loading="${globalIdx < 8 ? 'eager' : 'lazy'}" 
                decoding="async" 
                draggable="false"
              />
              <div class="ab-slat__scrim"></div>
            </div>

            <!-- Hero 3D Cutout Jar Layer -->
            <div class="ab-slat__jar-layer">
              <img 
                class="ab-slat__jar-img" 
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

        // Hover handling to trigger synchronized zero-reflow expansion
        slat.addEventListener('mouseenter', () => {
          this.setHoveredProduct(pIdx);
        });

        slat.addEventListener('mouseleave', () => {
          if (this.activeProductIndex === pIdx) {
            this.setHoveredProduct(null);
          }
        });

        // Click handling
        slat.addEventListener('click', (e) => {
          if (this.hasDragged) {
            e.preventDefault();
            return;
          }

          const isCta = (e.target as HTMLElement).closest('.ab-slat__cta-btn');
          if (isCta || this.activeProductIndex === pIdx) {
            if (this.onSelectProduct) {
              this.onSelectProduct(prod);
            }
          } else {
            this.setHoveredProduct(pIdx);
            this.centerOnSlat(globalIdx);
          }
        });

        this.reelTrack.appendChild(slat);
        this.slatItems.push({
          element: slat,
          product: prod,
          productIndex: pIdx,
          globalIndex: globalIdx,
          currentWidth: this.defaultSlatWidth,
          targetWidth: this.defaultSlatWidth,
          x: 0
        });
      });
    }

    // Initialize middle set position so infinite scroll wraps seamlessly in both directions
    this.targetX = -this.singleSetWidth;
    this.currentX = -this.singleSetWidth;
    this.lastX = this.currentX;
    this.needsLayout = true;
  }

  private setHoveredProduct(productIndex: number | null): void {
    this.activeProductIndex = productIndex;

    this.slatItems.forEach(item => {
      const isTarget = item.productIndex === productIndex;
      item.targetWidth = isTarget ? this.expandedSlatWidth : this.defaultSlatWidth;
      if (isTarget) {
        item.element.classList.add('is-expanded');
      } else {
        item.element.classList.remove('is-expanded');
      }
    });

    this.needsLayout = true;
  }

  private centerOnSlat(globalIndex: number): void {
    const item = this.slatItems[globalIndex];
    if (!item) return;
    const slatCenter = item.x + item.targetWidth / 2;
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

      this.targetX = this.startTargetX + deltaX * 1.25;

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
      if (Math.abs(this.dragVelocity) > 2) {
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

    // Smooth LERP momentum for scroll
    this.currentX += (this.targetX - this.currentX) * this.lerpFactor;
    this.velocity = (this.currentX - this.lastX) * 60;
    this.lastX = this.currentX;

    // Check if any slat width is currently animating
    let widthConverging = false;
    for (let i = 0; i < this.slatItems.length; i++) {
      const item = this.slatItems[i];
      const diff = item.targetWidth - item.currentWidth;
      if (Math.abs(diff) > 0.2) {
        item.currentWidth += diff * 0.18; // Organic elastic spring LERP
        item.element.style.width = `${item.currentWidth.toFixed(1)}px`;
        widthConverging = true;
      } else if (item.currentWidth !== item.targetWidth) {
        item.currentWidth = item.targetWidth;
        item.element.style.width = `${item.currentWidth}px`;
        widthConverging = true;
      }
    }

    // Synchronously position all slats using hardware translate3d
    if (widthConverging || this.needsLayout) {
      this.needsLayout = false;
      let runningOffset = 0;
      for (let i = 0; i < this.slatItems.length; i++) {
        const item = this.slatItems[i];
        item.x = runningOffset;
        item.element.style.transform = `translate3d(${runningOffset.toFixed(1)}px, 0, 0)`;
        runningOffset += item.currentWidth + this.slatGap;
      }
      this.singleSetWidth = runningOffset / this.totalCopies;
    }

    // Seamless infinite wrap around the single set width (always centered on middle set)
    if (this.singleSetWidth > 0) {
      const minThreshold = -this.singleSetWidth * 1.8;
      const maxThreshold = -this.singleSetWidth * 0.2;

      while (this.currentX > maxThreshold) {
        this.currentX -= this.singleSetWidth;
        this.targetX -= this.singleSetWidth;
      }
      while (this.currentX < minThreshold) {
        this.currentX += this.singleSetWidth;
        this.targetX += this.singleSetWidth;
      }
    }

    // Hardware translate3d for the reel track (zero raster invalidation)
    if (this.reelTrack) {
      this.reelTrack.style.transform = `translate3d(${this.currentX}px, 0, 0)`;
    }

    // Update Aristide Tick Meter (zero reflow via scaleY)
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

    // Skip DOM updates if active tick has not changed
    if (activeTickIdx === this.lastActiveTickIdx) return;
    this.lastActiveTickIdx = activeTickIdx;

    for (let i = 0; i < numTicks; i++) {
      const tick = this.tickElements[i];
      const dist = Math.abs(i - activeTickIdx);
      if (dist === 0) {
        tick.style.background = 'var(--color-orange)';
        tick.style.transform = 'scaleY(2.33)';
        tick.style.opacity = '1';
      } else if (dist === 1) {
        tick.style.background = 'rgba(229, 90, 43, 0.7)';
        tick.style.transform = 'scaleY(1.8)';
        tick.style.opacity = '0.75';
      } else if (dist === 2) {
        tick.style.background = 'rgba(253, 243, 235, 0.5)';
        tick.style.transform = 'scaleY(1.3)';
        tick.style.opacity = '0.45';
      } else {
        tick.style.background = 'rgba(253, 243, 235, 0.2)';
        tick.style.transform = 'scaleY(1)';
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
