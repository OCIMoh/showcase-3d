/**
 * A24CinemaCarousel — 35mm Anamorphic Film Strip & Cinematic Dolly Showcase
 * Inspired by A24 (a24films.com)
 * 
 * Features:
 * 1. Anamorphic 35mm Film Strip Timeline: Products presented as cinematic film cells with registration markings
 * 2. Dynamic Camera Dolly Zoom: High-speed scrubbing dollies out (scale 0.93) to reveal adjacent timeline cells;
 *    resting dollies in smoothly to 100% full-screen theatrical presence
 * 3. Film Transport Jitter & Velocity Tilt: Subtle analog mechanical tilt (rotateZ) proportional to scroll velocity
 * 4. Opening Credits Lower-Third Typography: Film credits style metadata (Director, Terroir, Starring, Aspect Ratio)
 * 5. Procedural 24fps Analog Film Grain Canvas: Authentic celluloid grain and warm Sicilian halation
 * 6. Magnetic Chapter Snapping: Smooth virtual-scroll momentum with automatic locking onto film frames
 * 7. 100% CORS-immune, 60fps hardware accelerated, zero external runtime dependencies
 */

import { Product } from '../data/products';

export interface A24CarouselOptions {
  container: HTMLElement;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export class A24CinemaCarousel {
  private container: HTMLElement;
  private products: Product[];
  private onSelectProduct?: (product: Product) => void;

  private wrapper!: HTMLElement;
  private grainCanvas!: HTMLCanvasElement;
  private grainCtx: CanvasRenderingContext2D | null = null;
  private filmStrip!: HTMLElement;
  private filmFrames: HTMLElement[] = [];

  // Credits & HUD Elements
  private tcDisplay!: HTMLElement;
  private reelDisplay!: HTMLElement;
  private creditsContainer!: HTMLElement;
  private progressBar!: HTMLElement;
  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;

  // Kinematics & Dolly State
  public currentPos = 0;          // Continuous float [0, N-1]
  public targetPos = 0;           // Target position float
  private velocity = 0;
  private lastPos = 0;
  private lerpFactor = 0.078;     // Weighty cinematic momentum
  private dollyScale = 1.0;
  private snapTimeoutId = 0;

  // Drag tracking
  private isDragging = false;
  private hasDragged = false;
  private startClientX = 0;
  private startClientY = 0;
  private startTargetPos = 0;
  private lastClientX = 0;
  private lastDragTime = 0;
  private dragVelocity = 0;

  // Grain timing (Throttled to 24fps for authentic cinema feel)
  private lastGrainTime = 0;
  private grainInterval = 1000 / 24; // 24fps

  // Animation & Loop
  private isRunning = true;
  private animationFrameId = 0;
  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }[] = [];

  constructor(options: A24CarouselOptions) {
    this.container = options.container;
    this.products = options.products;
    this.onSelectProduct = options.onSelectProduct;

    this.buildDOM();
    this.initGrainCanvas();
    this.bindEvents();

    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'a24-showcase';
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'A24 35mm Cinema Film Strip Showcase');

    const totalReels = String(this.products.length).padStart(2, '0');

