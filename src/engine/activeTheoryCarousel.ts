/**
 * Active Theory — Immersive 3D WebGL Spatial Portfolio Engine
 * Inspired by activetheory.net (Awwwards Site of the Year / Site of the Month)
 *
 * Signature Characteristics:
 * - Pure Pitch-Black Void (#060709) with ambient 3D depth grid
 * - Mouse-driven WebGL Fluid Ribbon & Particle Trail (Active Theory trademark)
 * - 3D Panoramic Horizontal Cinema Stream with Rack-Focus Depth of Field
 * - Alternative Architectural 12-Column Archive Grid View (Toggleable)
 * - Cybernetic Telemetry Masthead (Active Theory // OCIMOH) & Acoustic Audio Synthesizer
 * - In-Situ Full-Bleed Case Study Slide-over Drawer with Live Deploy & GitHub Launchers
 * - 60fps Zero-Reflow GPU Matrix transforms
 */

import { ShowcaseProject, SHOWCASE_PROJECTS } from '../data/showcaseProjects';

export interface ActiveTheoryOptions {
  container: HTMLElement;
  projects?: ShowcaseProject[];
  onSelectProject?: (project: ShowcaseProject) => void;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
  vx: number;
  vy: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  speedZ: number;
  alpha: number;
}

export class ActiveTheoryCarousel {
  private container: HTMLElement;
  private wrapper!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private streamViewport!: HTMLElement;
  private streamTrack!: HTMLElement;
  private gridViewport!: HTMLElement;
  private hudCounter!: HTMLElement;
  private hudCoords!: HTMLElement;
  private soundToggleBtn!: HTMLElement;
  private viewToggleBtn!: HTMLElement;
  private progressBar!: HTMLElement;
  private drawerElement!: HTMLElement;
  private activeTitleDisplay!: HTMLElement;
  private activeClientDisplay!: HTMLElement;

  private projects: ShowcaseProject[];
  private numItems: number;
  private cardElements: HTMLElement[] = [];
  private onSelectProject?: (project: ShowcaseProject) => void;

  // View mode: 'stream' (3D Spatial Cinema Stream) or 'grid' (Architectural Archive Grid)
  private viewMode: 'stream' | 'grid' = 'stream';

  // Continuous physics scroll
  private scrollPos = 0;
  private targetScrollPos = 0;
  private velocity = 0;
  private isDragging = false;
  private hasDragged = false;
  private startClientX = 0;
  private startClientY = 0;
  private startScrollPos = 0;
  private lastClientX = 0;
  private lastDragTime = 0;
  private dragVelocity = 0;

  // 3D Mouse Parallax & Fluid Ribbon
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private mouseTrail: TrailPoint[] = [];
  private particles: Particle[] = [];
  private numParticles = 80;

  // Audio state
  private soundEnabled = false;
  private audioCtx: AudioContext | null = null;

  // Drawer state
  private activeDrawerProject: ShowcaseProject | null = null;
  private lastActiveIndex = 0;

