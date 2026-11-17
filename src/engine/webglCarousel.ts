/**
 * WebglLiquidCarousel — Award-Winning Liquid Gel & Chromatic Aberration Showcase
 * Features:
 * 1. WebGL Viscous Gel Caustics & Liquid Ripple Canvas (GLSL Shaders)
 * 2. High-Fidelity Fluid DOM Cards with Dynamic Gel Wave Shear
 * 3. Real-Time RGB Chromatic Aberration Prism Dispersion mapped to drag velocity
 * 100% CORS-immune, 60fps hardware accelerated.
 */

import { Product } from '../data/products';

export interface WebglCarouselOptions {
  container: HTMLElement;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export class WebglLiquidCarousel {
  private container: HTMLElement;
  private products: Product[];
  private onSelectProduct?: (product: Product) => void;

  private wrapper!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;

  private trackEl!: HTMLElement;
  private cardElements: HTMLElement[] = [];

  // Kinematics & Physics
  public targetX = 0;
  public currentX = 0;
  private velocity = 0;
  private lerpFactor = 0.085;
  private startTime = performance.now();

  private cardWidth = 280;
  private cardSpacing = 44;
  private effectiveWidth: number;
  private trackWidth: number;

  // Pointer drag tracking
  private isDragging = false;
  private hasDragged = false;
  private startClientX = 0;
  private startClientY = 0;
  private startTargetX = 0;
  private lastClientX = 0;
  private lastTime = 0;
  private dragVelocity = 0;

  // WebGL Uniform Locations
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uVelocityLoc: WebGLUniformLocation | null = null;
  private uResolutionLoc: WebGLUniformLocation | null = null;

  private isRunning = true;
  private animationFrameId = 0;
  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject }[] = [];

