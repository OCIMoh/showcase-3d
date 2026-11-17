/**
 * OrbitalSundialCarousel — Off-Screen Orbital Dial & Celestial Arc Showcase
 * Inspired by Hermès Timepieces, Bang & Olufsen, and Aristide Benoist / Codrops Circular Slider.
 * 
 * Features:
 * 1. Celestial Arc Trajectory: Products travel along a grand elliptical orbit anchored deep off-screen
 * 2. Precision Astrolabe / Sundial Wheel: Background engraved celestial disc with degree ticks, Roman numerals & solstices
 * 3. Golden Zenith Presentation: Center product reaches 100% scale at golden zenith with solar amber bloom
 * 4. Angular Momentum Kinematics: Weighty timepiece bezel inertia with magnetic snap-to-zenith
 * 5. Smart Celestial Interaction: Click any orbiting body to rotate it to zenith; click center to view product
 * 6. Responsive Orbit: Mathematical radius & pivot scaling for desktop, tablet, and mobile portrait viewports
 * 7. 100% CORS-immune, 60fps hardware accelerated, complete lifecycle cleanup
 */

import { Product } from '../data/products';

export interface OrbitalCarouselOptions {
  container: HTMLElement;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export class OrbitalSundialCarousel {
  private container: HTMLElement;
  private products: Product[];
  private onSelectProduct?: (product: Product) => void;

  private wrapper!: HTMLElement;
  private astrolabeSvg!: SVGElement;
  private orbitTrack!: HTMLElement;
  private cardElements: HTMLElement[] = [];
  private zenithInfoBox!: HTMLElement;

  // HUD Elements
  private azimuthText!: HTMLElement;
  private counterText!: HTMLElement;
  private scrubProgress!: HTMLElement;
  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;

  // Kinematics & Arc Geometry
  private angle = 0;              // Current smoothed angle (radians)
  private targetAngle = 0;        // Target angle (radians)
  private velocity = 0;           // Angular velocity
  private lastAngle = 0;
  private numItems: number;
  private angleStep = 0.38;       // ~21.8 degrees between items
  private lerpFactor = 0.075;
  private snapTimeoutId = 0;

  // Geometry dimensions
  private pivotX = 0;
  private pivotY = 0;
  private radiusX = 820;
  private radiusY = 700;

  // Drag tracking
  private isDragging = false;
  private hasDragged = false;
  private startClientX = 0;
  private startClientY = 0;
  private startTargetAngle = 0;
  private lastClientX = 0;
  private lastDragTime = 0;
  private dragVelocity = 0;

  // Animation & Loop
  private isRunning = true;
  private animationFrameId = 0;
  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }[] = [];

  constructor(options: OrbitalCarouselOptions) {
    this.container = options.container;
    this.products = options.products;
    this.onSelectProduct = options.onSelectProduct;
    this.numItems = this.products.length;

    this.buildDOM();
    this.updateDimensions();
    this.bindEvents();

    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'orbital-showcase';
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'Off-Screen Orbital Sundial Arc Showcase');

    const totalCountStr = String(this.numItems).padStart(2, '0');