    this.wrapper.innerHTML = `
      <!-- Procedural 24fps Celluloid Film Grain Canvas -->
      <canvas class="a24-grain-canvas" id="a24Grain" aria-hidden="true"></canvas>

      <!-- Anamorphic Letterbox Bars (Top & Bottom Cinema Mattes) -->
      <div class="a24-letterbox a24-letterbox--top" aria-hidden="true"></div>
      <div class="a24-letterbox a24-letterbox--bottom" aria-hidden="true"></div>

      <!-- Top Cinematic Camera Header & Timecode Readout -->
      <header class="a24-hud-top" aria-hidden="true">
        <div class="a24-hud-cell">
          <span class="a24-rec-dot"></span>
          <span class="a24-hud-label">EXP // 06</span>
          <span class="a24-hud-val">A24 CINEMA 35MM</span>
        </div>
        <div class="a24-hud-cell a24-hud-cell--cam">
          <span class="a24-hud-label">CAM</span>
          <span class="a24-hud-val">ARRI ALEXA LF • ANAMORPHIC 2.39:1 • 24.00 FPS</span>
        </div>
        <div class="a24-hud-cell a24-hud-cell--tc">
          <span class="a24-hud-label">TC</span>
          <span class="a24-hud-val" id="a24Timecode">00:01:24:18</span>
        </div>
        <div class="a24-hud-cell">
          <span class="a24-hud-label">REEL</span>
          <span class="a24-hud-val" id="a24ReelCount">01 / ${totalReels}</span>
        </div>
      </header>

      <!-- Center Film Strip Viewport -->
      <div class="a24-viewport" id="a24Viewport">
        <div class="a24-film-track" id="a24Track">
          <!-- Film frames injected dynamically -->
        </div>
      </div>

      <!-- Cinematic Lower-Thirds Opening Credits Block -->
      <div class="a24-credits" id="a24Credits">
        <div class="a24-credits__inner">
          <div class="a24-credits__row">
            <span class="a24-credits__key">PRODUCTION</span>
            <span class="a24-credits__val" id="a24CreditCategory">CONFETTURA EXTRA BIOLOGICA</span>
          </div>
          <div class="a24-credits__title-row">
            <h2 class="a24-credits__title" id="a24CreditTitle">Sicilian Pistachio Pesto</h2>
            <span class="a24-credits__latin" id="a24CreditLatin">Pistacia Vera Siculus</span>
          </div>
          <div class="a24-credits__row">
            <span class="a24-credits__key">TERROIR</span>
            <span class="a24-credits__val" id="a24CreditOrigin">MOUNT ETNA VALLEY, SICILY</span>
          </div>
          <div class="a24-credits__row">
            <span class="a24-credits__key">STARRING</span>
            <span class="a24-credits__val" id="a24CreditIngredients">SICILIAN PISTACHIO (65%), EXTRA VIRGIN OLIVE OIL</span>
          </div>
          <div class="a24-credits__action-row">
            <span class="a24-credits__price" id="a24CreditPrice">€8.50</span>
            <span class="a24-credits__weight" id="a24CreditWeight">210G ℮</span>
            <button class="a24-credits__btn" id="a24ScreenBtn" type="button">
              <span>VIEW SCREENING</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom Film Reel Timeline & Scrubber -->
      <footer class="a24-hud-bottom">
        <div class="a24-controls">
          <button class="a24-btn a24-btn--prev" id="a24PrevBtn" aria-label="Previous reel" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 20L9 12l10-8v16zM5 19V5"/></svg>
            <span>PREV REEL</span>
          </button>

          <div class="a24-scrub-rail" id="a24ScrubRail" role="slider" aria-label="35mm Film Timeline" aria-valuemin="1" aria-valuemax="${this.products.length}" aria-valuenow="1" tabindex="0">
            <div class="a24-scrub-sprockets" aria-hidden="true"></div>
            <div class="a24-scrub-bar" id="a24ProgressBar"></div>
          </div>

          <button class="a24-btn a24-btn--next" id="a24NextBtn" aria-label="Next reel" type="button">
            <span>NEXT REEL</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 4l10 8-10 8V4zM19 5v14"/></svg>
          </button>
        </div>

        <div class="a24-hud-hint" aria-hidden="true">
          <span>DRAG TIMELINE // SCROLL TO DOLLY REEL</span>
        </div>
      </footer>
    `;

    this.container.appendChild(this.wrapper);

    this.grainCanvas = this.wrapper.querySelector('#a24Grain')!;
    this.filmStrip = this.wrapper.querySelector('#a24Track')!;
    this.tcDisplay = this.wrapper.querySelector('#a24Timecode')!;
    this.reelDisplay = this.wrapper.querySelector('#a24ReelCount')!;
    this.creditsContainer = this.wrapper.querySelector('#a24Credits')!;
    this.progressBar = this.wrapper.querySelector('#a24ProgressBar')!;
    this.prevBtn = this.wrapper.querySelector('#a24PrevBtn')!;
    this.nextBtn = this.wrapper.querySelector('#a24NextBtn')!;

