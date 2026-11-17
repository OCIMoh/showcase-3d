/**
 * ActiveTheoryCarousel — Vertical 3D Spatial Tunnel & Cyber-Atmospheric Showcase
 * Inspired by Active Theory (activetheory.net/work)
 * 
 * Features:
 * 1. True Vertical 3D Spatial Tunnel / Spine along (Y, Z) planes
 * 2. Signature Active Theory dynamic pitch tilt (rotateX) as cards rise and ascend
 * 3. Velocity-driven vertical elongation warp and slipstream aero-dynamics
 * 4. Reactive Cyber Canvas: 3D particle constellation with vertical hyperdrive streaks
 * 5. Ambient Reticle HUD: Coordinates telemetry, project index, spatial scrub rail
 * 6. Glass Monolith Cards with high-res jar cutouts and interactive hover bloom
 * 7. Full vertical swipe / wheel / arrow navigation with buttery LERP momentum
 * 8. 100% CORS-immune, zero external runtime dependencies, full memory cleanup
 */

import { Product } from '../data/products';

export interface ActiveTheoryOptions {
  container: HTMLElement;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  size: number;
  speedZ: number;
  alpha: number;
}

export class ActiveTheoryCarousel {
  private container: HTMLElement;
  private products: Product[];
  private onSelectProduct?: (product: Product) => void;

  private wrapper!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private ribbonStage!: HTMLElement;
  private cardElements: HTMLElement[] = [];
  private hudCounter!: HTMLElement;
  private hudTitleParallax!: HTMLElement;
  private progressBar!: HTMLElement;

  // Kinematics & 3D Spatial Curve
  private angle = 0;          // Current smoothed angle (radians)
  private targetAngle = 0;    // Target angle (radians)
  private velocity = 0;       // Angular velocity
  private lastAngle = 0;
  private numItems: number;
  private angleStep: number;
  private radiusY = 520;      // Vertical curve radius
  private radiusZ = 450;      // Depth curve radius
  private lerpFactor = 0.075;

  // Mouse & Parallax tracking
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  // Pointer drag state (Vertical priority)
  private isDragging = false;
  private hasDragged = false;
  private startClientX = 0;
  private startClientY = 0;
  private startTargetAngle = 0;
  private lastClientY = 0;
  private lastDragTime = 0;
  private dragVelocity = 0;

  // Particle constellation
  private particles: Particle[] = [];
  private numParticles = 100;

