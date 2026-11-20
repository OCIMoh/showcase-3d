/**
 * CylinderCarouselEngine — Modular WebGL1/WebGL2 Curved Cylindrical Carousel Engine
 */

import gsap from 'gsap';
import { Mat4, mat4Create, mat4Identity, mat4Perspective, mat4Translate, mat4RotateX, mat4RotateY } from './math/mat4';
import { damp } from './core/damped';
import { generateSubdividedPlane } from './gl/geometry';
import { createCarouselProgram, createGalleryProgram, CarouselProgramInfo, GalleryProgramInfo } from './gl/program';
import { TextureManager } from './gl/textures';
import { CylinderConfig, BrandConfig, DEFAULT_CONFIG, DEFAULT_BRAND } from './core/config';
import { InputController } from './input/inputController';
import { ArcHudComponent } from './ui/arcHud';
import { OverlayComponent } from './ui/overlay';
import { SoundSynthesizer } from './audio/synth';
import { CarouselPass } from './renderer/carouselPass';
import { GalleryPass } from './renderer/galleryPass';
import { ShowcaseProject, SHOWCASE_PROJECTS } from '../../data/showcaseProjects';
import { SpatialWaypoint, WAYPOINT_CONFIGS } from './core/spatialState';

export interface CylinderCarouselOptions {
  container: HTMLElement;
  projects?: ShowcaseProject[];
  initialSlug?: string;
  onNavigate?: (path: string) => void;
  brand?: Partial<BrandConfig>;
  config?: Partial<CylinderConfig>;
}

export type MathiasCylinderOptions = CylinderCarouselOptions;

export class CylinderCarouselEngine {
  public heroOpenAmount = 0.0;

  private container: HTMLElement;
  private wrapper: HTMLElement;
  private canvas: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;
  private carouselProgramInfo!: CarouselProgramInfo;
  private galleryProgramInfo!: GalleryProgramInfo;

  private vertexBuffer!: WebGLBuffer;
  private uvBuffer!: WebGLBuffer;
  private indexBuffer!: WebGLBuffer;
  private numIndices = 0;

  private projects: ShowcaseProject[];
  private onNavigate?: (path: string) => void;
  public config: CylinderConfig;
  public brand: BrandConfig;

  private textureManager!: TextureManager;
  private inputController!: InputController;
  private arcHud!: ArcHudComponent;
  private overlay!: OverlayComponent;
  private synth!: SoundSynthesizer;
  private carouselPass!: CarouselPass;
  private galleryPass!: GalleryPass;
  private responsiveScale = 1.0;
  private lastCenterIdx = -1;

  private pos = 0;
  private targetPos = 0;
  private velocity = 0;
  private lastTickTime = performance.now();

  private tiltTargetX = 0;
  private tiltTargetY = 0;
  private tiltCurrentX = 0;
  private tiltCurrentY = 0;
  private lightTargetX = 0;
  private lightTargetY = 0;
  private lightCurrentX = 0;
  private lightCurrentY = 0;

  private edgeProgress = 0.0;
  private pullAmount = 0.0;
  private clickPos: [number, number] = [0, 0];
  private activeHeroIndex = -1;
  private activeProject: ShowcaseProject | null = null;

  private galleryPos = 0;
  private galleryTargetPos = 0;
  private galleryVelocity = 0;
  private galleryCurve = 0;
  private galleryScrollCurve = 0;
  private galleryEntrance = 1.0;
  private galleryOffsetX = 0;
  private lastGalleryCardIdx?: number;

  private projMat: Mat4 = mat4Create();
  private viewMat: Mat4 = mat4Create();

  private isRunning = true;
  private isContextLost = false;
  private rafId: number | null = null;
  private prefersReducedMotion = false;
  private onResize = () => this.resize();

  // Spatial Routing Waypoint & Scene Blurring State
  private currentWaypoint: SpatialWaypoint = 'STAGE';
  private camOffsetX = 0.0;
  private camOffsetY = 0.0;
  private camOffsetZ = 0.0;
  private tiltOffsetAngleX = 0.0;
  private tiltOffsetAngleY = 0.0;
  private blurAmountPx = 0.0;
  private brightness = 1.0;

