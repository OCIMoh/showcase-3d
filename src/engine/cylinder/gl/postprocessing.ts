/**
 * PostProcessingManager — WebGL FBO Offscreen Pipeline & Fullscreen Blit (Phase 5)
 */

import { POST_VERTEX_SHADER, POST_FRAGMENT_SHADER } from './postShaders';

export interface PostProcessingUniforms {
  uSceneTexture: WebGLUniformLocation;
  uTime: WebGLUniformLocation;
  uVelocity: WebGLUniformLocation;
  uGrainIntensity: WebGLUniformLocation;
  uAberrationScale: WebGLUniformLocation;
  uVignette: WebGLUniformLocation;
  uResolution: WebGLUniformLocation;
}

export class PostProcessingManager {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private uniforms!: PostProcessingUniforms;
  private aPosition = -1;

  private fbo: WebGLFramebuffer | null = null;
  private colorTexture: WebGLTexture | null = null;
  private depthRenderbuffer: WebGLRenderbuffer | null = null;
  private quadBuffer: WebGLBuffer | null = null;

  private width = 0;
  private height = 0;
  private isSupported = false;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.init();
  }

  private init(): void {
    const gl = this.gl;
    const prog = this.createProgram(POST_VERTEX_SHADER, POST_FRAGMENT_SHADER);
    if (!prog) {
      console.warn('[PostProcessingManager] Shader compile failed, falling back to direct render');
      return;
    }

    this.program = prog;
    this.aPosition = gl.getAttribLocation(prog, 'aPosition');
    this.uniforms = {
      uSceneTexture: gl.getUniformLocation(prog, 'uSceneTexture')!,
      uTime: gl.getUniformLocation(prog, 'uTime')!,
      uVelocity: gl.getUniformLocation(prog, 'uVelocity')!,
      uGrainIntensity: gl.getUniformLocation(prog, 'uGrainIntensity')!,
      uAberrationScale: gl.getUniformLocation(prog, 'uAberrationScale')!,
      uVignette: gl.getUniformLocation(prog, 'uVignette')!,
      uResolution: gl.getUniformLocation(prog, 'uResolution')!
    };

    // Full-screen clip-space quad buffer (2 triangles covering [-1, -1] to [1, 1])
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    const quadVertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    // Create FBO, texture attachment, and depth renderbuffer
    this.fbo = gl.createFramebuffer();
    this.colorTexture = gl.createTexture();
    this.depthRenderbuffer = gl.createRenderbuffer();

    this.isSupported = true;
  }

  public resize(width: number, height: number): void {
    if (!this.isSupported || width <= 0 || height <= 0) return;
    if (this.width === width && this.height === height) return;

    this.width = width;
    this.height = height;

    const gl = this.gl;

    // Configure texture attachment
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Configure depth renderbuffer attachment
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    // Bind attachments to FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.colorTexture,
      0
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.depthRenderbuffer
    );

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.warn('[PostProcessingManager] Incomplete framebuffer status:', status);
      this.isSupported = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  /**
   * Binds offscreen FBO for scene rendering. Returns true if FBO is active.
   */
  public bind(): boolean {
    if (!this.isSupported || !this.fbo) return false;
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    return true;
  }

  /**
   * Restores the default on-screen framebuffer.
   */
  public unbind(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * Renders the post-processed quad to screen.
   */
  public render(params: {
    time: number;
    velocity: number;
    grainIntensity: number;
    aberrationScale: number;
    vignette: number;
  }): void {
    if (!this.isSupported || !this.program || !this.quadBuffer) return;

    const gl = this.gl;
    gl.useProgram(this.program);

    gl.uniform1f(this.uniforms.uTime, params.time);
    gl.uniform1f(this.uniforms.uVelocity, params.velocity);
    gl.uniform1f(this.uniforms.uGrainIntensity, params.grainIntensity);
    gl.uniform1f(this.uniforms.uAberrationScale, params.aberrationScale);
    gl.uniform1f(this.uniforms.uVignette, params.vignette);
    gl.uniform2f(this.uniforms.uResolution, this.width, this.height);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.uniform1i(this.uniforms.uSceneTexture, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.enableVertexAttribArray(this.aPosition);
    gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, 0, 0);

    // Disable depth testing for screen-space composite
    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.enable(gl.DEPTH_TEST);

    if (this.aPosition >= 0) {
      gl.disableVertexAttribArray(this.aPosition);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  public dispose(): void {
    const gl = this.gl;
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    if (this.colorTexture) gl.deleteTexture(this.colorTexture);
    if (this.depthRenderbuffer) gl.deleteRenderbuffer(this.depthRenderbuffer);
    if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
    if (this.program) gl.deleteProgram(this.program);
    this.isSupported = false;
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  private createProgram(vSrc: string, fSrc: string): WebGLProgram | null {
    const gl = this.gl;
    const vShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vShader, vSrc);
    gl.compileShader(vShader);
    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
      console.error('[PostProcessing] Vertex compile error:', gl.getShaderInfoLog(vShader));
      return null;
    }

    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fShader, fSrc);
    gl.compileShader(fShader);
    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
      console.error('[PostProcessing] Fragment compile error:', gl.getShaderInfoLog(fShader));
      return null;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[PostProcessing] Program link error:', gl.getProgramInfoLog(prog));
      return null;
    }

    return prog;
  }
}