    this.wrapper.innerHTML = `
      <!-- Ambient Terroir Sky Glow -->
      <div class="orbital-sky-glow" aria-hidden="true"></div>

      <!-- Rotating Astrolabe / Celestial Sundial Wheel (SVG) -->
      <div class="orbital-dial-wrapper" id="orbitalDialWrap" aria-hidden="true">
        <svg class="orbital-astrolabe" id="orbitalAstrolabe" viewBox="-1200 -1200 2400 2400" width="2400" height="2400">
          <defs>
            <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#E94E1B" stop-opacity="0.08"/>
              <stop offset="70%" stop-color="#762530" stop-opacity="0.04"/>
              <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <!-- Dial Plate Background Glow -->
          <circle cx="0" cy="0" r="1150" fill="url(#dialGlow)" />

          <!-- Outer Roman Solstice & Degree Rings -->
          <circle cx="0" cy="0" r="1120" stroke="rgba(118, 37, 48, 0.16)" stroke-width="1.5" fill="none" stroke-dasharray="4 8"/>
          <circle cx="0" cy="0" r="1080" stroke="rgba(229, 90, 43, 0.35)" stroke-width="1.5" fill="none"/>
          <circle cx="0" cy="0" r="1040" stroke="rgba(118, 37, 48, 0.12)" stroke-width="1" fill="none"/>
          <circle cx="0" cy="0" r="920"  stroke="rgba(118, 37, 48, 0.15)" stroke-width="1.5" fill="none"/>
          <circle cx="0" cy="0" r="800"  stroke="rgba(229, 90, 43, 0.25)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
          <circle cx="0" cy="0" r="620"  stroke="rgba(118, 37, 48, 0.12)" stroke-width="1" fill="none"/>

          <!-- 72 Precision Astrolabe Rays -->
          <g class="orbital-astrolabe__rays" opacity="0.4">
            ${Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const isMajor = deg % 30 === 0;
              const r1 = isMajor ? 920 : 1040;
              const r2 = 1080;
              const rad = (deg * Math.PI) / 180;
              const x1 = Math.cos(rad) * r1;
              const y1 = Math.sin(rad) * r1;
              const x2 = Math.cos(rad) * r2;
              const y2 = Math.sin(rad) * r2;
              return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${isMajor ? '#E94E1B' : 'rgba(118, 37, 48, 0.3)'}" stroke-width="${isMajor ? '2' : '1'}"/>`;
            }).join('')}
          </g>

          <!-- Roman Astrolabe Degree Numerals -->
          <g class="orbital-astrolabe__texts" fill="rgba(118, 37, 48, 0.55)" font-family="Cinzel, Georgia, serif" font-size="16" letter-spacing="0.15em">
            ${['0° • ARIES', '30° • ETNA MIDDAY', '60° • SOLLEONE', '90° • EAST HORIZON', '120° • AUTUNNO', '150° • RACCOLTO', '180° • NADIR', '210° • VENDEMMIA', '240° • TRAMONTO', '270° • WEST HORIZON', '300° • EQUINOZIO', '330° • MEDITERRANEO'].map((txt, idx) => {
              const deg = idx * 30 - 90;
              const rad = (deg * Math.PI) / 180;
              const x = Math.cos(rad) * 980;
              const y = Math.sin(rad) * 980;
              return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${deg + 90}, ${x.toFixed(1)}, ${y.toFixed(1)})">${txt}</text>`;
            }).join('')}
          </g>
        </svg>
      </div>

      <!-- Celestial Top Telemetry Header -->
      <header class="orbital-hud-top" aria-hidden="true">
        <div class="orbital-hud-cell">
          <span class="orbital-hud-dot"></span>
          <span class="orbital-hud-label">EXP // 05</span>
          <span class="orbital-hud-val">CELESTIAL SUNDIAL ARC</span>
        </div>
        <div class="orbital-hud-cell orbital-hud-cell--coords">
          <span class="orbital-hud-label">AZIMUTH</span>
          <span class="orbital-hud-val" id="orbitalAzimuthText">180° 00' 00" // ZENITH HARVEST</span>
        </div>
        <div class="orbital-hud-cell">
          <span class="orbital-hud-label">PLANET</span>
          <span class="orbital-hud-val" id="orbitalCounter">01 / ${totalCountStr}</span>
        </div>
      </header>

      <!-- Center Solar Zenith Halo Light -->
      <div class="orbital-zenith-halo" aria-hidden="true"></div>

      <!-- 3D Orbit Stage for Floating Jars -->
      <div class="orbital-stage" id="orbitalStage">
        <div class="orbital-track" id="orbitalTrack">
          <!-- Cards injected dynamically -->
        </div>
      </div>

      <!-- Active Zenith Product Monograph Info Box -->
      <div class="orbital-zenith-info" id="orbitalZenithInfo">
        <div class="orbital-zenith-info__tag" id="orbitalZenithCategory">CONFETTURA EXTRA</div>
        <h2 class="orbital-zenith-info__title" id="orbitalZenithTitle">Sicilian Pistachio Pesto</h2>
        <p class="orbital-zenith-info__sub" id="orbitalZenithSub">Pistacia Vera Siculus</p>
        <div class="orbital-zenith-info__meta">
          <span class="orbital-zenith-info__price" id="orbitalZenithPrice">€8.50</span>
          <span class="orbital-zenith-info__weight" id="orbitalZenithWeight">210g ℮</span>
          <button class="orbital-zenith-info__cta" id="orbitalZenithCta" type="button">
            <span>DISCOVER HARVEST</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </button>
        </div>
      </div>

      <!-- Bottom Celestial Timepiece Controls -->
      <footer class="orbital-hud-bottom">
        <div class="orbital-controls">
          <button class="orbital-btn orbital-btn--prev" id="orbitalPrevBtn" aria-label="Previous celestial product" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>PREV</span>
          </button>

          <div class="orbital-scrub-rail" id="orbitalScrubRail" role="slider" aria-label="Astronomical Orbit Scrubber" aria-valuemin="1" aria-valuemax="${this.numItems}" aria-valuenow="1" tabindex="0">
            <div class="orbital-scrub-track"></div>
            <div class="orbital-scrub-thumb" id="orbitalProgressBar"></div>
          </div>

          <button class="orbital-btn orbital-btn--next" id="orbitalNextBtn" aria-label="Next celestial product" type="button">
            <span>NEXT</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div class="orbital-hint" aria-hidden="true">
          <span>DRAG // WHEEL // ARROWS TO ROTATE SUNDIAL</span>
        </div>
      </footer>
    `;

    this.container.appendChild(this.wrapper);

    this.astrolabeSvg = this.wrapper.querySelector('#orbitalAstrolabe')!;
    this.orbitTrack = this.wrapper.querySelector('#orbitalTrack')!;
    this.zenithInfoBox = this.wrapper.querySelector('#orbitalZenithInfo')!;
    this.azimuthText = this.wrapper.querySelector('#orbitalAzimuthText')!;
    this.counterText = this.wrapper.querySelector('#orbitalCounter')!;
    this.scrubProgress = this.wrapper.querySelector('#orbitalProgressBar')!;
    this.prevBtn = this.wrapper.querySelector('#orbitalPrevBtn')!;
    this.nextBtn = this.wrapper.querySelector('#orbitalNextBtn')!;

    // Build the celestial orbital cards
    this.products.forEach((prod, idx) => {
      const card = document.createElement('div');
      card.className = 'orbital-card';
      card.dataset.index = String(idx);
      card.dataset.slug = prod.slug;

      const formattedNum = String(idx + 1).padStart(2, '0');

      card.innerHTML = `
        <div class="orbital-card__inner">
          <!-- Orbital Celestial Reticle Ring -->
          <div class="orbital-card__orbit-ring" aria-hidden="true"></div>

          <!-- Celestial Node Marker -->
          <div class="orbital-card__node-num">${formattedNum}</div>

          <!-- Glass Jar Cutout -->
          <div class="orbital-card__jar-stage">
            <img 
              class="orbital-card__jar-img" 
              src="${prod.jarUrl}" 
              alt="${prod.title}" 
              loading="${idx < 4 ? 'eager' : 'lazy'}" 
              decoding="async" 
              draggable="false"
            />
          </div>

          <!-- Subtle Hover Title -->
          <div class="orbital-card__name-plate">
            <span>${prod.title}</span>
          </div>
        </div>
      `;

      // Smart click: orbit to zenith if side; navigate if already zenith
      card.addEventListener('click', (e) => {
        if (this.hasDragged) {
          e.preventDefault();
          return;
        }
        const activeIdx = this.getActiveIndex();
        if (idx === activeIdx) {
          if (this.onSelectProduct) {
            this.onSelectProduct(prod);
          }
        } else {
          this.snapToIndex(idx);
        }
      });

      this.orbitTrack.appendChild(card);
      this.cardElements.push(card);
    });

    // Wire zenith CTA button
    const zenithCta = this.wrapper.querySelector('#orbitalZenithCta');
    if (zenithCta) {
      zenithCta.addEventListener('click', () => {
        const activeIdx = this.getActiveIndex();
        const activeProd = this.products[activeIdx];
        if (activeProd && this.onSelectProduct) {
          this.onSelectProduct(activeProd);
        }
      });
    }
  }

  private updateDimensions(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.pivotX = w * 0.5;

    if (w < 600) {
      // Mobile portrait
      this.radiusX = w * 0.72;
      this.radiusY = h * 0.52;
      this.pivotY = h + this.radiusY * 0.38;
      this.angleStep = 0.52; // wider spacing on small screen
    } else if (w < 1024) {
      // Tablet
      this.radiusX = w * 0.58;
      this.radiusY = h * 0.62;
      this.pivotY = h + this.radiusY * 0.48;
      this.angleStep = 0.42;
    } else {
      // Desktop
      this.radiusX = Math.min(880, w * 0.52);
      this.radiusY = Math.min(760, h * 0.68);
      this.pivotY = h + this.radiusY * 0.52;
      this.angleStep = 0.36;
    }

    // Position the background astrolabe centered exactly on the off-screen pivot
    const dialWrap = this.wrapper.querySelector<HTMLElement>('#orbitalDialWrap');
    if (dialWrap) {
      dialWrap.style.left = `${this.pivotX}px`;
      dialWrap.style.top = `${this.pivotY}px`;
    }
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
      if ((e.target as HTMLElement).closest('button, .orbital-scrub-rail, .orbital-zenith-info')) return;

      this.isDragging = true;
      this.hasDragged = false;
      this.startClientX = e.clientX;
      this.startClientY = e.clientY;
      this.lastClientX = e.clientX;
      this.lastDragTime = performance.now();
      this.startTargetAngle = this.targetAngle;
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

      // Dragging right advances carousel backwards; dragging left advances forward
      const angleDelta = (deltaX / (this.radiusX * 1.1));
      this.targetAngle = this.startTargetAngle + angleDelta;

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

      // Timepiece Rotational Inertia flick
      if (Math.abs(this.dragVelocity) > 3) {
        const momentumAngle = (this.dragVelocity / this.radiusX) * 0.95;
        this.targetAngle += momentumAngle;
      }

      // Magnetically settle on nearest zenith
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

      this.targetAngle -= delta * sensitivity;

      window.clearTimeout(this.snapTimeoutId);
      this.snapTimeoutId = window.setTimeout(() => {
        this.snapToNearest();
      }, 140);
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

    // Prev / Next Navigation Buttons
    if (this.prevBtn) {
      add(this.prevBtn, 'click', () => this.stepBy(-1));
    }
    if (this.nextBtn) {
      add(this.nextBtn, 'click', () => this.stepBy(1));
    }

    // Scrubber Rail
    const scrubRail = this.wrapper.querySelector('#orbitalScrubRail');
    if (scrubRail) {
      add(scrubRail, 'pointerdown', (e: Event) => {
        const pe = e as PointerEvent;
        const rect = (scrubRail as HTMLElement).getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (pe.clientX - rect.left) / rect.width));
        const targetIdx = Math.round(progress * (this.numItems - 1));
        this.snapToIndex(targetIdx);
      });
    }

    // Window Resize
    const onResize = () => {
      this.updateDimensions();
    };
    add(window, 'resize', onResize);
  }

  public stepBy(direction: number): void {
    const activeIdx = this.getActiveIndex();
    const nextIdx = (activeIdx + direction + this.numItems) % this.numItems;
    this.snapToIndex(nextIdx);
  }

  public snapToIndex(index: number): void {
    // The zenith occurs when angle + idx * angleStep = 0 (mod 2pi)
    const targetBase = -index * this.angleStep;
    const currentRot = Math.round(this.targetAngle / (Math.PI * 2));
    let candidate = targetBase + currentRot * (Math.PI * 2);

    const diff = candidate - this.targetAngle;
    if (diff > Math.PI) candidate -= Math.PI * 2;
    if (diff < -Math.PI) candidate += Math.PI * 2;

    this.targetAngle = candidate;
  }

  private snapToNearest(): void {
    const activeIdx = this.getActiveIndex();
    this.snapToIndex(activeIdx);
  }

  public getActiveIndex(): number {
    const raw = -this.angle / this.angleStep;
    const normalized = ((raw % this.numItems) + this.numItems) % this.numItems;
    return Math.round(normalized) % this.numItems;
  }

  private loop(): void {
    if (!this.isRunning) return;

    // Smooth LERP angle
    this.angle += (this.targetAngle - this.angle) * this.lerpFactor;

    // Velocity tracking for micro-stretch
    this.velocity = (this.angle - this.lastAngle) * 60;
    this.lastAngle = this.angle;

    // Rotate the background Astrolabe Sundial in sync with orbit
    if (this.astrolabeSvg) {
      const dialDeg = (this.angle * 180) / Math.PI;
      this.astrolabeSvg.style.transform = `rotate(${dialDeg.toFixed(2)}deg)`;
    }

    // Render Celestial Orbital Cards
    this.renderOrbit();

    // Render HUD & Zenith Info Box
    this.renderHUD();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private renderOrbit(): void {
    for (let i = 0; i < this.numItems; i++) {
      const card = this.cardElements[i];
      if (!card) continue;

      // Angular position relative to golden zenith
      const theta = this.angle + i * this.angleStep;

      // Normalized phase in [-PI, PI]
      let normTheta = ((theta % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;

      // Celestial Elliptical Coordinates from off-screen pivot
      // normTheta = 0 is zenith (exact top-center of orbit)
      const x = this.pivotX + Math.sin(normTheta) * this.radiusX;
      const y = this.pivotY - Math.cos(normTheta) * this.radiusY;

      // Tangent rotation along the circle curve
      const rotZ = normTheta * (180 / Math.PI) * 0.78;

      // Zenith scale & opacity falloff
      const absNorm = Math.abs(normTheta);
      const scale = Math.max(0.55, 1.0 - absNorm * 0.32);
      const opacity = Math.max(0, Math.min(1.0, 1.0 - (absNorm - 0.28) * 1.5));
      const blur = Math.max(0, (absNorm - 0.4) * 12);

      // Occlusion z-index: center zenith is on top
      const zIndex = Math.round(1000 - absNorm * 500);

      card.style.transform = `
        translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)
        translate(-50%, -50%)
        rotate(${rotZ.toFixed(2)}deg)
        scale(${scale.toFixed(3)})
      `;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(zIndex);
      card.style.filter = blur > 0.8 ? `blur(${blur.toFixed(1)}px)` : 'none';
      card.style.pointerEvents = absNorm < 0.38 ? 'auto' : 'none';

      // Active zenith state
      if (absNorm < 0.16) {
        card.classList.add('is-zenith');
      } else {
        card.classList.remove('is-zenith');
      }
    }
  }

  private renderHUD(): void {
    const activeIdx = this.getActiveIndex();
    const activeProd = this.products[activeIdx];

    // Counter
    if (this.counterText) {
      this.counterText.textContent = `${String(activeIdx + 1).padStart(2, '0')} / ${String(this.numItems).padStart(2, '0')}`;
    }

    // Azimuth degrees calculation
    if (this.azimuthText) {
      const deg = ((-this.angle * 180) / Math.PI) % 360;
      const posDeg = Math.round((deg + 360) % 360);
      this.azimuthText.textContent = `AZIMUTH ${String(posDeg).padStart(3, '0')}° 00' // HARVEST ZENITH`;
    }

    // Progress Bar
    if (this.scrubProgress) {
      const progress = ((-this.angle / this.angleStep) % this.numItems + this.numItems) % this.numItems;
      const pct = (progress / (this.numItems - 1)) * 100;
      this.scrubProgress.style.left = `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`;
    }

    // Update Zenith Info Box content smoothly
    if (activeProd && this.zenithInfoBox) {
      const catEl = this.zenithInfoBox.querySelector('#orbitalZenithCategory');
      const titleEl = this.zenithInfoBox.querySelector('#orbitalZenithTitle');
      const subEl = this.zenithInfoBox.querySelector('#orbitalZenithSub');
      const priceEl = this.zenithInfoBox.querySelector('#orbitalZenithPrice');
      const weightEl = this.zenithInfoBox.querySelector('#orbitalZenithWeight');

      if (catEl && catEl.textContent !== activeProd.category.toUpperCase()) {
        catEl.textContent = `${activeProd.category.toUpperCase()} • ZENITH RESERVE`;
      }
      if (titleEl && titleEl.textContent !== activeProd.title) {
        titleEl.textContent = activeProd.title;
      }
      if (subEl && subEl.textContent !== activeProd.latinSubtitle) {
        subEl.textContent = activeProd.latinSubtitle;
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

    this.cardElements = [];
  }
}