  constructor(options: CylinderCarouselOptions) {
    this.container = options.container;
    this.projects = options.projects && options.projects.length > 0 ? options.projects : SHOWCASE_PROJECTS;
    this.onNavigate = options.onNavigate;
    this.config = { ...DEFAULT_CONFIG, ...(options.config || {}) };
    this.brand = { ...DEFAULT_BRAND, ...(options.brand || {}) };

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ma-cylinder-root is-fixed';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ma-cylinder-canvas';
    this.canvas.id = 'maGlCanvas';
    this.wrapper.appendChild(this.canvas);
    this.container.appendChild(this.wrapper);

    this.initWebGL();
    this.initModules();
    this.resize();

    this.prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.arcHud.animateEntrance(this.prefersReducedMotion);

    if (options.initialSlug) {
      const found = this.projects.find(p => p.slug === options.initialSlug);
      if (found) this.openProject(found, window.innerWidth / 2, window.innerHeight / 2);
    }

    this.tick = this.tick.bind(this);
    this.lastTickTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private initWebGL(): void {
    const gl = (this.canvas.getContext('webgl', { antialias: true, alpha: false }) ||
      this.canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
    if (!gl) throw new Error('WebGL is not supported in this browser environment.');
    this.gl = gl;
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.buildGLResources();

    this.canvas.addEventListener('webglcontextlost', (e: Event) => {
      e.preventDefault();
      this.isContextLost = true;
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    });
    this.canvas.addEventListener('webglcontextrestored', () => {
      this.isContextLost = false;
      this.buildGLResources();
      this.tick();
    });
  }

  private buildGLResources(): void {
    const gl = this.gl;
    this.carouselProgramInfo = createCarouselProgram(gl);
    this.galleryProgramInfo = createGalleryProgram(gl);

    const geo = generateSubdividedPlane(this.config.cardWidth, this.config.cardHeight, 32, 32);
    this.numIndices = geo.indices.length;

    this.vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geo.vertices, gl.STATIC_DRAW);

    this.uvBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geo.uvs, gl.STATIC_DRAW);

    this.indexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);

