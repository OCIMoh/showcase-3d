/**
 * Mathias Adolfsson '26 Portfolio Engine
 * Exact 1:1 Architectural Implementation from Codrops Feature
 *
 * Core Systems:
 * 1. Single Continuous WebGL Canvas — html and body fixed, zero document scroll.
 * 2. 180° Semi-Oval Arc Carousel with 32-segment dynamic shader bending (uWrapAmount).
 * 3. Velocity-driven Chromatic Aberration RGB split shader.
 * 4. In-Situ Click-to-Open Hero Transition:
 *    - The clicked mesh unbends from arc to flat plane (uWrapAmount -> 0.0).
 *    - Tactile elastic click-point bulge (PULL_EDGE_LERP / pullDiff * PULL_DISTANCE).
 *    - Centers carousel slot in background and scales to fill viewport.
 * 5. 3D Vertical Barrel Gallery inside Case Study:
 *    - Endless vertical column bending around horizontal cylinder based on scroll speed.
 * 6. Single Rhythm Motion RAF loop: MOTION_LERP drives carousel, tilt, light, and gallery.
 * 7. Bottom Arc HUD indicator matching Mikuta reference with GSAP arc preloader intro.
 */

import gsap from 'gsap';
import { ShowcaseProject, SHOWCASE_PROJECTS } from '../data/showcaseProjects';

export interface MathiasCylinderOptions {
  container: HTMLElement;
  projects?: ShowcaseProject[];
  initialSlug?: string;
  onNavigate?: (path: string) => void;
}

interface BoundListener {
  target: EventTarget;
  type: string;
  handler: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

// ---------------------------------------------------------------------------
// Native 4x4 Matrix Mathematics (Column-major Float32Array)
// ---------------------------------------------------------------------------
type Mat4 = Float32Array;

function mat4Create(): Mat4 {
  const out = new Float32Array(16);
  out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
  return out;
}

function mat4Identity(out: Mat4): Mat4 {
  out.fill(0);
  out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
  return out;
}

function mat4Perspective(out: Mat4, fovyRad: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fovyRad / 2);
  const nf = 1 / (near - far);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

function mat4Translate(out: Mat4, a: Mat4, v: [number, number, number]): Mat4 {
  const x = v[0], y = v[1], z = v[2];
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    for (let i = 0; i < 12; i++) out[i] = a[i];
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  }
  return out;
}