  constructor(options: WebglCarouselOptions) {
    this.container = options.container;
    this.products = options.products;
    this.onSelectProduct = options.onSelectProduct;

    this.effectiveWidth = this.cardWidth + this.cardSpacing;
    this.trackWidth = this.products.length * this.effectiveWidth;

    this.buildDOM();
    this.initWebGL();
    this.bindEvents();

    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'liquid-carousel';
    this.wrapper.style.cssText = `
      position: absolute;
      inset: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      user-select: none;
      touch-action: none;
    `;

    // 1. WebGL Gel Ripple Background Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'liquid-carousel__canvas';
    this.canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      opacity: 0.9;
    `;
    this.wrapper.appendChild(this.canvas);

    // 2. Info Eyebrow
    const header = document.createElement('div');
    header.className = 'liquid-carousel__header';
    header.style.cssText = `
      position: absolute;
      top: clamp(80px, 14vh, 120px);
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      z-index: 10;
      pointer-events: none;
    `;
    header.innerHTML = `
      <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.25em; text-transform:uppercase; color:#E94E1B;">
        GLSL Liquid Shader • Drag or Wheel to Disperse
      </span>
      <h2 style="font-family:'Cinzel',serif; font-size:clamp(1.4rem, 2.5vw, 2.2rem); font-weight:600; color:#762530; margin:6px 0 0;">
        Viscous Fluid Dispersion
      </h2>
    `;
    this.wrapper.appendChild(header);

    // 3. Horizontal Card Marquee Stage
    const stage = document.createElement('div');
    stage.className = 'liquid-carousel__stage';
    stage.style.cssText = `
      position: relative;
      width: 100%;
      height: 520px;
      z-index: 5;
      overflow: visible;
      cursor: grab;
    `;

    this.trackEl = document.createElement('div');
    this.trackEl.className = 'liquid-carousel__track';
    this.trackEl.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    `;
    stage.appendChild(this.trackEl);
    this.wrapper.appendChild(stage);

    // 4. Create Product Cards
    this.cardElements = this.products.map((prod, index) => {
      const card = document.createElement('div');
      card.className = 'liquid-card';
      card.dataset.index = String(index);
      card.style.cssText = `
        position: absolute;
        top: 50%;
        left: 0;
        width: ${this.cardWidth}px;
        height: 440px;
        margin-top: -220px;
        border-radius: 26px;
        background: rgba(253, 243, 235, 0.95);
        border: 1px solid rgba(118, 37, 48, 0.28);
        box-shadow: 0 20px 45px rgba(38, 22, 18, 0.12), 0 2px 8px rgba(38, 22, 18, 0.06);
        cursor: pointer;
        will-change: transform, filter, opacity;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 22px;
        box-sizing: border-box;
        overflow: hidden;
        backdrop-filter: blur(12px);
      `;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#E94E1B;">
            ${prod.category.toUpperCase()}
          </span>
          <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:11px; font-weight:600; color:#7d6b64;">
            ${prod.weight}
          </span>
        </div>

        <div class="liquid-card__jar-stage" style="flex:1; display:flex; justify-content:center; align-items:center; position:relative; padding:10px 0;">
          <img class="liquid-card__jar-img" src="${prod.jarUrl}" alt="${prod.title}" draggable="false" style="max-height:220px; width:auto; object-fit:contain; filter:drop-shadow(0 14px 20px rgba(118, 37, 48, 0.22)); transition:transform 0.35s ease;" />
        </div>

        <div style="text-align:center;">
          <h3 style="font-family:'Cinzel',serif; font-size:1.15rem; font-weight:600; color:#762530; margin:0 0 2px;">
            ${prod.title}
          </h3>
          <p style="font-family:'Cinzel',serif; font-size:0.8rem; font-style:italic; color:#7d6b64; margin:0 0 10px;">
            ${prod.latinSubtitle}
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(118,37,48,0.12); padding-top:10px;">
            <span style="font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700; color:#E94E1B;">
              ${prod.price}
            </span>
            <span style="font-family:'Plus Jakarta Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#762530;">
              View Blend →
            </span>
          </div>
        </div>
      `;

      this.trackEl.appendChild(card);
      return card;
    });

    this.container.appendChild(this.wrapper);
  }

  private initWebGL(): void {
    const gl = this.canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) {
      console.warn('WebGL not available for liquid canvas');
      return;
    }
    this.gl = gl;

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform float u_velocity;
      uniform vec2 u_resolution;

      void main() {
        vec2 uv = v_uv;
        
        // Fluid gel wave distortion
        float speed = u_time * 1.8;
        float wave1 = sin(uv.x * 6.0 + speed) * cos(uv.y * 6.0 + speed * 0.8);
        float wave2 = sin(uv.x * 12.0 - speed * 1.2 + u_velocity * 0.5) * 0.5;
        float fluid = wave1 + wave2;

        // Viscous caustics intensity
        float caustic = pow(sin(fluid * 3.14159), 2.0) * 0.18;

        // Rich Sicilian Wine & Terracotta Gel Colors
        vec3 colorWine = vec3(0.46, 0.14, 0.18);   // #762530
        vec3 colorAmber = vec3(0.91, 0.31, 0.11);  // #E94E1B
        vec3 colorCream = vec3(0.99, 0.95, 0.92);  // #FDF3EB

        // Dynamic color blend based on velocity & caustics
        float vNorm = clamp(abs(u_velocity) * 0.12, 0.0, 1.0);
        vec3 gelColor = mix(colorWine, colorAmber, caustic + vNorm);

        // Alpha vignette around center stage
        float dist = distance(uv, vec2(0.5, 0.5));
        float alpha = smoothstep(0.7, 0.2, dist) * (0.28 + vNorm * 0.35 + caustic * 0.25);

        gl_FragColor = vec4(gelColor, alpha);
      }
    `;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('GLSL failed to link:', gl.getProgramInfoLog(program));
      return;
    }
    this.program = program;
    gl.useProgram(program);

    // Fullscreen quad buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    this.uTimeLoc = gl.getUniformLocation(program, 'u_time');
    this.uVelocityLoc = gl.getUniformLocation(program, 'u_velocity');
    this.uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');

    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.wrapper.clientWidth || window.innerWidth;
    const h = this.wrapper.clientHeight || window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private bindEvents(): void {
    const onStart = (e: MouseEvent | TouchEvent) => {
      if (document.body.classList.contains('is-nav-open')) return;
      this.isDragging = true;
      this.hasDragged = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      this.startClientX = clientX;
      this.startClientY = clientY;
      this.startTargetX = this.targetX;
      this.lastClientX = clientX;
      this.lastTime = performance.now();
      this.dragVelocity = 0;
      this.trackEl.style.cursor = 'grabbing';
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dist = Math.hypot(clientX - this.startClientX, clientY - this.startClientY);
      if (dist > 8) {
        this.hasDragged = true;
      }

      const deltaX = clientX - this.startClientX;
      this.targetX = this.startTargetX + deltaX * 1.35;

      const now = performance.now();
      const dt = Math.max(now - this.lastTime, 12);
      this.dragVelocity = (clientX - this.lastClientX) / dt;
      this.lastClientX = clientX;
      this.lastTime = now;
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.trackEl.style.cursor = 'grab';

      // Inertial release throw
      if (Math.abs(this.dragVelocity) > 0.1) {
        this.targetX += this.dragVelocity * 220;
      }
    };

    this.addTrackedListener(this.trackEl, 'mousedown', onStart as EventListener);
    this.addTrackedListener(window, 'mousemove', onMove as EventListener);
    this.addTrackedListener(window, 'mouseup', onEnd as EventListener);

    this.addTrackedListener(this.trackEl, 'touchstart', onStart as EventListener, { passive: true });
    this.addTrackedListener(window, 'touchmove', onMove as EventListener, { passive: true });
    this.addTrackedListener(window, 'touchend', onEnd as EventListener);

    // Wheel
    this.addTrackedListener(this.trackEl, 'wheel', ((e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      this.targetX -= delta * 1.5;
    }) as EventListener, { passive: false });

    // Window resize
    this.addTrackedListener(window, 'resize', () => this.resizeCanvas());

    // Click item navigation
    this.cardElements.forEach((card, idx) => {
      this.addTrackedListener(card, 'click', (e) => {
        if (this.hasDragged || Math.abs(this.velocity) > 0.8) return;
        if (this.onSelectProduct) {
          e.preventDefault();
          this.onSelectProduct(this.products[idx]);
        }
      });
    });
  }

  private addTrackedListener(target: EventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) {
    target.addEventListener(type, handler, options);
    this.boundEvents.push({ target, type, handler: handler as EventListenerOrEventListenerObject });
  }

  private loop(): void {
    if (!this.isRunning) return;

    // 1. Decoupled LERP Momentum Step
    const prevCurrent = this.currentX;
    this.currentX += (this.targetX - this.currentX) * this.lerpFactor;
    this.velocity = this.currentX - prevCurrent;

    // 2. Render WebGL Fluid Caustics
    if (this.gl && this.program) {
      const gl = this.gl;
      gl.useProgram(this.program);
      const time = (performance.now() - this.startTime) * 0.001;
      if (this.uTimeLoc) gl.uniform1f(this.uTimeLoc, time);
      if (this.uVelocityLoc) gl.uniform1f(this.uVelocityLoc, this.velocity);
      if (this.uResolutionLoc) gl.uniform2f(this.uResolutionLoc, this.canvas.width, this.canvas.height);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // 3. Modulo Loop & Fluid Wave Card Transforms
    const trackCenter = window.innerWidth / 2;
    const clampedVelocity = Math.max(-12, Math.min(12, this.velocity));

    // Dynamic Chromatic Aberration offset (Red & Cyan split)
    const rgbSplit = clampedVelocity * 1.8;

    this.cardElements.forEach((card, i) => {
      const rawX = this.currentX + i * this.effectiveWidth;
      let wrappedX = ((rawX % this.trackWidth) + this.trackWidth) % this.trackWidth;
      wrappedX -= this.trackWidth / 2 - trackCenter;

      const distFromCenter = Math.abs(wrappedX - trackCenter);
      const normalizedDist = Math.min(distFromCenter / (window.innerWidth * 0.7), 1);
      const scale = 1.0 - normalizedDist * 0.12;
      const opacity = 1.0 - Math.pow(normalizedDist, 3) * 0.65;

      // Gel wave vertical deflection
      const waveY = Math.sin(wrappedX * 0.0035 + performance.now() * 0.002) * 16 + (Math.abs(clampedVelocity) * 2.5);

      // Liquid shear angle & tilt
      const shearAngle = clampedVelocity * -0.9;
      const tiltAngle = (wrappedX - trackCenter) * 0.015;

      card.style.transform = `translate3d(${wrappedX}px, ${waveY}px, 0) scale(${scale}) skewX(${shearAngle}deg) rotate(${tiltAngle}deg)`;
      card.style.opacity = opacity.toString();

      // Real-time RGB Chromatic Aberration Dispersion on Drag
      if (Math.abs(clampedVelocity) > 0.4) {
        card.style.boxShadow = `
          ${rgbSplit}px 0 18px rgba(233, 78, 27, 0.45),
          ${-rgbSplit}px 0 18px rgba(0, 180, 216, 0.35),
          0 20px 45px rgba(38, 22, 18, 0.15)
        `;
      } else {
        card.style.boxShadow = '0 20px 45px rgba(38, 22, 18, 0.12), 0 2px 8px rgba(38, 22, 18, 0.06)';
      }
    });

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public destroy(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);

    this.boundEvents.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.boundEvents = [];

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}