    // Bind vertex buffers and set up attributes for both decoupled programs
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(this.carouselProgramInfo.attribs.aPosition);
    gl.vertexAttribPointer(this.carouselProgramInfo.attribs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.galleryProgramInfo.attribs.aPosition);
    gl.vertexAttribPointer(this.galleryProgramInfo.attribs.aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    gl.enableVertexAttribArray(this.carouselProgramInfo.attribs.aUv);
    gl.vertexAttribPointer(this.carouselProgramInfo.attribs.aUv, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.galleryProgramInfo.attribs.aUv);
    gl.vertexAttribPointer(this.galleryProgramInfo.attribs.aUv, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  private initModules(): void {
    this.synth = new SoundSynthesizer();
    this.textureManager = new TextureManager(this.gl);
    this.textureManager.initPreviewTextures(this.projects);

    this.carouselPass = new CarouselPass(this.gl, this.carouselProgramInfo, this.config, this.textureManager);
    this.galleryPass = new GalleryPass(this.gl, this.galleryProgramInfo, this.config, this.textureManager);

    const projectTitles = this.projects.map(p => p.title.split('—')[0].trim());
    this.arcHud = new ArcHudComponent(this.wrapper, projectTitles, {
      onSelectProject: () => {
        if (this.heroOpenAmount < 0.2) {
          const centerProj = this.projects[this.lastCenterIdx] || this.projects[0];
          if (centerProj) {
            const bounds = this.arcHud.getBounds();
            this.openProject(centerProj, bounds.left + bounds.width / 2, bounds.top);
          }
        }
      },
      onDragDelta: (deltaProgress) => {
        if (this.heroOpenAmount < 0.2) {
          const spacing = this.config.spacing * this.responsiveScale;
          this.targetPos += deltaProgress * spacing;
        }
      },
      onFling: (vy) => {
        if (this.heroOpenAmount < 0.2) {
          const spacing = this.config.spacing * this.responsiveScale;
          this.targetPos += vy * spacing * 0.35;
          this.snapToNearestCard();
        }
      },
      onScrubProgress: (t) => {
        if (this.heroOpenAmount < 0.2) {
          const numItems = this.projects.length;
          const spacing = this.config.spacing * this.responsiveScale;
          const targetIndex = t * (numItems - 1);
          this.targetPos = -targetIndex * spacing;
          this.snapToNearestCard();
        }
      }
    });

    this.overlay = new OverlayComponent(this.wrapper, this.brand, this.projects, {
      onCloseCaseStudy: () => this.closeProject(),
      onNextProject: () => this.navigateNextProject(),
      onPrevProject: () => this.navigatePrevProject(),
      onToggleSound: () => {
        const isMuted = this.synth.toggleMute();
        this.overlay.updateSoundState(isMuted);
      }
    });

    if (this.projects.length > 0) {
      this.overlay.updateActiveCenterProject(this.projects[0]);
    }

    this.inputController = new InputController(this.canvas, this.wrapper, {
      onDragMove: (dx, dy) => {
        if (this.currentWaypoint !== 'STAGE' && this.heroOpenAmount < 0.2) return;
        if (this.heroOpenAmount > 0.5) this.galleryTargetPos += dy * 0.012 * this.responsiveScale;
        else this.targetPos += dx * 0.018 * this.responsiveScale;
      },
      onFling: (vx, vy) => {
        if (this.currentWaypoint !== 'STAGE' && this.heroOpenAmount < 0.2) return;
        if (this.heroOpenAmount < 0.2) {
          if (Math.abs(vx) > 1.2) this.targetPos += vx * 0.12 * this.responsiveScale;
          this.snapToNearestCard();
        } else if (Math.abs(vy) > 1.2) {
          this.galleryTargetPos += vy * 0.12 * this.responsiveScale;
        }
      },
      onTap: (cx, cy) => {
        if (this.currentWaypoint !== 'STAGE') return;
        if (this.heroOpenAmount < 0.2) {
          const hit = this.carouselPass.hitTest(
            cx, cy, this.projects, this.pos, this.projMat, this.viewMat, this.canvas.width, this.canvas.height, this.responsiveScale
          );
          if (hit) this.openProject(hit, cx, cy);
        }
      },
      onWheel: (dx, dy) => {
        if (this.currentWaypoint !== 'STAGE' && this.heroOpenAmount < 0.2) return;
        if (this.heroOpenAmount > 0.5) {
          this.galleryTargetPos -= dy * 0.0055;
        } else {
          const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
          this.targetPos -= d * 0.0085;
        }
      },
      onWheelEnd: () => {
        if (this.currentWaypoint === 'STAGE' && this.heroOpenAmount < 0.2) this.snapToNearestCard();
      },
      onPointerParallax: (nx, ny) => {
        this.tiltTargetX = nx * 0.08;
        this.tiltTargetY = ny * 0.06;
        this.lightTargetX = nx * 3.5;
        this.lightTargetY = ny * 2.5;
      },
      onArrowKey: (key) => {
        if (this.heroOpenAmount > 0.5) {
          if (key === 'ArrowDown') this.galleryTargetPos -= 0.6;
          if (key === 'ArrowUp') this.galleryTargetPos += 0.6;
          if (key === 'ArrowRight') this.navigateNextProject();
          if (key === 'ArrowLeft') this.navigatePrevProject();
        } else {
          if (key === 'ArrowRight') this.targetPos -= this.config.spacing;
          if (key === 'ArrowLeft') this.targetPos += this.config.spacing;
          this.snapToNearestCard();
        }
      },
      onEscape: () => {
        if (this.heroOpenAmount > 0.5) this.closeProject();
      },
      isCaseStudyOpen: () => this.heroOpenAmount > 0.5
    });

    window.addEventListener('resize', this.onResize);
  }

  private tick(): void {
    if (!this.isRunning || this.isContextLost) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTickTime) / 1000, 0.05);
    this.lastTickTime = now;

    if (dt <= 0) {
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    const gl = this.gl;
    const cfg = this.config;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    const bgR = 0.031 + (0.961 - 0.031) * this.heroOpenAmount;
    const bgG = 0.031 + (0.953 - 0.031) * this.heroOpenAmount;
    const bgB = 0.031 + (0.925 - 0.031) * this.heroOpenAmount;
    gl.clearColor(bgR, bgG, bgB, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const prevPos = this.pos;
    this.pos = damp(this.pos, this.targetPos, cfg.dampMotion, dt);
    if (Math.abs(this.targetPos - this.pos) < 0.0001) {
      this.pos = this.targetPos;
    }
    this.velocity = (this.pos - prevPos) * (1.0 / (dt * 60.0));
    if (Math.abs(this.velocity) < 0.0001) {
      this.velocity = 0;
    }

    const tiltTargetXNow = this.heroOpenAmount > 0.5 ? 0 : this.tiltTargetX;
    const tiltTargetYNow = this.heroOpenAmount > 0.5 ? 0 : this.tiltTargetY;
    this.tiltCurrentX = damp(this.tiltCurrentX, tiltTargetXNow, cfg.dampTilt, dt);
    this.tiltCurrentY = damp(this.tiltCurrentY, tiltTargetYNow, cfg.dampTilt, dt);

    const lightTargetXNow = this.heroOpenAmount > 0.5 ? 0 : this.lightTargetX;
    const lightTargetYNow = this.heroOpenAmount > 0.5 ? 0 : this.lightTargetY;
    this.lightCurrentX = damp(this.lightCurrentX, lightTargetXNow, cfg.dampLight, dt);
    this.lightCurrentY = damp(this.lightCurrentY, lightTargetYNow, cfg.dampLight, dt);

    this.edgeProgress = damp(this.edgeProgress, this.heroOpenAmount, cfg.dampPull, dt);
    this.pullAmount = (this.heroOpenAmount - this.edgeProgress) * cfg.pullDistance;

    if (this.heroOpenAmount > 0.05) {
      const prevGalPos = this.galleryPos;
      this.galleryPos = damp(this.galleryPos, this.galleryTargetPos, cfg.dampGallery, dt);
      if (Math.abs(this.galleryTargetPos - this.galleryPos) < 0.0001) {
        this.galleryPos = this.galleryTargetPos;
      }
      this.galleryVelocity = (this.galleryPos - prevGalPos) * (1.0 / (dt * 60.0));
      if (Math.abs(this.galleryVelocity) < 0.0001) {
        this.galleryVelocity = 0;
      }

      // The Barrel Gallery: "Flat at rest, a barrel when you scroll fast"
      // Power-law velocity mapping gives responsive, unmistakable curvature even on gentle scrolling
      const normVel = Math.min(1.0, Math.abs(this.galleryVelocity) * 6.5);
      const targetScrollCurve = this.prefersReducedMotion
        ? 0.0
        : Math.pow(normVel, 0.65) * 1.35;

      // Smoothly damp the scroll curve with continuous spring inertia (holds curve through stroke, relaxes gracefully)
      this.galleryScrollCurve = damp(this.galleryScrollCurve, targetScrollCurve, 3.2, dt);
      if (this.galleryScrollCurve < 0.0005 && targetScrollCurve === 0) {
        this.galleryScrollCurve = 0;
      }

      // Entrance second curve: arrives fully curved (1.0) and relaxes into place (0.0)
      const entranceCurve = this.prefersReducedMotion ? 0.0 : (1.0 - this.galleryEntrance);

      // Combined curvature passed to the horizontal cylinder shader
      this.galleryCurve = Math.max(this.galleryScrollCurve, entranceCurve);
    }

    // Viewport Aspect Ratio & Responsive Scale Calculation
    const aspect = this.canvas.width / Math.max(1, this.canvas.height);

    // Smooth responsive mesh scaling: adapts cards gracefully from 1080p desktop down to mobile portrait
    let rScale = 1.0;
    if (aspect < 1.77) {
      rScale = Math.min(1.0, Math.max(0.38, 0.38 + (aspect - 0.45) * ((1.0 - 0.38) / (1.77 - 0.45))));
    }
    this.responsiveScale = rScale;

    // Arc HUD Scrubber
    const numItems = this.projects.length;
    const spacing = cfg.spacing * rScale;
    const continuousProgress = -this.pos / spacing;
    const norm = (((continuousProgress) % numItems) + numItems) % numItems;
    const centerIdx = Math.round(norm) % numItems;
    if (centerIdx !== this.lastCenterIdx) {
      this.lastCenterIdx = centerIdx;
      const centerProj = this.projects[centerIdx];
      if (centerProj) {
        this.overlay.updateActiveCenterProject(centerProj);
      }
    }

    this.arcHud.update(norm, continuousProgress, numItems, () => {
      this.synth.playDialClick(Math.abs(this.velocity));
      this.synth.triggerHaptic(10);
    });

    // Dynamic Camera Distance:
    // Gentle pull back on mobile portrait for comfortable vertical margins,
    // and gentle push forward on ultrawides (aspect > 2.0) for panoramic immersion.
    let camZ = cfg.cameraZ;
    if (aspect < 1.0) {
      camZ = cfg.cameraZ - (1.0 - aspect) * 0.8;
    } else if (aspect > 2.0) {
      camZ = Math.min(-5.8, cfg.cameraZ + (aspect - 1.77) * 0.4);
    }

    mat4Perspective(this.projMat, (cfg.fovDegrees * Math.PI) / 180, aspect, 0.1, 50.0);
    mat4Identity(this.viewMat);
    mat4Translate(this.viewMat, this.viewMat, [
      this.camOffsetX,
      this.camOffsetY,
      camZ + this.camOffsetZ
    ]);
    mat4RotateX(this.viewMat, this.viewMat, this.tiltCurrentY + this.tiltOffsetAngleX);
    mat4RotateY(this.viewMat, this.viewMat, this.tiltCurrentX + this.tiltOffsetAngleY);

    // Render Dedicated Passes with Decoupled Shaders
    this.carouselPass.render({
      projects: this.projects,
      pos: this.pos,
      velocity: this.velocity,
      heroOpenAmount: this.heroOpenAmount,
      activeHeroIndex: this.activeHeroIndex,
      pullAmount: this.pullAmount,
      clickPos: this.clickPos,
      meshAspect: cfg.cardAspect,
      reducedMotion: this.prefersReducedMotion,
      responsiveScale: rScale,
      lightPos: [this.lightCurrentX, this.lightCurrentY, 2.5],
      now
    }, this.numIndices, this.projMat, this.viewMat);

    if (this.activeProject) {
      this.galleryPass.render({
        activeProject: this.activeProject,
        galleryPos: this.galleryPos,
        galleryVelocity: this.galleryVelocity,
        galleryCurve: this.galleryCurve,
        galleryEntrance: this.galleryEntrance,
        galleryOffsetX: this.galleryOffsetX,
        heroOpenAmount: this.heroOpenAmount,
        meshAspect: cfg.cardAspect,
        reducedMotion: this.prefersReducedMotion,
        responsiveScale: rScale
      }, this.numIndices, this.projMat, this.viewMat);

      if (this.heroOpenAmount > 0.5 && this.galleryEntrance > 0.75) {
        const entranceSpacingMult = 1.0 + (1.0 - this.galleryEntrance);
        const gSpacing = cfg.gallerySpacing * rScale * entranceSpacingMult;
        const numG = this.textureManager.getGalleryTextures(this.activeProject).length || 8;
        const currentCardIdx = Math.floor((((-this.galleryPos / gSpacing) % numG) + numG) % numG);
        if (this.lastGalleryCardIdx !== undefined && this.lastGalleryCardIdx !== currentCardIdx) {
          this.synth.playTone(540 + currentCardIdx * 25, 'sine', 0.02, 0.025);
        }
        this.lastGalleryCardIdx = currentCardIdx;
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  /**
   * Opens the full 3D case study view for the requested project.
   */
  public openProject(
    proj: ShowcaseProject,
    clientX = window.innerWidth / 2,
    clientY = window.innerHeight / 2,
    direction: 'next' | 'prev' | 'none' = 'none'
  ): void {
    const projIdx = this.projects.findIndex(p => p.slug === proj.slug);
    if (projIdx === -1) return;

    this.activeHeroIndex = projIdx;
    this.activeProject = proj;

    const rect = this.canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.clickPos = [nx * 1.5, ny * 0.94];

    const loopWidth = this.projects.length * this.config.spacing;
    const desiredPos = -projIdx * this.config.spacing;
    let diff = (desiredPos - this.targetPos) % loopWidth;
    if (diff > loopWidth / 2) diff -= loopWidth;
    if (diff < -loopWidth / 2) diff += loopWidth;
    this.targetPos += diff;

    this.galleryPos = 0;
    this.galleryTargetPos = 0;
    this.galleryScrollCurve = 0;
    this.galleryOffsetX = 0;
    this.galleryEntrance = 0.0;

    this.onNavigate?.(`/projects/${proj.slug}`);
    this.overlay.updateCaseStudy(proj, direction);
    this.overlay.setCaseStudyOpen(true);
    this.arcHud.setVisible(false);

    this.synth.playTone(620, 'triangle', 0.08, 0.09);

    gsap.killTweensOf(this);
    gsap.to(this, {
      heroOpenAmount: 1.0,
      duration: this.prefersReducedMotion ? 0.3 : 1.45,
      ease: this.prefersReducedMotion ? 'power1.out' : 'expo.out'
    });

    // "The entrance uses a second curve. The gallery arrives fully curved, with doubled gaps and zero opacity, and relaxes into place."
    // "Just before the hero lands, the gallery starts coming in on top."
    gsap.to(this, {
      galleryEntrance: 1.0,
      duration: this.prefersReducedMotion ? 0.3 : 1.15,
      delay: this.prefersReducedMotion ? 0 : 0.28,
      ease: 'power2.out'
    });
  }

  /**
   * Closes the active case study view and restores the 3D oval carousel.
   */
  public closeProject(): void {
    // Dual-tone mechanical latch sound
    this.synth.playTone(420, 'sine', 0.03, 0.05);
    setTimeout(() => {
      this.synth.playTone(320, 'sine', 0.03, 0.04);
    }, 60);

    this.onNavigate?.('/');
    this.overlay.setCaseStudyOpen(false);
    this.arcHud.setVisible(true);

    gsap.killTweensOf(this);
    gsap.to(this, {
      galleryEntrance: 0.0,
      duration: this.prefersReducedMotion ? 0.2 : 0.4,
      ease: 'power2.in'
    });
    gsap.to(this, {
      heroOpenAmount: 0.0,
      duration: this.prefersReducedMotion ? 0.3 : 1.25,
      ease: this.prefersReducedMotion ? 'power1.out' : 'expo.out',
      onComplete: () => {
        this.activeHeroIndex = -1;
        this.activeProject = null;
        this.galleryOffsetX = 0;
        this.snapToNearestCard();
      }
    });
  }

  private navigateNextProject(): void {
    if (!this.activeProject) return;
    const curIdx = this.projects.findIndex(p => p.slug === this.activeProject?.slug);
    const nextIdx = (curIdx + 1) % this.projects.length;
    this.synth.playTone(680, 'sine', 0.03, 0.04);
    this.animateProjectSwitch(this.projects[nextIdx], 'next');
  }

  private navigatePrevProject(): void {
    if (!this.activeProject) return;
    const curIdx = this.projects.findIndex(p => p.slug === this.activeProject?.slug);
    const prevIdx = (curIdx - 1 + this.projects.length) % this.projects.length;
    this.synth.playTone(520, 'sine', 0.03, 0.04);
    this.animateProjectSwitch(this.projects[prevIdx], 'prev');
  }

  private animateProjectSwitch(nextProject: ShowcaseProject, direction: 'next' | 'prev' = 'next'): void {
    if (this.prefersReducedMotion) {
      this.openProject(nextProject, window.innerWidth / 2, window.innerHeight / 2, direction);
      return;
    }
    // "Previous and next swap galleries sideways. The new one slides in from a screen-width away as the old one leaves, and the hero behind them switches instantly, so there’s never a gap."
    const slideOutDist = direction === 'next' ? -8.5 : 8.5;
    const slideInDist = -slideOutDist;

    gsap.killTweensOf(this);
    gsap.to(this, {
      galleryOffsetX: slideOutDist,
      galleryEntrance: 0.0,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        this.openProject(nextProject, window.innerWidth / 2, window.innerHeight / 2, direction);
        this.galleryOffsetX = slideInDist;
        this.galleryEntrance = 0.0;
        gsap.to(this, {
          galleryOffsetX: 0,
          galleryEntrance: 1.0,
          duration: 0.65,
          ease: 'power3.out'
        });
      }
    });
  }

  private snapToNearestCard(): void {
    const spacing = this.config.spacing * this.responsiveScale;
    const rawIndex = -this.targetPos / spacing;
    const nearestIndex = Math.round(rawIndex);
    this.targetPos = -nearestIndex * spacing;
  }

  /**
   * Resizes viewport dimensions and updates device pixel ratio on high-DPI displays.
   */
  public resize(): void {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    // Cap DPR at 1.5 for ultra-high-resolution 4K/5K screens (width >= 2560) to protect 60fps fill rate
    const maxDpr = w >= 2560 ? 1.5 : 2.0;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Smoothly transitions camera and scene post-processing to a named spatial waypoint.
   */
  public setWaypoint(waypoint: SpatialWaypoint, duration = 0.85): void {
    this.currentWaypoint = waypoint;
    const cfg = WAYPOINT_CONFIGS[waypoint as keyof typeof WAYPOINT_CONFIGS];
    if (!cfg) return;

    this.arcHud.setVisible(cfg.hudVisible);

    const d = this.prefersReducedMotion ? 0.2 : duration;
    gsap.killTweensOf(this, 'camOffsetX,camOffsetY,camOffsetZ,tiltOffsetAngleX,tiltOffsetAngleY,blurAmountPx,brightness');
    gsap.to(this, {
      camOffsetX: cfg.camOffsetX,
      camOffsetY: cfg.camOffsetY,
      camOffsetZ: cfg.camOffsetZ,
      tiltOffsetAngleX: cfg.tiltAngleX,
      tiltOffsetAngleY: cfg.tiltAngleY,
      blurAmountPx: cfg.blurAmountPx,
      brightness: cfg.brightness,
      duration: d,
      ease: 'power3.out',
      onUpdate: () => {
        if (this.canvas) {
          if (this.blurAmountPx > 0.1 || this.brightness < 0.98) {
            this.canvas.style.filter = `blur(${this.blurAmountPx.toFixed(1)}px) brightness(${this.brightness.toFixed(2)})`;
          } else {
            this.canvas.style.filter = 'none';
          }
        }
      }
    });
  }

  /**
   * Opens a project by its slug identifier. Returns true if project found and opened.
   */
  public openProjectBySlug(slug: string): boolean {
    const found = this.projects.find(p => p.slug === slug);
    if (found) {
      this.openProject(found, window.innerWidth / 2, window.innerHeight / 2);
      return true;
    }
    return false;
  }

  public getCurrentWaypoint(): SpatialWaypoint {
    return this.currentWaypoint;
  }

  public getProjects(): ShowcaseProject[] {
    return this.projects;
  }

  public getActiveProject(): ShowcaseProject | null {
    return this.activeProject;
  }

  public getOverlay(): OverlayComponent {
    return this.overlay;
  }

  public getSoundSynthesizer(): SoundSynthesizer {
    return this.synth;
  }

  /**
   * Preloads textures and typography assets for the Animax Loader.
   */
  public preloadAssets(
    onProgress?: (loaded: number, total: number, name: string) => void
  ): Promise<void> {
    return this.textureManager.preloadAllAssets(onProgress);
  }

  /**
   * Cleans up all DOM nodes, WebGL resources, listeners, and audio contexts.
   */
  public destroy(): void {
    this.isRunning = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    window.removeEventListener('resize', this.onResize);
    this.inputController.destroy();
    this.textureManager.destroy();
    this.synth.destroy();
    this.arcHud.destroy();
    this.overlay.destroy();

    const gl = this.gl;
    if (gl) {
      if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
      if (this.uvBuffer) gl.deleteBuffer(this.uvBuffer);
      if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
      if (this.carouselProgramInfo?.program) gl.deleteProgram(this.carouselProgramInfo.program);
      if (this.galleryProgramInfo?.program) gl.deleteProgram(this.galleryProgramInfo.program);
    }

    this.wrapper.remove();
  }
}

export { CylinderCarouselEngine as MathiasCylinderEngine };