    // Build the 35mm film cell cards
    this.products.forEach((prod, idx) => {
      const frame = document.createElement('article');
      frame.className = 'a24-frame';
      frame.dataset.index = String(idx);
      frame.dataset.slug = prod.slug;

      const formattedNum = String(idx + 1).padStart(2, '0');

      frame.innerHTML = `
        <div class="a24-frame__cell">
          <!-- 35mm Sprocket Holes Header -->
          <div class="a24-frame__sprocket-strip a24-frame__sprocket-strip--top" aria-hidden="true">
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
          </div>

          <!-- Cinema Frame Film Edge Marks -->
          <div class="a24-frame__edge-marks" aria-hidden="true">
            <span class="a24-edge-kodak">▲ KODAK 5219</span>
            <span class="a24-edge-frame">FRAME ${formattedNum}</span>
            <span class="a24-edge-safety">SAFETY FILM</span>
          </div>

          <!-- Anamorphic Jar Stage with Atmospheric Light -->
          <div class="a24-frame__stage">
            <div class="a24-frame__projector-beam" aria-hidden="true"></div>
            <img 
              class="a24-frame__jar-img" 
              src="${prod.jarUrl}" 
              alt="${prod.title}" 
              loading="${idx < 3 ? 'eager' : 'lazy'}" 
              decoding="async" 
              draggable="false"
            />
          </div>

          <!-- 35mm Sprocket Holes Footer -->
          <div class="a24-frame__sprocket-strip a24-frame__sprocket-strip--bottom" aria-hidden="true">
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
            <span class="a24-sprocket"></span>
          </div>
        </div>
      `;

      // Smart click: if active center, navigate; if adjacent, dolly to it
      frame.addEventListener('click', (e) => {
        if (this.hasDragged) {
          e.preventDefault();
          return;
        }
        const activeIdx = Math.round(this.currentPos);
        if (idx === activeIdx) {
          if (this.onSelectProduct) {
            this.onSelectProduct(prod);
          }
        } else {
          this.snapToIndex(idx);
        }
      });

      this.filmStrip.appendChild(frame);
      this.filmFrames.push(frame);
    });