  // Animation & Loop state
  private isRunning = true;
  private animationFrameId = 0;
  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }[] = [];

  constructor(options: ActiveTheoryOptions) {
    this.container = options.container;
    this.products = options.products;
    this.onSelectProduct = options.onSelectProduct;
    this.numItems = this.products.length;
    this.angleStep = (Math.PI * 2) / this.numItems;

    this.buildDOM();
    this.initCanvas();
    this.initParticles();
    this.updateDimensions();
    this.bindEvents();

    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'at-showcase';
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'Active Theory Vertical 3D Tunnel Showcase');

    this.wrapper.innerHTML = `
      <!-- Dynamic Atmospheric Particle & Depth Corridor Canvas -->
      <canvas class="at-canvas" id="atCanvas" aria-hidden="true"></canvas>

      <!-- Background Cinematic Parallax Typography (Vertical Stack) -->
      <div class="at-bg-typography at-bg-typography--vertical" aria-hidden="true">
        <div class="at-bg-typography__track" id="atParallaxTrack">
          <div class="at-bg-typography__text">AGRUMÊA ARCHIVE</div>
          <div class="at-bg-typography__text">VOLCANIC TERROIR</div>
          <div class="at-bg-typography__text">SICILIAN BOTANICAL</div>
          <div class="at-bg-typography__text">DISPENSA ETNA</div>
        </div>
      </div>

      <!-- Top Active Theory Telemetry HUD -->
      <header class="at-hud-top" aria-hidden="true">
        <div class="at-hud-cell">
          <span class="at-hud-dot"></span>
          <span class="at-hud-label">EXP // 04</span>
          <span class="at-hud-val">ACTIVE THEORY 3D TUNNEL</span>
        </div>
        <div class="at-hud-cell at-hud-cell--coords">
          <span class="at-hud-label">COORDS</span>
          <span class="at-hud-val" id="atCoordsText">37.5079° N, 15.0873° E // ETNA TERROIR</span>
        </div>
        <div class="at-hud-cell at-hud-cell--index">
          <span class="at-hud-label">INDEX</span>
          <span class="at-hud-val" id="atCounter">01 / ${String(this.numItems).padStart(2, '0')}</span>
        </div>
      </header>

      <!-- 3D Viewport & Vertical Ribbon Stage -->
      <div class="at-viewport" id="atViewport">
        <div class="at-ribbon at-ribbon--vertical" id="atRibbon">
          <!-- Cards injected dynamically -->
        </div>
      </div>

      <!-- Bottom HUD & Vertical Tunnel Controls -->
      <footer class="at-hud-bottom">
        <div class="at-scrub-controls">
          <button class="at-nav-btn at-nav-btn--prev" id="atPrevBtn" aria-label="Previous product (Scroll Up)" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            <span>PREV</span>
          </button>
          
          <div class="at-scrub-rail" id="atScrubRail" role="slider" aria-label="Tunnel Depth Scrubber" aria-valuemin="1" aria-valuemax="${this.numItems}" aria-valuenow="1" tabindex="0">
            <div class="at-scrub-track"></div>
            <div class="at-scrub-thumb" id="atProgressBar"></div>
          </div>

          <button class="at-nav-btn at-nav-btn--next" id="atNextBtn" aria-label="Next product (Scroll Down)" type="button">
            <span>NEXT</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          </button>
        </div>

        <div class="at-hud-footer-info" aria-hidden="true">
          <span class="at-hint-text">VERTICAL SCROLL // SWIPE UP TO DIVE</span>
          <span class="at-status-badge">HYDRA // SPATIAL MATRIX</span>
        </div>
      </footer>
    `;

    this.container.appendChild(this.wrapper);

    this.canvas = this.wrapper.querySelector('#atCanvas')!;
    this.ribbonStage = this.wrapper.querySelector('#atRibbon')!;
    this.hudCounter = this.wrapper.querySelector('#atCounter')!;
    this.hudTitleParallax = this.wrapper.querySelector('#atParallaxTrack')!;
    this.progressBar = this.wrapper.querySelector('#atProgressBar')!;

    // Build the 3D cards
    this.products.forEach((prod, idx) => {
      const card = document.createElement('article');
      card.className = 'at-card';
      card.dataset.index = String(idx);
      card.dataset.slug = prod.slug;

      const formattedNum = String(idx + 1).padStart(2, '0');
      const categoryTag = prod.category.toUpperCase();

      card.innerHTML = `
        <div class="at-card__inner">
          <!-- Cyber Monolith Reticle Corners -->
          <div class="at-card__bracket at-card__bracket--tl" aria-hidden="true"></div>
          <div class="at-card__bracket at-card__bracket--tr" aria-hidden="true"></div>
          <div class="at-card__bracket at-card__bracket--bl" aria-hidden="true"></div>
          <div class="at-card__bracket at-card__bracket--br" aria-hidden="true"></div>

          <!-- Card Top Bar -->
          <div class="at-card__header">
            <span class="at-card__sec-id">SEC // ${formattedNum}</span>
            <span class="at-card__category">${categoryTag}</span>
            <span class="at-card__weight">${prod.weight}</span>
          </div>

          <!-- Floating 3D Jar Cutout -->
          <div class="at-card__jar-stage">
            <div class="at-card__ambient-glow"></div>
            <img 
              class="at-card__jar-img" 
              src="${prod.jarUrl}" 
              alt="${prod.title}" 
              loading="${idx < 4 ? 'eager' : 'lazy'}" 
              decoding="async"
              draggable="false"
            />
          </div>

          <!-- Editorial Card Metadata -->
          <div class="at-card__meta">
            <div class="at-card__origin">${prod.origin}</div>
            <h2 class="at-card__title">${prod.title}</h2>
            <p class="at-card__sub">${prod.latinSubtitle}</p>
          </div>

          <!-- Card Bottom Interactive Trigger -->
          <div class="at-card__footer">
            <span class="at-card__price">${prod.price}</span>
            <div class="at-card__cta">
              <span>EXPLORE</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </div>
          </div>
        </div>
      `;

      // Click handler with smart front/orbit selection
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

      this.ribbonStage.appendChild(card);
      this.cardElements.push(card);
    });
  }

  private initCanvas(): void {
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.wrapper.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  private initParticles(): void {
    this.particles = [];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < this.numParticles; i++) {
      const x = (Math.random() - 0.5) * w * 1.5;
      const y = (Math.random() - 0.5) * h * 1.8;
      const z = Math.random() * 1000 + 40;

      this.particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        size: Math.random() * 2 + 1,
        speedZ: Math.random() * 1.3 + 0.4,
        alpha: Math.random() * 0.75 + 0.2
      });
    }
  }

  private updateDimensions(): void {
    const h = window.innerHeight;
    if (h < 700) {
      this.radiusY = 400;
      this.radiusZ = 360;
    } else if (h < 900) {
      this.radiusY = 480;
      this.radiusZ = 420;
    } else {
      this.radiusY = Math.min(580, h * 0.52);
      this.radiusZ = 460;
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

    // Pointer Drag on Stage (Vertical swipe priority)
    const onPointerDown = (e: PointerEvent) => {
      // Don't drag if clicking buttons or scrub rail directly
      if ((e.target as HTMLElement).closest('button, .at-scrub-rail')) return;

      this.isDragging = true;
      this.hasDragged = false;
      this.startClientX = e.clientX;
      this.startClientY = e.clientY;
      this.lastClientY = e.clientY;
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
      // Track mouse for 3D tilt & parallax
      const rect = this.wrapper.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      this.targetMouseX = nx * 2;
      this.targetMouseY = ny * 2;

      if (!this.isDragging) return;

      const deltaX = e.clientX - this.startClientX;
      const deltaY = e.clientY - this.startClientY;

      if (!this.hasDragged && (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5)) {
        this.hasDragged = true;
      }

      // In a vertical tunnel: dragging UP (deltaY < 0) advances downwards into the tunnel
      const angleDelta = (deltaY / (this.radiusY * 0.95));
      this.targetAngle = this.startTargetAngle + angleDelta;

      // Track vertical drag velocity
      const now = performance.now();
      const dt = Math.max(1, now - this.lastDragTime);
      const moveDelta = e.clientY - this.lastClientY;
      this.dragVelocity = (moveDelta / dt) * 16.67; // Normalized to 60fps frame
      this.lastClientY = e.clientY;
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

      // If user released without dragging, check if clicked on card
      if (!this.hasDragged) {
        const cardTarget = (e.target as HTMLElement).closest<HTMLElement>('.at-card');
        if (cardTarget && cardTarget.dataset.index) {
          const idx = parseInt(cardTarget.dataset.index, 10);
          const activeIdx = this.getActiveIndex();
          if (idx === activeIdx) {
            // Front active card clicked -> navigate
            if (this.onSelectProduct && this.products[idx]) {
              this.onSelectProduct(this.products[idx]);
            }
          } else {
            // Orbit card clicked -> smoothly bring it to the front
            this.snapToIndex(idx);
          }
        }
      }

      // Apply vertical flick momentum with gentle decay
      if (Math.abs(this.dragVelocity) > 2) {
        const momentumAngle = (this.dragVelocity / this.radiusY) * 0.85;
        this.targetAngle += momentumAngle;
      }
    };

    add(this.wrapper, 'pointerdown', onPointerDown as EventListener);
    add(window, 'pointermove', onPointerMove as EventListener);
    add(window, 'pointerup', onPointerUp as EventListener);
    add(window, 'pointercancel', onPointerUp as EventListener);

    // Mouse Wheel scrub (Natural vertical scroll)
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Scrolling down (deltaY > 0) pulls upcoming items up from below
      const delta = e.deltaY;
      const sensitivity = 0.0022;
      this.targetAngle -= delta * sensitivity;
    };
    add(this.wrapper, 'wheel', onWheel as EventListener, { passive: false });

    // Keyboard Arrow navigation (Up/Down or Left/Right)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stepBy(-1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.stepBy(1);
      }
    };
    add(window, 'keydown', onKeyDown as EventListener);

    // Prev / Next Buttons
    const prevBtn = this.wrapper.querySelector('#atPrevBtn');
    const nextBtn = this.wrapper.querySelector('#atNextBtn');
    if (prevBtn) {
      add(prevBtn, 'click', () => this.stepBy(-1));
    }
    if (nextBtn) {
      add(nextBtn, 'click', () => this.stepBy(1));
    }

    // Interactive Orbit Scrubber Rail
    const scrubRail = this.wrapper.querySelector('#atScrubRail');
    if (scrubRail) {
      let isScrubbing = false;

      const handleScrub = (clientX: number) => {
        const rect = scrubRail.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const targetIndex = Math.round(progress * (this.numItems - 1));
        this.snapToIndex(targetIndex);
      };

      add(scrubRail, 'pointerdown', (e: Event) => {
        isScrubbing = true;
        const pe = e as PointerEvent;
        handleScrub(pe.clientX);
      });

      add(window, 'pointermove', (e: Event) => {
        if (!isScrubbing) return;
        const pe = e as PointerEvent;
        handleScrub(pe.clientX);
      });

      add(window, 'pointerup', () => {
        isScrubbing = false;
      });
    }

    // Window Resize
    const onResize = () => {
      this.resizeCanvas();
      this.updateDimensions();
    };
    add(window, 'resize', onResize);
  }

  public stepBy(direction: number): void {
    const activeIndex = this.getActiveIndex();
    const nextIndex = (activeIndex + direction + this.numItems) % this.numItems;
    this.snapToIndex(nextIndex);
  }

  public snapToIndex(index: number): void {
    const targetBase = -index * this.angleStep;
    const currentRot = Math.round(this.targetAngle / (Math.PI * 2));
    let candidate = targetBase + currentRot * (Math.PI * 2);

    const diff = candidate - this.targetAngle;
    if (diff > Math.PI) candidate -= Math.PI * 2;
    if (diff < -Math.PI) candidate += Math.PI * 2;

    this.targetAngle = candidate;
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

    // Calculate angular velocity for slipstream dynamic warping
    this.velocity = (this.angle - this.lastAngle) * 60;
    this.lastAngle = this.angle;

    // Smooth mouse coordinates
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    // Render Canvas Particle Constellation & Atmosphere
    this.renderCanvas();

    // Render 3D Ribbon Cards (Vertical Spatial Tunnel)
    this.renderRibbon();

    // Render HUD Telemetry
    this.renderHUD();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private renderCanvas(): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    const cx = w * 0.5;
    const cy = h * 0.5;

    ctx.clearRect(0, 0, w, h);

    // Active Theory Vertical Corridor Depth Lines
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(229, 90, 43, 0.08)';

    const vanishingX = cx + (this.mouseX * 35);
    const vanishingY = cy + (this.mouseY * 20);

    // Top ceiling perspective rays
    const ceilingRays = 12;
    for (let i = 0; i <= ceilingRays; i++) {
      const rx = (i / ceilingRays) * w;
      ctx.beginPath();
      ctx.moveTo(vanishingX, vanishingY);
      ctx.lineTo(rx, 0);
      ctx.stroke();
    }

    // Bottom floor perspective rays
    for (let i = 0; i <= ceilingRays; i++) {
      const rx = (i / ceilingRays) * w;
      ctx.beginPath();
      ctx.moveTo(vanishingX, vanishingY);
      ctx.lineTo(rx, h);
      ctx.stroke();
    }

    // Depth corridor frames receding in Z
    for (let d = 1; d <= 5; d++) {
      const progress = d / 5;
      const boxW = w * Math.pow(progress, 1.8);
      const boxH = h * Math.pow(progress, 1.8);
      ctx.strokeRect(cx - boxW * 0.5, cy - boxH * 0.5, boxW, boxH);
    }
    ctx.restore();

    // Render 3D Particle Constellation with Vertical Hyperdrive Streaks
    const speedFactor = 1 + Math.abs(this.velocity) * 2.0;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Move particle forward in Z and drift vertically with scroll velocity
      p.z -= p.speedZ * speedFactor;
      p.y -= this.velocity * 3.5;

      if (p.z <= 10) {
        p.z = 1000;
        p.x = (Math.random() - 0.5) * w * 1.5;
        p.y = (Math.random() - 0.5) * h * 1.8;
      }
      // Wrap vertical coordinates
      if (p.y > h) p.y = -h * 0.2;
      if (p.y < -h * 0.2) p.y = h;

      // 3D Perspective Projection
      const fov = 350;
      const scale = fov / (fov + p.z);
      const px = cx + (p.x + this.mouseX * 50) * scale;
      const py = cy + (p.y + this.mouseY * 50) * scale;
      const radius = Math.max(0.6, p.size * scale * 1.5);
      const alpha = Math.max(0.05, Math.min(0.85, (1 - p.z / 1000) * p.alpha));

      // Vertical hyperdrive warp streaks when scrolling fast!
      if (Math.abs(this.velocity) > 0.08) {
        const streakLength = -this.velocity * 36 * scale;
        ctx.strokeStyle = `rgba(229, 90, 43, ${alpha * 0.9})`;
        ctx.lineWidth = radius * 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + streakLength);
        ctx.stroke();
      } else {
        // Gentle glowing amber particle
        ctx.fillStyle = `rgba(235, 120, 70, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderRibbon(): void {
    const stageWidth = this.ribbonStage.offsetWidth || window.innerWidth;
    const stageHeight = this.ribbonStage.offsetHeight || window.innerHeight;
    const centerX = stageWidth * 0.5;
    const centerY = stageHeight * 0.5;

    // Vertical elongation stretch along velocity vector
    const velocityScaleY = 1 + Math.min(0.20, Math.abs(this.velocity) * 0.014);
    // Subtle horizontal contraction (Poisson ratio)
    const velocityScaleX = 1 - Math.min(0.06, Math.abs(this.velocity) * 0.005);

    // Mouse tilt tracking
    const mousePitchX = -this.mouseY * 8;
    const mouseYawY = this.mouseX * 12;

    for (let i = 0; i < this.numItems; i++) {
      const card = this.cardElements[i];
      if (!card) continue;

      // Angular coordinate along the vertical 3D ribbon
      const theta = this.angle + i * this.angleStep;

      // Normalized phase in [-PI, PI] relative to active front center
      let normTheta = ((theta % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;

      // Vertical 3D Cylinder / Spine coordinates:
      // Y: when normTheta > 0, item is below center (coming up); when normTheta < 0, item is above center (ascending out)
      const y = Math.sin(normTheta) * this.radiusY;
      // Z: depth curve: center (normTheta = 0) is 0; curves back to -radiusZ * 1.8
      const z = (Math.cos(normTheta) - 1) * this.radiusZ;
      // X: subtle organic serpentine wave sway
      const x = Math.sin(normTheta * 1.5) * 35 + (this.mouseX * 15);

      // Signature Active Theory dynamic pitch tilt (rotateX):
      // Cards coming from below tilt back to face camera; cards going up tilt back as they ascend into ceiling
      const rotX = -normTheta * (180 / Math.PI) * 0.58 - this.velocity * 0.6 + mousePitchX;
      // Yaw rotation: subtle serpentine face tracking
      const rotY = Math.sin(normTheta * 1.5) * 6 + mouseYawY;
      // Bank roll: subtle lean into movement
      const rotZ = Math.sin(normTheta * 1.2) * 3 + this.velocity * 0.25;

      // Scale perspective
      const perspectiveScale = Math.max(0.55, 1 + z / 1100);
      const finalScaleX = perspectiveScale * velocityScaleX;
      const finalScaleY = perspectiveScale * velocityScaleY;

      // Depth fog & Opacity falloff into back distance
      const depthFog = Math.max(0.12, Math.min(1.0, 1 + (z + 80) / 750));
      // Depth blur when far back
      const depthBlur = Math.max(0, (-z - 280) * 0.016);

      // Occlusion z-index
      const zIndex = Math.round(1000 + z);

      // Apply GPU hardware transform
      card.style.transform = `
        translate3d(${centerX + x}px, ${centerY + y}px, ${z}px)
        rotateX(${rotX.toFixed(2)}deg)
        rotateY(${rotY.toFixed(2)}deg)
        rotateZ(${rotZ.toFixed(2)}deg)
        scale(${finalScaleX.toFixed(3)}, ${finalScaleY.toFixed(3)})
      `;
      card.style.opacity = depthFog.toFixed(3);
      card.style.zIndex = String(zIndex);
      card.style.filter = depthBlur > 0.5 ? `blur(${depthBlur.toFixed(1)}px)` : 'none';
      card.style.pointerEvents = z < -380 ? 'none' : 'auto';

      // Active state highlight if closest to center front
      const isFront = Math.abs(normTheta) < (this.angleStep * 0.55);
      if (isFront) {
        card.classList.add('is-active-front');
      } else {
        card.classList.remove('is-active-front');
      }
    }
  }

  private renderHUD(): void {
    const activeIdx = this.getActiveIndex();

    // Update Counter
    if (this.hudCounter) {
      this.hudCounter.textContent = `${String(activeIdx + 1).padStart(2, '0')} / ${String(this.numItems).padStart(2, '0')}`;
    }

    // Update Background Parallax Track (Vertical shift)
    if (this.hudTitleParallax) {
      const parallaxShift = (this.angle * 70) % 400;
      this.hudTitleParallax.style.transform = `translate3d(0, ${parallaxShift.toFixed(1)}px, 0)`;
    }

    // Update Orbit Progress Bar
    if (this.progressBar) {
      const progress = ((-this.angle / this.angleStep) % this.numItems + this.numItems) % this.numItems;
      const pct = (progress / (this.numItems - 1)) * 100;
      this.progressBar.style.left = `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`;
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

    this.cardElements = [];
    this.particles = [];
  }
}