  // Animation Loop & Cleanup
  private isRunning = true;
  private animationFrameId = 0;
  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }[] = [];

  constructor(options: ActiveTheoryOptions) {
    this.container = options.container;
    this.projects = options.projects && options.projects.length ? options.projects : SHOWCASE_PROJECTS;
    this.onSelectProject = options.onSelectProject;
    this.numItems = this.projects.length;

    this.buildDOM();
    this.initCanvas();
    this.initParticles();
    this.bindEvents();

    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /* --------------------------------------------------------------------------
     Acoustic Audio Synthesizer (Active Theory Haptics)
     -------------------------------------------------------------------------- */
  private initAudio(): void {
    if (this.audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    } catch {
      // Audio not supported in environment
    }
  }

  private playTone(freq = 440, type: OscillatorType = 'sine', duration = 0.05, gainLevel = 0.06): void {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.4), this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Ignore audio glitch
    }
  }

  /* --------------------------------------------------------------------------
     DOM Construction
     -------------------------------------------------------------------------- */
  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'at-showcase at-showcase--stream';
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'Active Theory 3D Portfolio Showcase');

    this.wrapper.innerHTML = `
      <!-- WebGL Fluid Cursor Ribbon & Holographic Depth Corridor Canvas -->
      <canvas class="at-canvas" id="atCanvas" aria-hidden="true"></canvas>

      <!-- Active Theory Cybernetic Telemetry Masthead -->
      <header class="at-masthead" aria-label="Portfolio Telemetry Navigation">
        <div class="at-masthead__brand">
          <span class="at-masthead__dot"></span>
          <span class="at-masthead__logo-text">ACTIVE THEORY</span>
          <span class="at-masthead__sep">//</span>
          <span class="at-masthead__org">OCIMOH STUDIO</span>
        </div>

        <div class="at-masthead__center at-telemetry-badge">
          <span class="at-telemetry-label">TELEMETRY:</span>
          <span class="at-telemetry-val" id="atCoordsText">60.0 FPS // HYDRA 3D MATRIX // VENICE BEACH • AMSTERDAM</span>
        </div>

        <div class="at-masthead__controls">
          <!-- View Toggle: Stream vs Grid -->
          <button class="at-ctrl-pill at-ctrl-pill--toggle" id="atViewToggle" type="button" aria-label="Toggle between 3D Stream and Archive Grid">
            <span class="at-ctrl-icon" id="atViewIcon">⊞</span>
            <span id="atViewLabel">ARCHIVE GRID</span>
          </button>

          <!-- Acoustic Sound Synthesizer Toggle -->
          <button class="at-ctrl-pill at-ctrl-pill--sound" id="atSoundToggle" type="button" aria-label="Toggle Acoustic Sound Effects">
            <span class="at-sound-eq" id="atSoundEq" aria-hidden="true">
              <span class="at-eq-bar"></span>
              <span class="at-eq-bar"></span>
              <span class="at-eq-bar"></span>
            </span>
            <span id="atSoundLabel">SOUND OFF</span>
          </button>

          <!-- Current Index -->
          <div class="at-ctrl-pill at-ctrl-pill--counter">
            <span class="at-counter-label">PROJECT</span>
            <span class="at-counter-val" id="atCounter">01 / ${String(this.numItems).padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      <!-- VIEW 1: 3D Horizontal Spatial Cinema Stream (Active Theory Signature) -->
      <main class="at-stream-viewport" id="atStreamViewport">
        <div class="at-stream-track" id="atStreamTrack">
          <!-- Panoramic Cinema Monolith cards injected dynamically -->
        </div>
      </main>

      <!-- VIEW 2: Architectural 12-Column Case Study Grid (Toggleable Archive) -->
      <section class="at-grid-viewport" id="atGridViewport" aria-label="Archive Grid" style="display: none;">
        <div class="at-grid-inner">
          <div class="at-grid-header">
            <h2 class="at-grid-headline">COMPLETE REPOSITORY ARCHIVE</h2>
            <p class="at-grid-subline">OCIMOH / 11 PRODUCTION EXPERIENCES & 3D PROTOCOLS</p>
          </div>
          <div class="at-grid-cards" id="atGridCards">
            <!-- Grid cards injected dynamically -->
          </div>
        </div>
      </section>

      <!-- Bottom HUD & Navigation Controls -->
      <footer class="at-hud-bottom" id="atBottomControls">
        <!-- Active Project Headline Bar -->
        <div class="at-active-project-bar">
          <div class="at-active-client" id="atActiveClient">OCIMOH STUDIO</div>
          <h1 class="at-active-title" id="atActiveTitle">${this.projects[0].title}</h1>
        </div>

        <!-- Interactive Scrubber & Directional Navigation -->
        <div class="at-scrub-controls">
          <button class="at-nav-btn at-nav-btn--prev" id="atPrevBtn" aria-label="Previous Project (Arrow Left)" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>PREV</span>
          </button>
          
          <div class="at-scrub-rail" id="atScrubRail" role="slider" aria-label="Timeline Depth Scrubber" aria-valuemin="1" aria-valuemax="${this.numItems}" aria-valuenow="1" tabindex="0">
            <div class="at-scrub-track">
              ${this.projects.map((_, i) => `<span class="at-scrub-dot ${i === 0 ? 'is-active' : ''}" data-index="${i}"></span>`).join('')}
            </div>
            <div class="at-scrub-thumb" id="atProgressBar"></div>
          </div>

          <button class="at-nav-btn at-nav-btn--next" id="atNextBtn" aria-label="Next Project (Arrow Right)" type="button">
            <span>NEXT</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div class="at-hud-footer-hint" aria-hidden="true">
          <span>DRAG / ARROWS TO EXPLORE</span>
          <span class="at-bullet">✦</span>
          <span>CLICK MONOLITH TO OPEN CASE STUDY</span>
        </div>
      </footer>

      <!-- In-Situ Full-Bleed Case Study Slide-over Drawer -->
      <aside class="at-drawer" id="atDrawer" aria-label="Project Case Study" aria-hidden="true">
        <div class="at-drawer__backdrop" id="atDrawerBackdrop"></div>
        <div class="at-drawer__panel" id="atDrawerPanel">
          <!-- Injected dynamically via openCaseStudy() -->
        </div>
      </aside>
    `;

    this.container.appendChild(this.wrapper);

    this.canvas = this.wrapper.querySelector('#atCanvas')!;
    this.streamViewport = this.wrapper.querySelector('#atStreamViewport')!;
    this.streamTrack = this.wrapper.querySelector('#atStreamTrack')!;
    this.gridViewport = this.wrapper.querySelector('#atGridViewport')!;
    this.hudCounter = this.wrapper.querySelector('#atCounter')!;
    this.hudCoords = this.wrapper.querySelector('#atCoordsText')!;
    this.progressBar = this.wrapper.querySelector('#atProgressBar')!;
    this.drawerElement = this.wrapper.querySelector('#atDrawer')!;
    this.soundToggleBtn = this.wrapper.querySelector('#atSoundToggle')!;
    this.viewToggleBtn = this.wrapper.querySelector('#atViewToggle')!;
    this.activeTitleDisplay = this.wrapper.querySelector('#atActiveTitle')!;
    this.activeClientDisplay = this.wrapper.querySelector('#atActiveClient')!;

    // Build Panoramic Cinema Cards for 3D Stream View
    this.buildStreamCards();

    // Build Grid Cards for Archive View
    this.buildGridCards();

    // Sound toggle handling
    this.soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.soundEnabled = !this.soundEnabled;
      const label = this.soundToggleBtn.querySelector('#atSoundLabel');
      const eq = this.soundToggleBtn.querySelector('#atSoundEq');
      if (this.soundEnabled) {
        if (label) label.textContent = 'SOUND ON';
        if (eq) eq.classList.add('is-animating');
        this.soundToggleBtn.classList.add('is-active');
        this.playTone(880, 'sine', 0.08, 0.1);
      } else {
        if (label) label.textContent = 'SOUND OFF';
        if (eq) eq.classList.remove('is-animating');
        this.soundToggleBtn.classList.remove('is-active');
      }
    });

    // View toggle handling (Stream vs Grid)
    this.viewToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleViewMode();
    });
  }

  private buildStreamCards(): void {
    this.cardElements = [];
    this.streamTrack.innerHTML = '';

    this.projects.forEach((proj, idx) => {
      const card = document.createElement('article');
      card.className = 'at-stream-card';
      card.dataset.index = String(idx);
      card.dataset.slug = proj.slug;
      card.style.setProperty('--proj-accent', proj.color);
      card.style.setProperty('--proj-accent-glow', `${proj.color}44`);

      const formattedNum = String(idx + 1).padStart(2, '0');

      card.innerHTML = `
        <div class="at-card-chassis">
          <!-- Cyber Monolith Reticle Corner Accents -->
          <span class="at-reticle at-reticle--tl"></span>
          <span class="at-reticle at-reticle--tr"></span>
          <span class="at-reticle at-reticle--bl"></span>
          <span class="at-reticle at-reticle--br"></span>

          <!-- Top Cyber Status Bar -->
          <div class="at-card-top-bar">
            <div class="at-card-id-block">
              <span class="at-card-index">${formattedNum}</span>
              <span class="at-card-slash">//</span>
              <span class="at-card-repo-name">${proj.name}</span>
            </div>
            <div class="at-card-status-badge ${proj.isLive ? 'is-live' : ''}">
              <span class="at-status-dot"></span>
              <span>${proj.isLive ? 'LIVE' : 'GITHUB'}</span>
            </div>
          </div>

          <!-- Panoramic High-Res Viewport Screen Stage -->
          <div class="at-screen-stage">
            <div class="at-screen-glow" style="background: radial-gradient(circle, ${proj.color}33 0%, transparent 70%);"></div>
            <img 
              class="at-screen-img" 
              src="${proj.previewImageUrl}" 
              alt="${proj.title}" 
              loading="${idx < 3 ? 'eager' : 'lazy'}" 
              decoding="async" 
              draggable="false" 
            />
            <div class="at-screen-scanlines"></div>
            
            <!-- Tech Stack Pills on Bottom Edge of Viewport -->
            <div class="at-screen-tech-bar">
              ${proj.techStack.slice(0, 3).map(tech => `<span class="at-tech-pill">${tech}</span>`).join('')}
            </div>
          </div>

          <!-- Monolith Footer Details -->
          <div class="at-card-bottom-bar">
            <div class="at-card-meta-block">
              <div class="at-card-client-tag">${proj.client} · ${proj.year}</div>
              <h3 class="at-card-title">${proj.title}</h3>
            </div>
            <button class="at-card-explore-btn" type="button" aria-label="Open Case Study for ${proj.title}">
              <span>CASE STUDY</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </button>
          </div>
        </div>
      `;

      // Click handler: if active card, open case study; if flanking card, snap to it!
      card.addEventListener('click', (e) => {
        if (this.hasDragged) {
          e.preventDefault();
          return;
        }
        const activeIdx = this.getActiveIndex();
        if (idx === activeIdx) {
          this.openCaseStudy(proj);
        } else {
          this.snapToIndex(idx);
          this.playTone(580, 'sine', 0.05, 0.08);
        }
      });

      this.streamTrack.appendChild(card);
      this.cardElements.push(card);
    });
  }

  private buildGridCards(): void {
    const gridContainer = this.wrapper.querySelector('#atGridCards');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    this.projects.forEach((proj, idx) => {
      const tile = document.createElement('div');
      tile.className = 'at-grid-tile';
      tile.style.setProperty('--proj-accent', proj.color);

      tile.innerHTML = `
        <div class="at-grid-tile__image-wrap">
          <img src="${proj.previewImageUrl}" alt="${proj.title}" class="at-grid-tile__img" loading="lazy" />
          <div class="at-grid-tile__overlay">
            <span class="at-grid-tile__badge ${proj.isLive ? 'is-live' : ''}">${proj.isLive ? '● LIVE' : 'GITHUB'}</span>
          </div>
        </div>
        <div class="at-grid-tile__content">
          <div class="at-grid-tile__meta">
            <span class="at-grid-tile__idx">${String(idx + 1).padStart(2, '0')}</span>
            <span class="at-grid-tile__client">${proj.client}</span>
          </div>
          <h3 class="at-grid-tile__title">${proj.title}</h3>
          <p class="at-grid-tile__desc">${proj.description}</p>
          <div class="at-grid-tile__tech">
            ${proj.techStack.slice(0, 4).map(t => `<span>${t}</span>`).join('')}
          </div>
          <button class="at-grid-tile__btn" type="button">
            <span>VIEW CASE FILE</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      `;

      tile.addEventListener('click', () => {
        this.openCaseStudy(proj);
      });

      gridContainer.appendChild(tile);
    });
  }

  public toggleViewMode(): void {
    const viewLabel = this.wrapper.querySelector('#atViewLabel');
    const viewIcon = this.wrapper.querySelector('#atViewIcon');
    const bottomControls = this.wrapper.querySelector('#atBottomControls') as HTMLElement;

    if (this.viewMode === 'stream') {
      this.viewMode = 'grid';
      this.wrapper.classList.remove('at-showcase--stream');
      this.wrapper.classList.add('at-showcase--grid');
      this.streamViewport.style.display = 'none';
      this.gridViewport.style.display = 'block';
      if (bottomControls) bottomControls.style.display = 'none';
      if (viewLabel) viewLabel.textContent = '3D STREAM';
      if (viewIcon) viewIcon.textContent = '⟁';
      this.playTone(720, 'triangle', 0.07, 0.08);
    } else {
      this.viewMode = 'stream';
      this.wrapper.classList.remove('at-showcase--grid');
      this.wrapper.classList.add('at-showcase--stream');
      this.streamViewport.style.display = 'block';
      this.gridViewport.style.display = 'none';
      if (bottomControls) bottomControls.style.display = 'flex';
      if (viewLabel) viewLabel.textContent = 'ARCHIVE GRID';
      if (viewIcon) viewIcon.textContent = '⊞';
      this.playTone(540, 'sine', 0.07, 0.08);
    }
  }

  /* --------------------------------------------------------------------------
     Canvas WebGL Fluid Ribbon & Particles
     -------------------------------------------------------------------------- */
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

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }
  }

  private initParticles(): void {
    this.particles = [];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * w * 1.6,
        y: (Math.random() - 0.5) * h * 1.6,
        z: Math.random() * 1000 + 40,
        size: Math.random() * 2 + 1,
        speedZ: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.7 + 0.2
      });
    }
  }

  /* --------------------------------------------------------------------------
     Interactive Event Binding
     -------------------------------------------------------------------------- */
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

    // Pointer down on viewport
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a, .at-drawer, .at-scrub-rail, .at-ctrl-pill')) return;

      this.isDragging = true;
      this.hasDragged = false;
      this.startClientX = e.clientX;
      this.startClientY = e.clientY;
      this.lastClientX = e.clientX;
      this.startScrollPos = this.targetScrollPos;
      this.lastDragTime = performance.now();
      this.dragVelocity = 0;

      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    };

    // Pointer move: updates mouse parallax & drag scroll
    const onPointerMove = (e: PointerEvent) => {
      const rect = this.wrapper.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      this.targetMouseX = nx * 2;
      this.targetMouseY = ny * 2;

      // Add point to Active Theory Fluid Ribbon Trail
      const activeProj = this.projects[this.getActiveIndex()];
      const accentColor = activeProj ? activeProj.color : '#00d2ff';
      const now = performance.now();
      const vx = e.clientX - this.lastClientX;
      
      this.mouseTrail.push({
        x: e.clientX,
        y: e.clientY,
        time: now,
        vx,
        vy: 0,
        color: accentColor
      });

      if (!this.isDragging) return;

      const deltaX = e.clientX - this.startClientX;
      const deltaY = e.clientY - this.startClientY;

      if (!this.hasDragged && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
        this.hasDragged = true;
      }

      // Dragging left pulls next projects into focus
      const cardSpacing = Math.min(window.innerWidth * 0.6, 750);
      const scrollDelta = -deltaX / cardSpacing;
      this.targetScrollPos = this.startScrollPos + scrollDelta;

      // Track drag velocity
      const dt = Math.max(1, now - this.lastDragTime);
      const moveDelta = e.clientX - this.lastClientX;
      this.dragVelocity = (-moveDelta / cardSpacing) * 16.67;
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

      if (Math.abs(this.dragVelocity) > 0.05) {
        this.targetScrollPos += this.dragVelocity * 4.5;
      }
      this.targetScrollPos = Math.round(this.targetScrollPos);
    };

    add(this.wrapper, 'pointerdown', onPointerDown as EventListener);
    add(window, 'pointermove', onPointerMove as EventListener);
    add(window, 'pointerup', onPointerUp as EventListener);
    add(window, 'pointercancel', onPointerUp as EventListener);

    // Mouse wheel (horizontal/vertical)
    const onWheel = (e: WheelEvent) => {
      if (this.viewMode === 'grid') return; // Natural scroll in grid
      if (this.activeDrawerProject) return;

      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const sensitivity = 0.0016;
      this.targetScrollPos += delta * sensitivity;
    };
    add(this.wrapper, 'wheel', onWheel as EventListener, { passive: false });

    // Directional Prev/Next buttons
    const prevBtn = this.wrapper.querySelector('#atPrevBtn');
    const nextBtn = this.wrapper.querySelector('#atNextBtn');

    if (prevBtn) {
      add(prevBtn, 'click', () => {
        this.snapToIndex(this.getActiveIndex() - 1);
        this.playTone(460, 'sine', 0.04, 0.08);
      });
    }

    if (nextBtn) {
      add(nextBtn, 'click', () => {
        this.snapToIndex(this.getActiveIndex() + 1);
        this.playTone(520, 'sine', 0.04, 0.08);
      });
    }

    // Keyboard navigation (ArrowLeft / ArrowRight / ESC)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (this.activeDrawerProject) {
          this.closeCaseStudy();
        }
        return;
      }
      if (this.activeDrawerProject || this.viewMode === 'grid') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.snapToIndex(this.getActiveIndex() + 1);
        this.playTone(520, 'sine', 0.04, 0.08);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.snapToIndex(this.getActiveIndex() - 1);
        this.playTone(460, 'sine', 0.04, 0.08);
      }
    };
    add(window, 'keydown', onKeyDown as EventListener);

    // Scrubber rail click & drag
    const scrubRail = this.wrapper.querySelector('#atScrubRail');
    if (scrubRail) {
      const handleScrub = (evt: MouseEvent) => {
        const rect = scrubRail.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (evt.clientX - rect.left) / rect.width));
        const targetIdx = Math.round(progress * (this.numItems - 1));
        this.snapToIndex(targetIdx);
        this.playTone(600, 'sine', 0.05, 0.08);
      };
      add(scrubRail, 'click', handleScrub as EventListener);
    }

    // Window resize
    const onResize = () => {
      this.resizeCanvas();
    };
    add(window, 'resize', onResize as EventListener);
  }

  /* --------------------------------------------------------------------------
     Navigation & Snap Logic
     -------------------------------------------------------------------------- */
  public getActiveIndex(): number {
    const raw = Math.round(this.scrollPos);
    return ((raw % this.numItems) + this.numItems) % this.numItems;
  }

  public snapToIndex(idx: number): void {
    const active = this.getActiveIndex();
    let diff = idx - active;

    // Shortest wrap around the circle
    if (diff > this.numItems / 2) diff -= this.numItems;
    if (diff < -this.numItems / 2) diff += this.numItems;

    this.targetScrollPos = Math.round(this.scrollPos) + diff;
  }

  /* --------------------------------------------------------------------------
     In-Situ Case Study Slide-over Drawer
     -------------------------------------------------------------------------- */
  public openCaseStudy(proj: ShowcaseProject): void {
    this.activeDrawerProject = proj;
    this.playTone(740, 'triangle', 0.08, 0.1);

    const panel = this.wrapper.querySelector('#atDrawerPanel');
    if (!panel) return;

    panel.innerHTML = `
      <!-- Top Cyber File Bar -->
      <div class="at-drawer__bar">
        <div class="at-drawer__status-pill">
          <span class="at-hud-dot"></span>
          <span>OCIMOH // CASE FILE // ${proj.year}</span>
        </div>
        <button class="at-drawer__close-btn" id="atDrawerClose" type="button" aria-label="Close Case Study">
          <span>CLOSE [ESC]</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Drawer Content Scroll -->
      <div class="at-drawer__scroll">
        <!-- Hero Device Preview Frame -->
        <div class="at-drawer__hero">
          <div class="at-drawer__screen-frame" style="border-color: ${proj.color}88;">
            <img src="${proj.previewImageUrl}" alt="${proj.title}" class="at-drawer__hero-img" />
            <div class="at-drawer__hero-badge" style="background: ${proj.color}; color: #050608;">
              ${proj.isLive ? '● LIVE PRODUCTION' : 'GITHUB REPOSITORY'}
            </div>
          </div>
        </div>

        <!-- Primary Action CTA Row (Launch Live & View GitHub) -->
        <div class="at-drawer__actions">
          ${proj.isLive ? `
            <a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="at-action-btn at-action-btn--primary" style="background: ${proj.color}; color: #050608;">
              <span>LAUNCH LIVE WEBSITE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </a>
          ` : ''}
          <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="at-action-btn at-action-btn--secondary">
            <span>VIEW SOURCE ON GITHUB</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          </a>
        </div>

        <!-- Project Title & Metadata Grid -->
        <div class="at-drawer__meta-grid">
          <div class="at-drawer__meta-item">
            <span class="at-drawer__label">CLIENT // ENTITY</span>
            <div class="at-drawer__val">${proj.client}</div>
          </div>
          <div class="at-drawer__meta-item">
            <span class="at-drawer__label">TIMELINE</span>
            <div class="at-drawer__val">${proj.year}</div>
          </div>
          <div class="at-drawer__meta-item">
            <span class="at-drawer__label">SECTOR</span>
            <div class="at-drawer__val">${proj.category}</div>
          </div>
          <div class="at-drawer__meta-item">
            <span class="at-drawer__label">BENCHMARK</span>
            <div class="at-drawer__val" style="color: ${proj.color}; font-weight: 700;">${proj.metrics}</div>
          </div>
        </div>

        <h1 class="at-drawer__title">${proj.title}</h1>
        <p class="at-drawer__desc">${proj.description}</p>

        <!-- Engineering Highlights Checklist -->
        <div class="at-drawer__highlights">
          <h4 class="at-drawer__section-title">ENGINEERING & ARCHITECTURE HIGHLIGHTS</h4>
          <ul class="at-drawer__list">
            ${proj.highlights.map(h => `<li><span class="at-check" style="color:${proj.color};">✦</span> <span>${h}</span></li>`).join('')}
          </ul>
        </div>

        <!-- Full Technical Architecture Tags -->
        <div class="at-drawer__tech-section">
          <h4 class="at-drawer__section-title">TECHNICAL STACK SPECIFICATION</h4>
          <div class="at-drawer__tags">
            ${proj.techStack.map(t => `<span class="at-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    const closeBtn = panel.querySelector('#atDrawerClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCaseStudy());
    }

    const backdrop = this.wrapper.querySelector('#atDrawerBackdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeCaseStudy());
    }

    this.drawerElement.classList.add('is-open');
    this.drawerElement.setAttribute('aria-hidden', 'false');

    if (this.onSelectProject) {
      this.onSelectProject(proj);
    }
  }

  public closeCaseStudy(): void {
    if (!this.drawerElement) return;
    this.drawerElement.classList.remove('is-open');
    this.drawerElement.setAttribute('aria-hidden', 'true');
    this.activeDrawerProject = null;
    this.playTone(380, 'sine', 0.04, 0.06);
  }

  /* --------------------------------------------------------------------------
     Master Render Loop (60 FPS)
     -------------------------------------------------------------------------- */
  private loop(): void {
    if (!this.isRunning) return;

    // Dampen mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    // Dampen scroll physics with spring resistance
    if (!this.isDragging) {
      const diff = this.targetScrollPos - this.scrollPos;
      this.velocity = diff * 0.11;
      this.scrollPos += this.velocity;
    } else {
      this.scrollPos += (this.targetScrollPos - this.scrollPos) * 0.25;
    }

    // Check if active project changed to trigger sound tick
    const currentActive = this.getActiveIndex();
    if (currentActive !== this.lastActiveIndex) {
      this.lastActiveIndex = currentActive;
      this.playTone(currentActive % 2 === 0 ? 540 : 620, 'sine', 0.035, 0.05);
    }

    // Render Canvas (Fluid Ribbon + Particles + Depth Corridor)
    this.renderCanvas();

    // Render 3D Stream Cards if in stream mode
    if (this.viewMode === 'stream') {
      this.renderStream();
    }

    // Render Telemetry HUD
    this.renderHUD();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /* --------------------------------------------------------------------------
     Canvas WebGL Fluid Ribbon & Grid Shader Rendering
     -------------------------------------------------------------------------- */
  private renderCanvas(): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    const cx = w * 0.5;
    const cy = h * 0.5;

    ctx.clearRect(0, 0, w, h);

    // 1. Perspective Depth Lines (Active Theory Horizon Grid)
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.05)';

    const vanishingX = cx + (this.mouseX * 35);
    const vanishingY = cy + (this.mouseY * 20);

    // Horizontal grid lines converging
    for (let d = 1; d <= 6; d++) {
      const progress = d / 6;
      const boxW = w * Math.pow(progress, 1.6);
      const boxH = h * Math.pow(progress, 1.6);
      ctx.strokeRect(cx - boxW * 0.5, cy - boxH * 0.5, boxW, boxH);
    }

    // Radiating rays
    const rays = 14;
    for (let r = 0; r <= rays; r++) {
      const rx = (r / rays) * w;
      ctx.beginPath();
      ctx.moveTo(vanishingX, vanishingY);
      ctx.lineTo(rx, h);
      ctx.stroke();
    }
    ctx.restore();

    // 2. 3D Floating Cyber Constellation Particles
    const speedFactor = 1 + Math.abs(this.velocity) * 1.5;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.z -= p.speedZ * speedFactor;
      p.x -= this.velocity * 40;

      if (p.z <= 10) {
        p.z = 1000;
        p.x = (Math.random() - 0.5) * w * 1.6;
        p.y = (Math.random() - 0.5) * h * 1.6;
      }
      if (p.x > w * 0.8) p.x = -w * 0.8;
      if (p.x < -w * 0.8) p.x = w * 0.8;

      const fov = 350;
      const scale = fov / (fov + p.z);
      const px = cx + (p.x + this.mouseX * 40) * scale;
      const py = cy + (p.y + this.mouseY * 40) * scale;
      const radius = Math.max(0.6, p.size * scale * 1.4);
      const alpha = Math.max(0.05, Math.min(0.85, (1 - p.z / 1000) * p.alpha));

      ctx.fillStyle = `rgba(160, 230, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Active Theory Fluid Ribbon Trail
    const now = performance.now();
    this.mouseTrail = this.mouseTrail.filter(pt => now - pt.time < 500);

    if (this.mouseTrail.length > 2) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (let i = 1; i < this.mouseTrail.length; i++) {
        const pt1 = this.mouseTrail[i - 1];
        const pt2 = this.mouseTrail[i];
        const age = (now - pt2.time) / 500; // 0 to 1
        const alpha = (1 - age) * 0.6;
        const width = (1 - age) * 16 + 2;

        ctx.strokeStyle = pt2.color || '#00d2ff';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /* --------------------------------------------------------------------------
     3D Panoramic Horizontal Cinema Stream Rendering
     -------------------------------------------------------------------------- */
  private renderStream(): void {
    const stageWidth = window.innerWidth;
    const cardSpacing = Math.min(stageWidth * 0.62, 780);

    const mousePitchX = -this.mouseY * 8;
    const mouseYawY = this.mouseX * 12;

    for (let i = 0; i < this.numItems; i++) {
      const card = this.cardElements[i];
      if (!card) continue;

      let diff = i - this.scrollPos;

      // Wrap diff for continuous seamless loop
      while (diff > this.numItems / 2) diff -= this.numItems;
      while (diff < -this.numItems / 2) diff += this.numItems;

      const absDiff = Math.abs(diff);

      // 3D Spatial Position:
      // Active card is centered. Flanking cards recede horizontally and in Z-depth.
      const x = diff * cardSpacing + (this.mouseX * 30);
      const z = -Math.pow(absDiff, 1.18) * 220 - Math.abs(this.velocity) * 45;
      const rotY = -diff * 15 + mouseYawY;
      const rotX = mousePitchX;
      const scale = Math.max(0.68, 1 - absDiff * 0.12);
      const opacity = Math.max(0.12, 1 - absDiff * 0.38);
      const blur = Math.min(8, absDiff * 2.8);

      card.style.transform = `translate3d(${x}px, -50%, ${z}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;
      card.style.opacity = String(opacity);
      card.style.filter = blur > 0.4 ? `blur(${blur}px)` : 'none';
      card.style.zIndex = String(100 - Math.round(absDiff * 10));

      // Active card emphasis
      if (absDiff < 0.5) {
        card.classList.add('is-active-front');
        card.style.pointerEvents = 'auto';
      } else {
        card.classList.remove('is-active-front');
        card.style.pointerEvents = absDiff < 1.8 ? 'auto' : 'none';
      }
    }
  }

  /* --------------------------------------------------------------------------
     HUD Telemetry Rendering
     -------------------------------------------------------------------------- */
  private renderHUD(): void {
    const activeIdx = this.getActiveIndex();
    const activeProj = this.projects[activeIdx];

    // Project counter
    if (this.hudCounter) {
      this.hudCounter.textContent = `${String(activeIdx + 1).padStart(2, '0')} / ${String(this.numItems).padStart(2, '0')}`;
    }

    // Active project title & client in bottom HUD
    if (this.activeTitleDisplay && activeProj) {
      if (this.activeTitleDisplay.textContent !== activeProj.title) {
        this.activeTitleDisplay.textContent = activeProj.title;
      }
    }
    if (this.activeClientDisplay && activeProj) {
      const clientStr = `${activeProj.client} // ${activeProj.category}`;
      if (this.activeClientDisplay.textContent !== clientStr) {
        this.activeClientDisplay.textContent = clientStr;
      }
    }

    // Scrubber thumb position
    if (this.progressBar) {
      const normPos = ((this.scrollPos % this.numItems) + this.numItems) % this.numItems;
      const progressPct = (normPos / (this.numItems - 1)) * 100;
      this.progressBar.style.left = `${Math.max(0, Math.min(100, progressPct))}%`;
    }

    // Update scrubber dot active classes
    const scrubDots = this.wrapper.querySelectorAll('.at-scrub-dot');
    scrubDots.forEach((dot, idx) => {
      if (idx === activeIdx) {
        dot.classList.add('is-active');
      } else {
        dot.classList.remove('is-active');
      }
    });

    // Real-time telemetry coords
    if (this.hudCoords) {
      const fps = '60.0';
      const posStr = this.scrollPos.toFixed(2);
      this.hudCoords.textContent = `${fps} FPS // POS: ${posStr} // MATRIX: 3D SPATIAL TUNNEL`;
    }
  }

  /* --------------------------------------------------------------------------
     Teardown & Cleanup
     -------------------------------------------------------------------------- */
  public destroy(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);

    this.boundEvents.forEach(({ target, type, handler, options }) => {
      target.removeEventListener(type, handler, options);
    });
    this.boundEvents = [];

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {
        // Safe ignore
      }
      this.audioCtx = null;
    }

    if (this.wrapper && this.wrapper.parentElement) {
      this.wrapper.parentElement.removeChild(this.wrapper);
    }
  }
}