function mat4RotateX(out: Mat4, a: Mat4, rad: number): Mat4 {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  if (a !== out) {
    out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}

function mat4RotateY(out: Mat4, a: Mat4, rad: number): Mat4 {
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  if (a !== out) {
    out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
    out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}

function mat4Scale(out: Mat4, a: Mat4, v: [number, number, number]): Mat4 {
  const x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}

// ---------------------------------------------------------------------------
// GLSL Shaders — Dynamic Bending, Chromatic Aberration, Click Bulge
// ---------------------------------------------------------------------------
const VERTEX_SHADER_SRC = `
attribute vec3 aPosition;
attribute vec2 aUv;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

// Carousel arc wrap parameters
uniform float uPanelRadius;
uniform float uPanelOvalRatio;
uniform float uWrapAmount;      // 1.0 = bent onto carousel, 0.0 = flat plane

// Click bulge parameters
uniform vec2 uClickPos;          // Local XY coordinates of click
uniform float uPullAmount;       // Elastic pull amount from chaser difference

// Barrel Gallery parameters (Case study vertical 3D cylinder)
uniform float uIsBarrelGallery;  // 1.0 if barrel gallery item, 0.0 otherwise
uniform float uMeshOffsetY;      // Vertical scroll offset
uniform float uOvalFlatness;     // Barrel flatness
uniform float uCurveAmount;      // Follows vertical scroll velocity
uniform float uBarrelRadius;     // Radius of horizontal cylinder

varying vec2 vUv;
varying float vViewZ;
varying vec3 vWorldPos;

void main() {
  vUv = aUv;
  vec3 pos = aPosition;

  // 1. Dynamic Carousel Arc Bending
  if (uIsBarrelGallery < 0.5) {
    float localAngle = pos.x / uPanelRadius;
    float bentX = sin(localAngle) * uPanelRadius;
    float bentZ = -(1.0 - cos(localAngle)) * uPanelRadius * uPanelOvalRatio;
    
    pos.x = mix(pos.x, bentX, uWrapAmount);
    pos.z += bentZ * uWrapAmount;

    // Click pull bulge
    if (uPullAmount > 0.0001) {
      float distToClick = distance(pos.xy, uClickPos);
      float bulge = exp(-distToClick * 2.2) * uPullAmount;
      pos.z += bulge;
    }
  } else {
    // 2. Barrel Gallery Horizontal Cylinder Bending
    // pos.z += cos(worldY / uPanelRadius).oneMinus() * uPanelRadius * uOvalFlatness * uCurveAmount
    float worldY = pos.y + uMeshOffsetY;
    float angleY = worldY / uBarrelRadius;
    float barrelZ = -(1.0 - cos(angleY)) * uBarrelRadius * uOvalFlatness * uCurveAmount;
    pos.z += barrelZ;
  }

  vec4 worldPos = uModel * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  vec4 viewPos = uView * worldPos;
  vViewZ = -viewPos.z;
  gl_Position = uProjection * viewPos;
}
`;

const FRAGMENT_SHADER_SRC = `
precision highp float;

uniform sampler2D uTexture;
uniform float uVelocity;          // Speed of carousel or scroll
uniform float uOpacity;           // Item opacity
uniform float uDimFactor;         // Dimming towards edges or background
uniform vec3 uHoverLight;         // Dynamic light position
uniform float uIsHeroBackdrop;    // Fade to dark background
uniform float uIsBarrel;          // Aspect ratio adjustments

varying vec2 vUv;
varying float vViewZ;
varying vec3 vWorldPos;

void main() {
  // Speed chromatic aberration: red and blue channels drift apart
  float shift = clamp(uVelocity * 0.0022, -0.018, 0.018);
  vec4 color;
  
  if (abs(shift) > 0.0001) {
    float r = texture2D(uTexture, vUv + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - vec2(shift, 0.0)).b;
    float a = texture2D(uTexture, vUv).a;
    color = vec4(r, g, b, a);
  } else {
    color = texture2D(uTexture, vUv);
  }

  // Rounded corners in UV space
  vec2 uvCentered = vUv - vec2(0.5);
  float aspect = uIsBarrel > 0.5 ? 1.777 : 1.6;
  vec2 uvAspect = vec2(uvCentered.x * aspect, uvCentered.y);
  float radius = 0.04;
  vec2 cornerDist = max(abs(uvAspect) - vec2(aspect * 0.5 - radius, 0.5 - radius), vec2(0.0));
  float cornerLen = length(cornerDist);
  float cornerAlpha = 1.0 - smoothstep(radius - 0.005, radius, cornerLen);
  if (cornerAlpha < 0.01) discard;

  // Soft directional light interaction
  float lightDist = distance(vWorldPos.xy, uHoverLight.xy);
  float lightFactor = clamp(1.0 - lightDist * 0.08, 0.88, 1.15);

  vec3 finalRgb = color.rgb * uDimFactor * lightFactor;

  if (uIsHeroBackdrop > 0.5) {
    // Fade to dark background as hero expands
    finalRgb = mix(finalRgb, vec3(0.03, 0.03, 0.03), 0.75);
  }

  gl_FragColor = vec4(finalRgb, color.a * uOpacity * cornerAlpha);
}
`;

// ---------------------------------------------------------------------------
// 32-Segment Subdivided Quad Geometry
// ---------------------------------------------------------------------------
function generateSubdividedPlane(width: number, height: number, segX = 32, segY = 32): {
  vertices: Float32Array;
  uvs: Float32Array;
  indices: Uint16Array;
} {
  const numVertices = (segX + 1) * (segY + 1);
  const vertices = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const indices = new Uint16Array(segX * segY * 6);

  let vIdx = 0;
  let uvIdx = 0;

  for (let y = 0; y <= segY; y++) {
    const v = y / segY;
    const posY = (0.5 - v) * height;

    for (let x = 0; x <= segX; x++) {
      const u = x / segX;
      const posX = (u - 0.5) * width;

      vertices[vIdx++] = posX;
      vertices[vIdx++] = posY;
      vertices[vIdx++] = 0;

      uvs[uvIdx++] = u;
      uvs[uvIdx++] = v;
    }
  }

  let iIdx = 0;
  for (let y = 0; y < segY; y++) {
    for (let x = 0; x < segX; x++) {
      const a = y * (segX + 1) + x;
      const b = a + 1;
      const c = a + (segX + 1);
      const d = c + 1;

      indices[iIdx++] = a;
      indices[iIdx++] = c;
      indices[iIdx++] = b;

      indices[iIdx++] = b;
      indices[iIdx++] = c;
      indices[iIdx++] = d;
    }
  }

  return { vertices, uvs, indices };
}

// ---------------------------------------------------------------------------
// Mathias Adolfsson '26 Engine Class
// ---------------------------------------------------------------------------
export class MathiasCylinderEngine {
  private container: HTMLElement;
  private wrapper!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private gl!: WebGLRenderingContext;
  private program!: WebGLProgram;

  // WebGL Buffers & Textures
  private vertexBuffer!: WebGLBuffer;
  private uvBuffer!: WebGLBuffer;
  private indexBuffer!: WebGLBuffer;
  private numIndices = 0;
  private textures: (WebGLTexture | null)[] = [];
  private galleryTextures: Map<string, (WebGLTexture | null)[]> = new Map();
  private fallbackTexture!: WebGLTexture;

  // Uniform Locations
  private uProjectionLoc!: WebGLUniformLocation;
  private uViewLoc!: WebGLUniformLocation;
  private uModelLoc!: WebGLUniformLocation;
  private uTextureLoc!: WebGLUniformLocation;
  private uPanelRadiusLoc!: WebGLUniformLocation;
  private uPanelOvalRatioLoc!: WebGLUniformLocation;
  private uWrapAmountLoc!: WebGLUniformLocation;
  private uClickPosLoc!: WebGLUniformLocation;
  private uPullAmountLoc!: WebGLUniformLocation;
  private uIsBarrelGalleryLoc!: WebGLUniformLocation;
  private uMeshOffsetYLoc!: WebGLUniformLocation;
  private uOvalFlatnessLoc!: WebGLUniformLocation;
  private uCurveAmountLoc!: WebGLUniformLocation;
  private uBarrelRadiusLoc!: WebGLUniformLocation;
  private uVelocityLoc!: WebGLUniformLocation;
  private uOpacityLoc!: WebGLUniformLocation;
  private uDimFactorLoc!: WebGLUniformLocation;
  private uHoverLightLoc!: WebGLUniformLocation;
  private uIsHeroBackdropLoc!: WebGLUniformLocation;
  private uIsBarrelLoc!: WebGLUniformLocation;

  // Dataset & Configuration
  private projects: ShowcaseProject[];
  private numItems: number;
  private onNavigate?: (path: string) => void;

  // Carousel Architecture & Oval Arc Parameters (Scaled +30% for Authentic Reference Presence)
  private spacing = 6.42;
  private radiusX = 11.5;
  private radiusZ = 6.08;
  private ovalRatio = 0.53;
  private panelRadius = 11.5;
  private panelOvalRatio = 0.53;

  // Kinematics & Motion State
  private MOTION_LERP = 0.085;
  private PULL_EDGE_LERP = 0.08;
  private PULL_DISTANCE = 0.85;

  private pos = 0;
  private targetPos = 0;
  private velocity = 0;

  // Camera Tilt & Parallax Light State
  private tiltTargetX = 0;
  private tiltTargetY = 0;
  private tiltCurrentX = 0;
  private tiltCurrentY = 0;

  private lightTargetX = 0;
  private lightTargetY = 0;
  private lightCurrentX = 0;
  private lightCurrentY = 0;

  // Hero Transition State
  public heroOpenAmount = 0.0;
  private edgeProgress = 0.0;
  private pullAmount = 0.0;
  private clickPos: [number, number] = [0, 0];
  private activeHeroIndex = -1;
  private activeProject: ShowcaseProject | null = null;

  // 3D Vertical Barrel Gallery State (Case Study Mode)
  private galleryPos = 0;
  private galleryTargetPos = 0;
  private galleryVelocity = 0;
  private galleryCurve = 0;
  private barrelRadius = 5.2;
  private ovalFlatness = 0.65;

  // Drag & Pointer Physics
  private isDragging = false;
  private hasDragged = false;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private lastPointerTime = 0;
  private dragVelocityX = 0;
  private dragVelocityY = 0;
  private wheelSnapTimer: number | null = null;

  // Matrix Math Scratch
  private projMat = mat4Create();
  private viewMat = mat4Create();
  private modelMat = mat4Create();

  // DOM Elements
  private soundToggleEl!: HTMLElement;
  private aboutDrawer!: HTMLElement;
  private caseStudyOverlay!: HTMLElement;
  private arcTrackEl!: HTMLElement;
  private arcThumbEl!: SVGElement;
  private arcTitleEl!: HTMLElement;

  // Preloader / Arc State
  public arcCurveAmount = 1.0;
  private currentActiveIndex = 0;

  // Audio & Animation Loop
  private audioCtx: AudioContext | null = null;
  private isMuted = false;
  private isRunning = true;
  private rafId: number | null = null;
  private boundEvents: BoundListener[] = [];

  constructor(options: MathiasCylinderOptions) {
    this.container = options.container;
    this.projects = options.projects && options.projects.length > 0 ? options.projects : SHOWCASE_PROJECTS;
    this.numItems = this.projects.length;
    this.onNavigate = options.onNavigate;

    this.setupDOM();
    this.initWebGL();
    this.initTextures();
    this.initGalleryTextures();
    this.bindEvents();
    this.animateArcEntrance();

    // Check deep link
    if (options.initialSlug) {
      const foundIdx = this.projects.findIndex(p => p.slug === options.initialSlug);
      if (foundIdx !== -1) {
        this.openProject(this.projects[foundIdx], window.innerWidth / 2, window.innerHeight / 2, false);
      }
    }

    this.tick = this.tick.bind(this);
    this.rafId = requestAnimationFrame(this.tick);
  }

  /* --------------------------------------------------------------------------
     DOM Setup — Canvas, Headers, Arc Scrubber HUD, Case Study Overlay
     -------------------------------------------------------------------------- */
  private setupDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ma-cylinder-root is-fixed';

    this.wrapper.innerHTML = `
      <!-- Full-Screen 3D WebGL Canvas -->
      <canvas class="ma-cylinder-canvas" id="maGlCanvas"></canvas>

      <!-- Ultra-Minimalist Top Header (Mathias Adolfsson Styling) -->
      <header class="ma-minimal-header" id="maHeader">
        <div class="ma-minimal-header__brand">
          <div class="ma-brand-line-1">OCIMOH</div>
          <div class="ma-brand-line-2">Creative Engineer</div>
        </div>

        <div class="ma-minimal-header__nav">
          <button class="ma-sound-toggle" id="maSoundToggle" type="button" aria-label="Toggle Spatial Audio">SOUND ON</button>
          <button class="ma-about-link" id="maAboutBtn" type="button" aria-label="Open Studio Profile">About</button>
        </div>
      </header>

      <!-- Case Study Overlay (Header & Actions while in 3D Barrel Gallery) -->
      <div class="ma-case-overlay" id="maCaseOverlay" aria-hidden="true">
        <div class="ma-case-overlay__bar">
          <button class="ma-case-overlay__back" id="maCaseBackBtn" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>REEL [ESC]</span>
          </button>

          <div class="ma-case-overlay__brand">
            <span class="ma-case-overlay__name" id="maCaseTitle">PROJECT</span>
            <span class="ma-case-overlay__sep">/</span>
            <span class="ma-case-overlay__client" id="maCaseClient">CLIENT</span>
          </div>

          <div class="ma-case-overlay__actions" id="maCaseActions">
            <!-- Populated on open -->
          </div>
        </div>

        <!-- Case Study Bottom Meta Bar -->
        <div class="ma-case-overlay__footer">
          <div class="ma-case-meta">
            <span class="ma-case-meta__year" id="maCaseYear">2026</span>
            <span class="ma-case-meta__cat" id="maCaseCat">CATEGORY</span>
            <span class="ma-case-meta__metrics" id="maCaseMetrics">METRICS</span>
          </div>

          <div class="ma-case-nav">
            <button class="ma-case-nav__btn" id="maCasePrevBtn" type="button">← PREV</button>
            <button class="ma-case-nav__btn" id="maCaseNextBtn" type="button">NEXT →</button>
          </div>
        </div>
      </div>

      <!-- Signature Bottom Curved Arc HUD with Active Project Typography -->
      <footer class="ma-arc-hud" id="maArcHud" aria-label="Carousel Arc Scrubber">
        <div class="ma-arc-hud__arc-wrap">
          <svg class="ma-arc-hud__svg" viewBox="0 0 200 48" preserveAspectRatio="none">
            <path class="ma-arc-hud__track" id="maArcTrack" d="M 12 40 Q 100 8 188 40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round"/>
            <circle class="ma-arc-hud__thumb" id="maArcThumb" cx="100" cy="8" r="3.2" fill="#ffffff" />
          </svg>
        </div>
        <div class="ma-arc-hud__title" id="maArcTitle">Repositories</div>
      </footer>

      <!-- About Studio Drawer -->
      <aside class="ma-drawer ma-drawer--about" id="maAboutDrawer" aria-label="About OCIMoh Studio" aria-hidden="true">
        <div class="ma-drawer__backdrop" id="maAboutBackdrop"></div>
        <div class="ma-drawer__panel" id="maAboutPanel">
          <div class="ma-drawer__bar">
            <span class="ma-drawer__badge">OCIMOH // CREATIVE ENGINEER</span>
            <button class="ma-drawer__close-btn" id="maAboutClose" type="button" aria-label="Close About Drawer">
              <span>CLOSE [ESC]</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="ma-drawer__scroll">
            <h2 class="ma-about__headline">A CURVED CAROUSEL, A BARREL GALLERY AND MOTION WITH A LIFE OF ITS OWN</h2>
            <p class="ma-about__bio">
              Independent creative engineering studio specializing in WebGL / WebGPU, procedural 3D graphics, dynamic GLSL/TSL shaders, and tactile digital experiences.
            </p>
            <div class="ma-about__grid">
              <div class="ma-about__col">
                <h4 class="ma-about__col-title">CORE DISCIPLINES</h4>
                <ul class="ma-about__list">
                  <li>Three.js & WebGPU Shaders (TSL)</li>
                  <li>3D Cylindrical Geometry & Vertex Bending</li>
                  <li>In-Situ Mesh Expansion Transitions</li>
                  <li>3D Vertical Barrel Galleries</li>
                  <li>Generative Web Audio Synthesis</li>
                </ul>
              </div>
              <div class="ma-about__col">
                <h4 class="ma-about__col-title">FEATURED REPOSITORIES</h4>
                <ul class="ma-about__list">
                  <li>Varun Sir Portfolio</li>
                  <li>Touché — 3D Keyboard</li>
                  <li>Lumina Coffee — Scrollytelling</li>
                  <li>AMC Journey — Mohali Clinic</li>
                  <li>Universal College Patran</li>
                  <li>Project Wraith — Cyber Suite</li>
                </ul>
              </div>
            </div>
            <div class="ma-about__actions">
              <a href="https://github.com/OCIMoh" target="_blank" rel="noopener noreferrer" class="ma-btn ma-btn--primary">
                <span>VIEW GITHUB PROFILE ↗</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    `;

    this.container.appendChild(this.wrapper);

    // Bind DOM refs
    this.canvas = this.wrapper.querySelector('#maGlCanvas')!;
    this.soundToggleEl = this.wrapper.querySelector('#maSoundToggle')!;
    this.aboutDrawer = this.wrapper.querySelector('#maAboutDrawer')!;
    this.caseStudyOverlay = this.wrapper.querySelector('#maCaseOverlay')!;
    this.arcTrackEl = this.wrapper.querySelector('#maArcTrack')!;
    this.arcThumbEl = this.wrapper.querySelector('#maArcThumb')!;
    this.arcTitleEl = this.wrapper.querySelector('#maArcTitle')!;

    if (this.projects.length > 0 && this.arcTitleEl) {
      this.arcTitleEl.textContent = this.projects[0].title.split('—')[0].trim();
    }
  }

  /* --------------------------------------------------------------------------
     WebGL Initialization
     -------------------------------------------------------------------------- */
  private initWebGL(): void {
    const gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance'
    }) || (this.canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    // Compile Shaders
    const vertShader = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('Shader link failed: ' + gl.getProgramInfoLog(prog));
    }
    this.program = prog;
    gl.useProgram(prog);

    // Alpha Blending & Depth Testing for Crisp 3D Occlusion
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Uniform Locations
    this.uProjectionLoc = gl.getUniformLocation(prog, 'uProjection')!;
    this.uViewLoc = gl.getUniformLocation(prog, 'uView')!;
    this.uModelLoc = gl.getUniformLocation(prog, 'uModel')!;
    this.uTextureLoc = gl.getUniformLocation(prog, 'uTexture')!;
    this.uPanelRadiusLoc = gl.getUniformLocation(prog, 'uPanelRadius')!;
    this.uPanelOvalRatioLoc = gl.getUniformLocation(prog, 'uPanelOvalRatio')!;
    this.uWrapAmountLoc = gl.getUniformLocation(prog, 'uWrapAmount')!;
    this.uClickPosLoc = gl.getUniformLocation(prog, 'uClickPos')!;
    this.uPullAmountLoc = gl.getUniformLocation(prog, 'uPullAmount')!;
    this.uIsBarrelGalleryLoc = gl.getUniformLocation(prog, 'uIsBarrelGallery')!;
    this.uMeshOffsetYLoc = gl.getUniformLocation(prog, 'uMeshOffsetY')!;
    this.uOvalFlatnessLoc = gl.getUniformLocation(prog, 'uOvalFlatness')!;
    this.uCurveAmountLoc = gl.getUniformLocation(prog, 'uCurveAmount')!;
    this.uBarrelRadiusLoc = gl.getUniformLocation(prog, 'uBarrelRadius')!;
    this.uVelocityLoc = gl.getUniformLocation(prog, 'uVelocity')!;
    this.uOpacityLoc = gl.getUniformLocation(prog, 'uOpacity')!;
    this.uDimFactorLoc = gl.getUniformLocation(prog, 'uDimFactor')!;
    this.uHoverLightLoc = gl.getUniformLocation(prog, 'uHoverLight')!;
    this.uIsHeroBackdropLoc = gl.getUniformLocation(prog, 'uIsHeroBackdrop')!;
    this.uIsBarrelLoc = gl.getUniformLocation(prog, 'uIsBarrel')!;

    // Create 32-Segment Subdivided Plane Mesh (Width 5.07, Height 3.18 — Scaled +30%)
    const geo = generateSubdividedPlane(5.07, 3.18, 32, 32);
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

    // Fallback Texture
    this.fallbackTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.fallbackTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([15, 15, 15, 255]));

    this.resize();
  }

  private compileShader(type: number, src: string): WebGLShader {
    const s = this.gl.createShader(type)!;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      throw new Error('Shader compile failed: ' + this.gl.getShaderInfoLog(s));
    }
    return s;
  }

  /* --------------------------------------------------------------------------
     Texture Compositing & Image Streaming
     -------------------------------------------------------------------------- */
  private initTextures(): void {
    const gl = this.gl;
    this.textures = this.projects.map((proj, idx) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // 1. Initial crisp canvas render (typography, repository metadata, tags, and theme border)
      const initialCanvas = this.renderProjectTexture(proj, idx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, initialCanvas);

      // 2. Stream high-res imagery and re-composite on load (never overwrite raw image directly)
      if (proj.previewImageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!this.isRunning) return;
          const composite = this.renderProjectTexture(proj, idx, img);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, composite);
        };
        img.onerror = () => {
          console.warn(`Preview image failed for ${proj.slug}, retaining vector card.`);
        };
        img.src = proj.previewImageUrl;
      }
      return tex;
    });
  }

  private initGalleryTextures(): void {
    const gl = this.gl;
    this.projects.forEach(proj => {
      const urls = proj.galleryImages || [proj.previewImageUrl];
      const texList = urls.map((url, i) => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Placeholder canvas
        const c = document.createElement('canvas');
        c.width = 1600; c.height = 1000;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#101014';
        ctx.fillRect(0, 0, 1600, 1000);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '600 24px monospace';
        ctx.fillText(`${proj.title.split('—')[0].trim().toUpperCase()} // GALLERY 0${i + 1}`, 80, 500);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!this.isRunning) return;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        };
        img.src = url;
        return tex;
      });
      this.galleryTextures.set(proj.slug, texList);
    });
  }

  private renderProjectTexture(proj: ShowcaseProject, idx: number, img?: HTMLImageElement): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 1600;
    c.height = 1000;
    const ctx = c.getContext('2d')!;

    // 1. Draw base photo or sophisticated obsidian backdrop
    if (img && img.complete && img.naturalWidth > 0) {
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = 1600 / 1000;
      let drawW = 1600;
      let drawH = 1000;
      let drawX = 0;
      let drawY = 0;
      if (imgAspect > canvasAspect) {
        drawW = 1000 * imgAspect;
        drawX = (1600 - drawW) / 2;
      } else {
        drawH = 1600 / imgAspect;
        drawY = (1000 - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Subtle atmospheric vignette (Border-free full-bleed matching reference Image 1)
      const scrim = ctx.createLinearGradient(0, 0, 0, 1000);
      scrim.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
      scrim.addColorStop(0.35, 'rgba(0, 0, 0, 0.12)');
      scrim.addColorStop(0.65, 'rgba(0, 0, 0, 0.55)');
      scrim.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, 1600, 1000);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
      grad.addColorStop(0, '#16161a');
      grad.addColorStop(0.6, '#0f0f12');
      grad.addColorStop(1, '#080808');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1600, 1000);

      // Subtle radial accent glow
      const glow = ctx.createRadialGradient(800, 450, 40, 800, 450, 750);
      glow.addColorStop(0, proj.color + '20');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1600, 1000);
    }

    // 2. Main Hero Headline on Card (Auto-scaled to prevent text collision)
    const displayTitle = proj.title.split('—')[0].trim();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffffff';

    let fontSize = 72;
    ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
    while (ctx.measureText(displayTitle).width > 1200 && fontSize > 42) {
      fontSize -= 4;
      ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif`;
    }
    ctx.fillText(displayTitle, 90, 520);

    // Secondary tagline / description with clean bounds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.font = '400 30px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    let descText = proj.description || proj.category;
    if (descText.length > 55) {
      descText = descText.slice(0, 52) + '...';
    }
    ctx.fillText(descText, 90, 582);
    ctx.shadowBlur = 0;

    // 3. Signature White Action Pill
    const pillText = proj.isLive ? 'Explore live site ↗' : 'View repository ↗';
    ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", sans-serif';
    const pillW = ctx.measureText(pillText).width + 56;
    const pillH = 56;
    const pillX = 90;
    const pillY = 645;

    // White rounded pill
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 9999);
    ctx.fill();

    ctx.fillStyle = '#080808';
    ctx.fillText(pillText, pillX + 28, pillY + 36);

    return c;
  }

  /* --------------------------------------------------------------------------
     Arc Preloader Intro Animation (Mathias Adolfsson Article Feature)
     -------------------------------------------------------------------------- */
  private animateArcEntrance(): void {
    const proxy = { curve: 0 };
    gsap.to(proxy, {
      curve: 1.0,
      duration: 1.75,
      ease: 'expo.out',
      onUpdate: () => {
        this.arcCurveAmount = proxy.curve;
      }
    });
  }

  /* --------------------------------------------------------------------------
     Single-Rhythm Motion RAF Loop (MOTION_LERP)
     -------------------------------------------------------------------------- */
  private tick(): void {
    if (!this.isRunning) return;

    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.03, 0.03, 0.03, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 1. One Lerp for Carousel Position
    const prevPos = this.pos;
    this.pos += (this.targetPos - this.pos) * this.MOTION_LERP;
    this.velocity = this.pos - prevPos;

    // 2. Camera Tilt Lerp
    const tiltTargetXNow = this.heroOpenAmount > 0.5 ? 0 : this.tiltTargetX;
    const tiltTargetYNow = this.heroOpenAmount > 0.5 ? 0 : this.tiltTargetY;
    this.tiltCurrentX += (tiltTargetXNow - this.tiltCurrentX) * this.MOTION_LERP;
    this.tiltCurrentY += (tiltTargetYNow - this.tiltCurrentY) * this.MOTION_LERP;

    // 3. Soft Hover Light Lerp (moves opposite to tilt)
    const lightTargetXNow = this.heroOpenAmount > 0.5 ? 0 : this.lightTargetX;
    const lightTargetYNow = this.heroOpenAmount > 0.5 ? 0 : this.lightTargetY;
    this.lightCurrentX += (lightTargetXNow - this.lightCurrentX) * this.MOTION_LERP;
    this.lightCurrentY += (lightTargetYNow - this.lightCurrentY) * this.MOTION_LERP;

    // 4. Hero Transition Chaser Lerp (Click Bulge)
    this.edgeProgress += (this.heroOpenAmount - this.edgeProgress) * this.PULL_EDGE_LERP;
    const pullDiff = this.heroOpenAmount - this.edgeProgress;
    this.pullAmount = pullDiff * this.PULL_DISTANCE;

    // 5. Barrel Gallery Scroll Lerp (Case Study Mode)
    if (this.heroOpenAmount > 0.05) {
      const prevGalPos = this.galleryPos;
      this.galleryPos += (this.galleryTargetPos - this.galleryPos) * this.MOTION_LERP;
      this.galleryVelocity = this.galleryPos - prevGalPos;
      this.galleryCurve = Math.min(1.0, Math.abs(this.galleryVelocity) * 2.2);
    }

    // Update Bottom Arc HUD Indicator
    this.updateArcHUD();

    // Setup Projection Matrix
    const aspect = this.canvas.width / this.canvas.height;
    mat4Perspective(this.projMat, (48 * Math.PI) / 180, aspect, 0.1, 50.0);

    // Setup View Matrix with Camera Tilt Parallax
    mat4Identity(this.viewMat);
    mat4Translate(this.viewMat, this.viewMat, [0, 0, -6.8]);
    mat4RotateX(this.viewMat, this.viewMat, this.tiltCurrentY);
    mat4RotateY(this.viewMat, this.viewMat, this.tiltCurrentX);

    // Bind Shader Program & Attributes
    gl.useProgram(this.program);

    gl.uniformMatrix4fv(this.uProjectionLoc, false, this.projMat);
    gl.uniformMatrix4fv(this.uViewLoc, false, this.viewMat);

    gl.uniform1f(this.uPanelRadiusLoc, this.panelRadius);
    gl.uniform1f(this.uPanelOvalRatioLoc, this.panelOvalRatio);
    gl.uniform3f(this.uHoverLightLoc, this.lightCurrentX, this.lightCurrentY, 1.0);

    // Bind Buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    const posLoc = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
    const uvLoc = gl.getAttribLocation(this.program, 'aUv');
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // -------------------------------------------------------------------------
    // RENDER PASS 1: Main Oval Arc Carousel
    // -------------------------------------------------------------------------
    const loopWidth = this.numItems * this.spacing;

    for (let i = 0; i < this.numItems; i++) {
      const isHero = i === this.activeHeroIndex;

      // Compute wrapped X along oval arc
      let wrappedX = (i * this.spacing + this.pos) % loopWidth;
      wrappedX = ((wrappedX % loopWidth) + loopWidth) % loopWidth;
      if (wrappedX > loopWidth / 2) wrappedX -= loopWidth;

      const angle = wrappedX / this.radiusX;

      // STRICT 180° FRONT-ARC CULLING:
      // Cards beyond ±78° (1.36 rad) are entering the back half of the cylinder.
      // Culling them completely eliminates all edge-on cards and prevents ghost cards slicing through!
      const maxAngle = 1.36;
      if (!isHero && Math.abs(angle) > maxAngle) {
        continue;
      }

      let x = Math.sin(angle) * this.radiusX;
      let z = (Math.cos(angle) - 1.0) * this.radiusZ;
      let rotY = angle * this.ovalRatio;

      // Dynamic 20% Center Magnification
      // Smoothly enlarges whichever card moves into the center slot by +20%
      let baseScale = 1.0;
      const angularSpan = (this.spacing / this.radiusX) * 1.15;
      if (Math.abs(angle) < angularSpan) {
        const t = Math.abs(angle) / angularSpan;
        const centerBonus = 0.20 * Math.pow(Math.cos(t * Math.PI * 0.5), 2.0);
        baseScale += centerBonus;
      }

      let scale = baseScale;
      let wrapAmount = 1.0;
      let dimFactor = 1.0;
      let opacity = 1.0;

      if (isHero) {
        // Hero Card Transition:
        // Interpolate position from carousel slot to camera center (0, 0, 1.8)
        x = x * (1.0 - this.heroOpenAmount);
        z = z * (1.0 - this.heroOpenAmount) + 1.8 * this.heroOpenAmount;
        rotY = rotY * (1.0 - this.heroOpenAmount);

        // Scale up to cover viewport
        scale = baseScale + 1.25 * this.heroOpenAmount;

        // Unbend from arc to flat plane: uWrapAmount goes 1.0 -> 0.0
        wrapAmount = 1.0 - this.heroOpenAmount;

        // Dim background backdrop
        dimFactor = 1.0 - this.heroOpenAmount * 0.6;
        opacity = 1.0;

        gl.uniform2f(this.uClickPosLoc, this.clickPos[0], this.clickPos[1]);
        gl.uniform1f(this.uPullAmountLoc, this.pullAmount);
        gl.uniform1f(this.uIsHeroBackdropLoc, this.heroOpenAmount > 0.5 ? 1.0 : 0.0);
      } else {
        // Non-hero cards fade out as hero opens
        opacity = 1.0 - this.heroOpenAmount * 1.5;
        if (opacity < 0.001) continue;

        // Smooth cubic falloff towards the edge of the 180° arc
        const angleRatio = Math.abs(angle) / maxAngle;
        const edgeFade = clamp(1.0 - Math.pow(angleRatio, 2.8), 0.0, 1.0);
        dimFactor = clamp(1.0 - angleRatio * 0.55, 0.35, 1.0);
        opacity *= edgeFade;

        if (opacity < 0.01) continue;

        gl.uniform2f(this.uClickPosLoc, 0, 0);
        gl.uniform1f(this.uPullAmountLoc, 0.0);
        gl.uniform1f(this.uIsHeroBackdropLoc, 0.0);
      }

      gl.uniform1f(this.uIsBarrelGalleryLoc, 0.0);
      gl.uniform1f(this.uIsBarrelLoc, 0.0);
      gl.uniform1f(this.uWrapAmountLoc, wrapAmount);
      gl.uniform1f(this.uVelocityLoc, this.velocity);
      gl.uniform1f(this.uOpacityLoc, opacity);
      gl.uniform1f(this.uDimFactorLoc, dimFactor);

      // Model Matrix
      mat4Identity(this.modelMat);
      mat4Translate(this.modelMat, this.modelMat, [x, 0, z]);
      mat4RotateY(this.modelMat, this.modelMat, rotY);
      mat4Scale(this.modelMat, this.modelMat, [scale, scale, 1.0]);
      gl.uniformMatrix4fv(this.uModelLoc, false, this.modelMat);

      // Bind Texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i] || this.fallbackTexture);
      gl.uniform1i(this.uTextureLoc, 0);

      gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }

    // -------------------------------------------------------------------------
    // RENDER PASS 2: 3D Vertical Barrel Gallery (Inside Case Study)
    // -------------------------------------------------------------------------
    if (this.heroOpenAmount > 0.08 && this.activeProject) {
      const gTextures = this.galleryTextures.get(this.activeProject.slug) || [];
      const numG = gTextures.length;
      const gSpacing = 2.4;
      const galLoopHeight = numG * gSpacing;

      gl.uniform1f(this.uIsBarrelGalleryLoc, 1.0);
      gl.uniform1f(this.uIsBarrelLoc, 1.0);
      gl.uniform1f(this.uBarrelRadiusLoc, this.barrelRadius);
      gl.uniform1f(this.uOvalFlatnessLoc, this.ovalFlatness);
      gl.uniform1f(this.uCurveAmountLoc, this.galleryCurve);
      gl.uniform1f(this.uVelocityLoc, this.galleryVelocity);

      for (let g = 0; g < numG; g++) {
        // Vertical position along barrel cylinder
        let wrappedY = (g * gSpacing + this.galleryPos) % galLoopHeight;
        wrappedY = ((wrappedY % galLoopHeight) + galLoopHeight) % galLoopHeight;
        if (wrappedY > galLoopHeight / 2) wrappedY -= galLoopHeight;

        // Fading at top and bottom view bounds
        const distY = Math.abs(wrappedY);
        const gOpacity = clamp(1.0 - distY / (galLoopHeight * 0.48), 0.0, 1.0) * this.heroOpenAmount;
        if (gOpacity < 0.01) continue;

        gl.uniform1f(this.uMeshOffsetYLoc, wrappedY);
        gl.uniform1f(this.uOpacityLoc, gOpacity);
        gl.uniform1f(this.uDimFactorLoc, 1.0);

        mat4Identity(this.modelMat);
        mat4Translate(this.modelMat, this.modelMat, [0, wrappedY, 1.2]);
        gl.uniformMatrix4fv(this.uModelLoc, false, this.modelMat);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gTextures[g] || this.fallbackTexture);
        gl.uniform1i(this.uTextureLoc, 0);

        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  /* --------------------------------------------------------------------------
     Interaction: Pointer Drag, Parallax Tilt, Click-to-Open Hero
     -------------------------------------------------------------------------- */
  private bindEvents(): void {
    const add = (target: EventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions) => {
      target.addEventListener(type, handler, options);
      this.boundEvents.push({ target, type, handler, options });
    };

    const onPointerDown = (e: PointerEvent) => {
      this.isDragging = true;
      this.hasDragged = false;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.lastPointerTime = performance.now();
      this.dragVelocityX = 0;
      this.dragVelocityY = 0;
      this.canvas.style.cursor = 'grabbing';

      if (this.wheelSnapTimer !== null) {
        window.clearTimeout(this.wheelSnapTimer);
        this.wheelSnapTimer = null;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      // Parallax Tilt & Soft Light tracking (Mathias Adolfsson Article Feature)
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;

      this.tiltTargetX = normX * 0.07;
      this.tiltTargetY = normY * 0.05;
      this.lightTargetX = -normX * 2.8;
      this.lightTargetY = -normY * 2.0;

      if (!this.isDragging) return;

      const deltaX = e.clientX - this.lastPointerX;
      const deltaY = e.clientY - this.lastPointerY;
      const now = performance.now();
      const dt = Math.max(1, now - this.lastPointerTime);

      if (Math.hypot(e.clientX - this.pointerStartX, e.clientY - this.pointerStartY) > 5) {
        this.hasDragged = true;
      }

      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.lastPointerTime = now;

      // Track pointer velocity for momentum fling
      this.dragVelocityX = (deltaX / dt) * 16.0;
      this.dragVelocityY = (deltaY / dt) * 16.0;

      if (this.heroOpenAmount > 0.5) {
        // Inside Case Study: drag scrolls the 3D Barrel Gallery
        this.galleryTargetPos += deltaY * 0.012;
      } else {
        // In Carousel: responsive drag rotates the oval arc
        this.targetPos += deltaX * 0.018;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';

      // Tap without dragging: Click to Open Hero
      if (!this.hasDragged) {
        if (this.heroOpenAmount < 0.2) {
          const clickedProj = this.getActiveOrClickedProject(e.clientX, e.clientY);
          if (clickedProj) {
            this.openProject(clickedProj, e.clientX, e.clientY);
          }
        }
        return;
      }

      // Momentum fling & Snapping to nearest card
      if (this.heroOpenAmount < 0.2) {
        if (Math.abs(this.dragVelocityX) > 1.2) {
          this.targetPos += this.dragVelocityX * 0.12;
        }
        this.snapToNearestCard();
      } else {
        if (Math.abs(this.dragVelocityY) > 1.2) {
          this.galleryTargetPos += this.dragVelocityY * 0.12;
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (this.heroOpenAmount > 0.5) {
        // Vertical wheel scrolls the 3D Barrel Gallery
        this.galleryTargetPos -= e.deltaY * 0.0055;
      } else {
        // Horizontal / vertical wheel scrolls carousel smoothly
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        this.targetPos -= delta * 0.0085;

        // Debounce snapping so continuous scrolling is fluid without getting stuck
        if (this.wheelSnapTimer !== null) {
          window.clearTimeout(this.wheelSnapTimer);
        }
        this.wheelSnapTimer = window.setTimeout(() => {
          if (this.heroOpenAmount < 0.2) {
            this.snapToNearestCard();
          }
        }, 220);
      }
    };

    add(this.canvas, 'pointerdown', onPointerDown as EventListener);
    add(window, 'pointermove', onPointerMove as EventListener);
    add(window, 'pointerup', onPointerUp as EventListener);
    add(window, 'pointercancel', onPointerUp as EventListener);
    add(window, 'wheel', onWheel as EventListener, { passive: false });

    // Keyboard Navigation (Arrow Keys & ESC)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (this.heroOpenAmount > 0.5) {
          this.closeProject();
        }
        if (this.aboutDrawer.classList.contains('is-open')) {
          this.closeAbout();
        }
        return;
      }

      if (this.heroOpenAmount > 0.5) {
        if (e.key === 'ArrowDown') this.galleryTargetPos -= 0.6;
        if (e.key === 'ArrowUp') this.galleryTargetPos += 0.6;
      } else {
        if (e.key === 'ArrowRight') this.targetPos -= this.spacing;
        if (e.key === 'ArrowLeft') this.targetPos += this.spacing;
        this.snapToNearestCard();
      }
    };
    add(window, 'keydown', onKeyDown as EventListener);

    // Case Study Overlay Buttons
    const caseBackBtn = this.wrapper.querySelector('#maCaseBackBtn');
    if (caseBackBtn) add(caseBackBtn, 'click', () => this.closeProject());

    const casePrevBtn = this.wrapper.querySelector('#maCasePrevBtn');
    if (casePrevBtn) add(casePrevBtn, 'click', () => this.navigatePrevProject());

    const caseNextBtn = this.wrapper.querySelector('#maCaseNextBtn');
    if (caseNextBtn) add(caseNextBtn, 'click', () => this.navigateNextProject());

    // About Drawer Buttons
    const aboutBtn = this.wrapper.querySelector('#maAboutBtn');
    if (aboutBtn) add(aboutBtn, 'click', () => this.openAbout());

    const aboutClose = this.wrapper.querySelector('#maAboutClose');
    const aboutBackdrop = this.wrapper.querySelector('#maAboutBackdrop');
    if (aboutClose) add(aboutClose, 'click', () => this.closeAbout());
    if (aboutBackdrop) add(aboutBackdrop, 'click', () => this.closeAbout());

    // Sound FX Toggle
    if (this.soundToggleEl) {
      add(this.soundToggleEl, 'click', () => {
        this.isMuted = !this.isMuted;
        this.soundToggleEl.textContent = this.isMuted ? 'SOUND OFF' : 'SOUND ON';
        this.soundToggleEl.classList.toggle('is-muted', this.isMuted);
        if (!this.isMuted) this.playTone(560, 'sine', 0.05, 0.08);
      });
    }

    // Browser Popstate (History Support)
    const onPopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/projects/') || path.startsWith('/project/')) {
        const slug = path.split('/').pop() || '';
        const found = this.projects.find(p => p.slug === slug);
        if (found && (!this.activeProject || this.activeProject.slug !== slug)) {
          this.openProject(found, window.innerWidth / 2, window.innerHeight / 2, false);
        }
      } else if (this.heroOpenAmount > 0.5) {
        this.closeProject(false);
      }
    };
    add(window, 'popstate', onPopState as EventListener);

    // Resize
    add(window, 'resize', () => this.resize());
  }

  /* --------------------------------------------------------------------------
     Hero Transition: Open & Close (Exact GSAP expo.out + Unbending Shader)
     -------------------------------------------------------------------------- */
  public openProject(proj: ShowcaseProject, clientX: number, clientY: number, pushState = true): void {
    const projIdx = this.projects.findIndex(p => p.slug === proj.slug);
    if (projIdx === -1) return;

    this.activeHeroIndex = projIdx;
    this.activeProject = proj;

    // Convert screen click (X, Y) to local mesh quad coordinate space for elastic bulge
    const rect = this.canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.clickPos = [nx * 1.5, ny * 0.94];

    // Smoothly scroll carousel slot to dead-center in the background
    this.targetPos = -projIdx * this.spacing;

    // Reset Barrel Gallery scroll
    this.galleryPos = 0;
    this.galleryTargetPos = 0;

    // Update URL to /projects/<slug>
    if (pushState) {
      const newPath = `/projects/${proj.slug}`;
      window.history.pushState({ slug: proj.slug }, '', newPath);
      this.onNavigate?.(newPath);
    }

    // Update Case Study DOM Overlay
    this.updateCaseStudyDOM(proj);
    this.caseStudyOverlay.classList.add('is-open');
    this.caseStudyOverlay.setAttribute('aria-hidden', 'false');

    // Hide Bottom Arc HUD during case study
    this.wrapper.querySelector('#maArcHud')?.classList.add('is-hidden');

    this.playTone(620, 'triangle', 0.08, 0.09);

    // GSAP Hero Opening Transition
    gsap.killTweensOf(this);
    gsap.to(this, {
      heroOpenAmount: 1.0,
      duration: 1.45,
      ease: 'expo.out'
    });
  }

  public closeProject(pushState = true): void {
    this.playTone(380, 'sine', 0.05, 0.07);

    if (pushState) {
      window.history.pushState({}, '', '/');
      this.onNavigate?.('/');
    }

    this.caseStudyOverlay.classList.remove('is-open');
    this.caseStudyOverlay.setAttribute('aria-hidden', 'true');
    this.wrapper.querySelector('#maArcHud')?.classList.remove('is-hidden');

    // GSAP Hero Closing Transition (Spring back into arc slot)
    gsap.killTweensOf(this);
    gsap.to(this, {
      heroOpenAmount: 0.0,
      duration: 1.25,
      ease: 'expo.out',
      onComplete: () => {
        this.activeHeroIndex = -1;
        this.activeProject = null;
        this.snapToNearestCard();
      }
    });
  }

  private updateCaseStudyDOM(proj: ShowcaseProject): void {
    const titleEl = this.wrapper.querySelector('#maCaseTitle');
    const clientEl = this.wrapper.querySelector('#maCaseClient');
    const yearEl = this.wrapper.querySelector('#maCaseYear');
    const catEl = this.wrapper.querySelector('#maCaseCat');
    const metricsEl = this.wrapper.querySelector('#maCaseMetrics');
    const actionsEl = this.wrapper.querySelector('#maCaseActions');

    if (titleEl) titleEl.textContent = proj.title.split('—')[0].trim();
    if (clientEl) clientEl.textContent = proj.client;
    if (yearEl) yearEl.textContent = proj.year;
    if (catEl) catEl.textContent = proj.category;
    if (metricsEl) metricsEl.textContent = proj.metrics;

    if (actionsEl) {
      actionsEl.innerHTML = `
        ${proj.isLive ? `
          <a href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer" class="ma-case-launch-btn">
            <span>LIVE SITE ↗</span>
          </a>
        ` : ''}
        <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="ma-case-github-btn">
          <span>GITHUB</span>
        </a>
      `;
    }
  }

  private navigateNextProject(): void {
    if (!this.activeProject) return;
    const curIdx = this.projects.findIndex(p => p.slug === this.activeProject?.slug);
    const nextIdx = (curIdx + 1) % this.numItems;
    this.openProject(this.projects[nextIdx], window.innerWidth / 2, window.innerHeight / 2);
  }

  private navigatePrevProject(): void {
    if (!this.activeProject) return;
    const curIdx = this.projects.findIndex(p => p.slug === this.activeProject?.slug);
    const prevIdx = (curIdx - 1 + this.numItems) % this.numItems;
    this.openProject(this.projects[prevIdx], window.innerWidth / 2, window.innerHeight / 2);
  }

  /* --------------------------------------------------------------------------
     Snapping & Centering (0 Dead-Center Slot Alignment)
     -------------------------------------------------------------------------- */
  private snapToNearestCard(): void {
    const rawIndex = -this.targetPos / this.spacing;
    const nearestIndex = Math.round(rawIndex);
    this.targetPos = -nearestIndex * this.spacing;
  }

  private getActiveOrClickedProject(clientX: number, _clientY: number): ShowcaseProject {
    const raw = ((-this.pos / this.spacing) % this.numItems + this.numItems) % this.numItems;
    const centerIdx = Math.round(raw) % this.numItems;

    if (clientX < window.innerWidth * 0.3) {
      const leftIdx = (centerIdx - 1 + this.numItems) % this.numItems;
      return this.projects[leftIdx];
    } else if (clientX > window.innerWidth * 0.7) {
      const rightIdx = (centerIdx + 1) % this.numItems;
      return this.projects[rightIdx];
    }
    return this.projects[centerIdx];
  }

  /* --------------------------------------------------------------------------
     Bottom Arc Indicator HUD (Matching the Reference Screenshot)
     -------------------------------------------------------------------------- */
  private updateArcHUD(): void {
    const raw = ((-this.pos / this.spacing) % this.numItems + this.numItems) % this.numItems;
    const norm = raw % this.numItems;
    const activeIdx = Math.round(norm) % this.numItems;

    if (activeIdx !== this.currentActiveIndex) {
      this.currentActiveIndex = activeIdx;
      const proj = this.projects[activeIdx];
      if (proj && this.arcTitleEl) {
        this.arcTitleEl.textContent = proj.title.split('—')[0].trim();
        this.playTone(720, 'sine', 0.02, 0.03);
      }
    }

    // Position progress thumb along SVG bezier arc: M 12 40 Q 100 8 188 40
    if (this.arcThumbEl) {
      const t = norm / (this.numItems - 1);
      const clampedT = Math.max(0, Math.min(1, t));

      // Quadratic bezier evaluation: P = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
      const x = (1 - clampedT) * (1 - clampedT) * 12 + 2 * (1 - clampedT) * clampedT * 100 + clampedT * clampedT * 188;
      const y = (1 - clampedT) * (1 - clampedT) * 40 + 2 * (1 - clampedT) * clampedT * (8 * this.arcCurveAmount + 40 * (1 - this.arcCurveAmount)) + clampedT * clampedT * 40;

      this.arcThumbEl.setAttribute('cx', x.toFixed(1));
      this.arcThumbEl.setAttribute('cy', y.toFixed(1));
    }
  }

  /* --------------------------------------------------------------------------
     About Drawer Controls
     -------------------------------------------------------------------------- */
  public openAbout(): void {
    this.aboutDrawer.classList.add('is-open');
    this.aboutDrawer.setAttribute('aria-hidden', 'false');
    this.playTone(680, 'sine', 0.05, 0.07);
  }

  public closeAbout(): void {
    this.aboutDrawer.classList.remove('is-open');
    this.aboutDrawer.setAttribute('aria-hidden', 'true');
    this.playTone(420, 'sine', 0.04, 0.06);
  }

  /* --------------------------------------------------------------------------
     Web Audio Synthesizer
     -------------------------------------------------------------------------- */
  private playTone(freq: number, type: OscillatorType = 'sine', duration = 0.05, vol = 0.06): void {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }

  /* --------------------------------------------------------------------------
     Window Resize Handling
     -------------------------------------------------------------------------- */
  public resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /* --------------------------------------------------------------------------
     Teardown
     -------------------------------------------------------------------------- */
  public destroy(): void {
    this.isRunning = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    if (this.wheelSnapTimer !== null) {
      window.clearTimeout(this.wheelSnapTimer);
      this.wheelSnapTimer = null;
    }

    this.boundEvents.forEach(({ target, type, handler, options }) => {
      target.removeEventListener(type, handler, options);
    });
    this.boundEvents = [];

    const gl = this.gl;
    if (gl) {
      this.textures.forEach(t => t && gl.deleteTexture(t));
      if (this.fallbackTexture) gl.deleteTexture(this.fallbackTexture);
      this.galleryTextures.forEach(list => list.forEach(t => t && gl.deleteTexture(t)));
      if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
      if (this.uvBuffer) gl.deleteBuffer(this.uvBuffer);
      if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
      if (this.program) gl.deleteProgram(this.program);
    }

    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }

    this.wrapper.remove();
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