    // Wire Screen / View Harvest button
    const screenBtn = this.wrapper.querySelector('#a24ScreenBtn');
    if (screenBtn) {
      screenBtn.addEventListener('click', () => {
        const activeIdx = Math.max(0, Math.min(this.products.length - 1, Math.round(this.currentPos)));
        const activeProd = this.products[activeIdx];
        if (activeProd && this.onSelectProduct) {
          this.onSelectProduct(activeProd);
        }
      });
    }
  }

  private initGrainCanvas(): void {
    this.grainCtx = this.grainCanvas.getContext('2d', { alpha: true });
    this.resizeGrain();
  }

  private resizeGrain(): void {
    if (!this.grainCanvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Lower resolution grain canvas scaled with CSS for maximum performance
    this.grainCanvas.width = Math.min(w, 512);
    this.grainCanvas.height = Math.min(h, 512);
  }

  private renderGrain(): void {
    if (!this.grainCtx || !this.grainCanvas) return;
    const ctx = this.grainCtx;
    const w = this.grainCanvas.width;
    const h = this.grainCanvas.height;

    const imgData = ctx.createImageData(w, h);
    const buffer32 = new Uint32Array(imgData.data.buffer);
    const len = buffer32.length;

    // Authentic analog 35mm grain noise
    for (let i = 0; i < len; i++) {
      if (Math.random() < 0.08) {
        // Subtle warm amber / wine grain specks
        const alpha = Math.floor(Math.random() * 22 + 8);
        buffer32[i] = (alpha << 24) | (35 << 16) | (45 << 8) | 70;
      }
    }
    ctx.putImageData(imgData, 0, 0);
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

    // Pointer Drag on Timeline
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, .a24-scrub-rail, .a24-credits')) return;

      this.isDragging = true;
      this.hasDragged = false;
      this.startClientX = e.clientX;
      this.startClientY = e.clientY;
      this.lastClientX = e.clientX;
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

      const deltaX = e.clientX - this.startClientX;
      const deltaY = e.clientY - this.startClientY;

      if (!this.hasDragged && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
        this.hasDragged = true;
      }

      // 1 screen width swipe ≈ 1.8 frames
      const screenW = window.innerWidth || 1200;
      const posDelta = -(deltaX / (screenW * 0.55));
      this.targetPos = Math.max(-0.2, Math.min(this.products.length - 0.8, this.startTargetPos + posDelta));

      // Calculate instantaneous drag velocity
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

      // Apply cinematic flick momentum
      if (Math.abs(this.dragVelocity) > 3) {
        const momentumSlides = -(this.dragVelocity / 50);
        this.targetPos += momentumSlides;
      }

      this.snapToNearest();
    };

    add(this.wrapper, 'pointerdown', onPointerDown as EventListener);
    add(window, 'pointermove', onPointerMove as EventListener);
    add(window, 'pointerup', onPointerUp as EventListener);
    add(window, 'pointercancel', onPointerUp as EventListener);

    // Mouse Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const sensitivity = 0.0016;

      this.targetPos = Math.max(0, Math.min(this.products.length - 1, this.targetPos + delta * sensitivity));

      window.clearTimeout(this.snapTimeoutId);
      this.snapTimeoutId = window.setTimeout(() => {
        this.snapToNearest();
      }, 130);
    };
    add(this.wrapper, 'wheel', onWheel as EventListener, { passive: false });

    // Keyboard Arrow Navigation
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.stepBy(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.stepBy(-1);
      }
    };
    add(window, 'keydown', onKeyDown as EventListener);

    // Prev / Next Navigation
    if (this.prevBtn) {
      add(this.prevBtn, 'click', () => this.stepBy(-1));
    }
    if (this.nextBtn) {
      add(this.nextBtn, 'click', () => this.stepBy(1));
    }

    // Timeline Scrub Rail
    const scrubRail = this.wrapper.querySelector('#a24ScrubRail');
    if (scrubRail) {
      add(scrubRail, 'pointerdown', (e: Event) => {
        const pe = e as PointerEvent;
        const rect = (scrubRail as HTMLElement).getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (pe.clientX - rect.left) / rect.width));
        const targetIdx = Math.round(progress * (this.products.length - 1));
        this.snapToIndex(targetIdx);
      });
    }

    // Window Resize
    const onResize = () => {
      this.resizeGrain();
    };
    add(window, 'resize', onResize);
  }

  public stepBy(direction: number): void {
    const activeIdx = Math.round(this.currentPos);
    const nextIdx = Math.max(0, Math.min(this.products.length - 1, activeIdx + direction));
    this.snapToIndex(nextIdx);
  }

  public snapToIndex(index: number): void {
    this.targetPos = Math.max(0, Math.min(this.products.length - 1, index));
  }

  private snapToNearest(): void {
    const nearest = Math.round(this.targetPos);
    this.targetPos = Math.max(0, Math.min(this.products.length - 1, nearest));
  }

  private loop(now: number): void {
    if (!this.isRunning) return;

    // Smooth LERP momentum
    this.currentPos += (this.targetPos - this.currentPos) * this.lerpFactor;

    // Velocity tracking
    this.velocity = (this.currentPos - this.lastPos) * 60;
    this.lastPos = this.currentPos;

    // Dynamic Camera Dolly Zoom Calculation:
    // Fast scrubbing dollies out to ~0.93; settling dollies back to 1.0 full presence
    const targetDolly = 1.0 - Math.min(0.08, Math.abs(this.velocity) * 0.024);
    this.dollyScale += (targetDolly - this.dollyScale) * 0.12;

    // Render 24fps Celluloid Grain
    if (now - this.lastGrainTime > this.grainInterval) {
      this.renderGrain();
      this.lastGrainTime = now;
    }

    // Render 35mm Film Strip & Dolly
    this.renderFilmStrip();

    // Render Credits & Timecode HUD
    this.renderHUD(now);

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private renderFilmStrip(): void {
    const num = this.products.length;
    const stageWidth = window.innerWidth;
    const frameSpacing = Math.min(540, stageWidth * 0.58);

    // Velocity mechanical tilt (Z-axis film jitter)
    const velocityTilt = Math.max(-3.5, Math.min(3.5, -this.velocity * 1.8));

    for (let i = 0; i < num; i++) {
      const frame = this.filmFrames[i];
      if (!frame) continue;

      // Distance from current position
      const diff = i - this.currentPos;
      const x = diff * frameSpacing;

      // Cell scale & opacity
      const cellScale = Math.max(0.72, 1.0 - Math.abs(diff) * 0.22) * this.dollyScale;
      const opacity = Math.max(0.12, Math.min(1.0, 1.0 - Math.abs(diff) * 0.65));
      const zIndex = Math.round(1000 - Math.abs(diff) * 500);

      // Apply 3D transform with dynamic dolly zoom & film tilt
      frame.style.transform = `
        translate3d(calc(-50% + ${x.toFixed(1)}px), -50%, 0)
        rotateZ(${velocityTilt.toFixed(2)}deg)
        scale(${cellScale.toFixed(3)})
      `;
      frame.style.opacity = opacity.toFixed(3);
      frame.style.zIndex = String(zIndex);
      frame.style.pointerEvents = Math.abs(diff) < 0.45 ? 'auto' : 'none';

      // Parallax float on the jar inside
      const jarImg = frame.querySelector<HTMLElement>('.a24-frame__jar-img');
      if (jarImg) {
        const jarParallaxX = -diff * 35;
        jarImg.style.transform = `translate3d(${jarParallaxX.toFixed(1)}px, 0, 0)`;
      }

      // Active state border
      if (Math.abs(diff) < 0.35) {
        frame.classList.add('is-active-reel');
      } else {
        frame.classList.remove('is-active-reel');
      }
    }
  }

  private renderHUD(now: number): void {
    const activeIdx = Math.max(0, Math.min(this.products.length - 1, Math.round(this.currentPos)));
    const activeProd = this.products[activeIdx];

    // Reel Counter
    if (this.reelDisplay) {
      this.reelDisplay.textContent = `${String(activeIdx + 1).padStart(2, '0')} / ${String(this.products.length).padStart(2, '0')}`;
    }

    // Timecode simulation (HH:MM:SS:FF)
    if (this.tcDisplay) {
      const totalSeconds = Math.floor(now / 1000);
      const frames = Math.floor((now % 1000) / (1000 / 24));
      const ss = String(totalSeconds % 60).padStart(2, '0');
      const mm = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
      const ff = String(frames).padStart(2, '0');
      this.tcDisplay.textContent = `00:${mm}:${ss}:${ff}`;
    }

    // Progress Bar
    if (this.progressBar) {
      const progress = this.currentPos / (this.products.length - 1);
      const pct = Math.max(0, Math.min(100, progress * 100));
      this.progressBar.style.left = `${pct.toFixed(1)}%`;
    }

    // Update Opening Credits Lower-Third
    if (activeProd && this.creditsContainer) {
      const catEl = this.creditsContainer.querySelector('#a24CreditCategory');
      const titleEl = this.creditsContainer.querySelector('#a24CreditTitle');
      const latinEl = this.creditsContainer.querySelector('#a24CreditLatin');
      const originEl = this.creditsContainer.querySelector('#a24CreditOrigin');
      const ingEl = this.creditsContainer.querySelector('#a24CreditIngredients');
      const priceEl = this.creditsContainer.querySelector('#a24CreditPrice');
      const weightEl = this.creditsContainer.querySelector('#a24CreditWeight');

      if (catEl && catEl.textContent !== activeProd.category.toUpperCase()) {
        catEl.textContent = `${activeProd.category.toUpperCase()} • 35MM SELECTION`;
      }
      if (titleEl && titleEl.textContent !== activeProd.title) {
        titleEl.textContent = activeProd.title;
      }
      if (latinEl && latinEl.textContent !== activeProd.latinSubtitle) {
        latinEl.textContent = activeProd.latinSubtitle;
      }
      if (originEl && originEl.textContent !== activeProd.origin.toUpperCase()) {
        originEl.textContent = activeProd.origin.toUpperCase();
      }
      if (ingEl) {
        const ingredientsStr = activeProd.ingredients.slice(0, 3).join(', ').toUpperCase();
        if (ingEl.textContent !== ingredientsStr) {
          ingEl.textContent = ingredientsStr;
        }
      }
      if (priceEl && priceEl.textContent !== activeProd.price) {
        priceEl.textContent = activeProd.price;
      }
      if (weightEl && weightEl.textContent !== activeProd.weight) {
        weightEl.textContent = activeProd.weight;
      }
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

    this.filmFrames = [];
  }
}
