/**
 * Carousel Render Pass: Oval Arc Geometry, Back-to-Front Depth Sorting, Center Scale, and Screen Hit-Testing
 * Dedicated to CarouselPass with isolated CarouselProgramInfo.
 */

import { Mat4, mat4Identity, mat4Translate, mat4RotateY, mat4Scale, mat4Multiply, mat4Create, projectPoint, pointInConvexPolygon, clamp } from '../math/mat4';
import { CarouselProgramInfo } from '../gl/program';
import { CylinderConfig } from '../core/config';
import { ShowcaseProject } from '../../../data/showcaseProjects';
import { TextureManager } from '../gl/textures';

export interface CarouselDrawParams {
  projects: ShowcaseProject[];
  pos: number;
  velocity: number;
  heroOpenAmount: number;
  activeHeroIndex: number;
  pullAmount: number;
  clickPos: [number, number];
  meshAspect: number;
  reducedMotion: boolean;
  responsiveScale?: number;
  lightPos?: [number, number, number];
  now?: number;
  spatialBlur?: number;
  vignette?: number;
  atmosphereDim?: number;
}

interface CardDraw {
  index: number;
  isHero: boolean;
  x: number;
  z: number;
  rotY: number;
  scale: number;
  wrapAmount: number;
  opacity: number;
  dimFactor: number;
  viewZ: number;
}

export class CarouselPass {
  private gl: WebGLRenderingContext;
  private programInfo: CarouselProgramInfo;
  private config: CylinderConfig;
  private textureManager: TextureManager;
  private modelMat = mat4Create();
  private mvpMat = mat4Create();

  constructor(
    gl: WebGLRenderingContext,
    programInfo: CarouselProgramInfo,
    config: CylinderConfig,
    textureManager: TextureManager
  ) {
    this.gl = gl;
    this.programInfo = programInfo;
    this.config = config;
    this.textureManager = textureManager;
  }

  public render(
    params: CarouselDrawParams,
    numIndices: number,
    projMat: Mat4,
    viewMat: Mat4
  ): void {
    const gl = this.gl;
    const u = this.programInfo.uniforms;
    const cfg = this.config;
    const rScale = params.responsiveScale ?? 1.0;
    const numItems = params.projects.length;
    const spacing = cfg.spacing * rScale;
    const radiusX = cfg.radiusX * rScale;
    let radiusZ = cfg.radiusZ * rScale;
    // On portrait screens, enrich cylinder depth so the barrel curvature is dramatic and tactile
    if (rScale < 0.85) {
      radiusZ *= 1.0 + (0.85 - rScale) * 0.55;
    }
    const loopWidth = numItems * spacing;

    // 1. Activate dedicated Carousel Shader Program
    gl.useProgram(this.programInfo.program);

    // 2. Bind Camera Matrices & Carousel Radius
    gl.uniformMatrix4fv(u.uProjection, false, projMat);
    gl.uniformMatrix4fv(u.uView, false, viewMat);
    // Bind base unscaled radius to preserve proportional, smooth mesh curvature across card width
    gl.uniform1f(u.uPanelRadius, cfg.radiusX);

    // 3. Dynamic Cursor Spotlight Light Position (for Satin Specular Sheen)
    const lx = params.lightPos ? params.lightPos[0] : 0.0;
    const ly = params.lightPos ? params.lightPos[1] : 0.0;
    const lz = params.lightPos ? params.lightPos[2] : 2.5;
    gl.uniform3f(u.uLightPos, lx, ly, lz);

    // 4. Native GPU Spatial Shader Uniforms (Depth-of-field, Vignette, Atmosphere)
    gl.uniform1f(u.uSpatialBlur, params.spatialBlur ?? 0.0);
    gl.uniform1f(u.uVignette, params.vignette ?? 0.0);
    gl.uniform1f(u.uAtmosphereDim, params.atmosphereDim ?? 0.0);

    const cardsToDraw: CardDraw[] = [];

    for (let i = 0; i < numItems; i++) {
      const isHero = i === params.activeHeroIndex;

      let wrappedX = (i * spacing + params.pos) % loopWidth;
      wrappedX = ((wrappedX % loopWidth) + loopWidth) % loopWidth;
      if (wrappedX > loopWidth / 2) wrappedX -= loopWidth;

      const angle = wrappedX / radiusX;

      if (!isHero && Math.abs(angle) > cfg.maxAngle) {
        continue;
      }

      let x = Math.sin(angle) * radiusX;
      let z = (Math.cos(angle) - 1.0) * radiusZ;
      let rotY = angle * cfg.ovalRatio;

      let baseScale = rScale;
      const angularSpan = (spacing / radiusX) * cfg.angularSpanFactor;
      if (Math.abs(angle) < angularSpan) {
        const t = Math.abs(angle) / angularSpan;
        const centerBonus = cfg.centerBonusScale * Math.pow(Math.cos(t * Math.PI * 0.5), 2.0);
        baseScale += centerBonus * rScale;
      }

      let scale = baseScale;
      let wrapAmount = 1.0;
      let dimFactor = 1.0;
      let opacity = 1.0;

      if (isHero) {
        x = x * (1.0 - params.heroOpenAmount);
        z = z * (1.0 - params.heroOpenAmount) + 1.8 * params.heroOpenAmount;
        rotY = rotY * (1.0 - params.heroOpenAmount);
        scale = baseScale * (1.0 + 1.25 * params.heroOpenAmount);
        wrapAmount = 1.0 - params.heroOpenAmount;
        dimFactor = 1.0 - params.heroOpenAmount * 0.6;
        opacity = 1.0;
      } else {
        opacity = 1.0 - params.heroOpenAmount * 1.5;
        if (opacity < 0.001) continue;

        const angleRatio = Math.abs(angle) / cfg.maxAngle;
        const edgeFade = clamp(1.0 - Math.pow(angleRatio, 2.8), 0.0, 1.0);
        dimFactor = clamp(1.0 - angleRatio * 0.55, 0.35, 1.0);
        opacity *= edgeFade;

        if (opacity < 0.01) continue;
      }

      const viewZ = z + cfg.cameraZ;

      cardsToDraw.push({
        index: i,
        isHero,
        x,
        z,
        rotY,
        scale,
        wrapAmount,
        opacity,
        dimFactor,
        viewZ
      });
    }

    // Sort back-to-front (lowest viewZ is farther from camera, drawn first)
    cardsToDraw.sort((a, b) => a.viewZ - b.viewZ);

    // Viewport-aware multi-image liquid transitions:
    // Only cards actually in view on-screen (opacity > 0.25 and not hidden behind case study) are eligible to ripple
    const nowMs = params.now ?? performance.now();
    const isRapidScrolling = Math.abs(params.velocity) > 0.12;
    const isHeroActive = params.heroOpenAmount > 0.15;

    const visibleIndices: number[] = isHeroActive
      ? []
      : cardsToDraw
          .filter(c => c.opacity > 0.25 && !c.isHero)
          .sort((a, b) => Math.abs(a.rotY) - Math.abs(b.rotY)) // Center-most cards first
          .map(c => c.index);

    this.textureManager.update(nowMs, visibleIndices, isRapidScrolling);

    for (const card of cardsToDraw) {
      gl.uniform1f(u.uWrapAmount, card.wrapAmount);
      gl.uniform1f(u.uVelocity, params.velocity);
      gl.uniform1f(u.uOpacity, card.opacity);
      gl.uniform1f(u.uDimFactor, card.dimFactor);
      gl.uniform1f(u.uReducedMotion, params.reducedMotion ? 1.0 : 0.0);

      if (card.isHero) {
        gl.uniform2f(u.uClickPos, params.clickPos[0], params.clickPos[1]);
        gl.uniform1f(u.uPullAmount, params.pullAmount);
        const smoothHeroDim = clamp((params.heroOpenAmount - 0.05) / 0.95, 0.0, 1.0);
        gl.uniform1f(u.uIsHeroBackdrop, smoothHeroDim);
      } else {
        gl.uniform2f(u.uClickPos, 0.0, 0.0);
        gl.uniform1f(u.uPullAmount, 0.0);
        gl.uniform1f(u.uIsHeroBackdrop, 0.0);
      }

      // Model Matrix
      mat4Identity(this.modelMat);
      mat4Translate(this.modelMat, this.modelMat, [card.x, 0, card.z]);
      mat4RotateY(this.modelMat, this.modelMat, card.rotY);
      mat4Scale(this.modelMat, this.modelMat, [card.scale, card.scale, card.scale]);
      gl.uniformMatrix4fv(u.uModel, false, this.modelMat);

      // Bind Textures: Texture 0 = Current Slide, Texture 1 = Incoming Slide
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textureManager.getPreviewTexture(card.index));
      gl.uniform1i(u.uTexture, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.textureManager.getNextTexture(card.index));
      gl.uniform1i(u.uTextureNext, 1);

      gl.uniform1f(u.uTransitionProgress, this.textureManager.getTransitionProgress(card.index));

      gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
    }

    gl.activeTexture(gl.TEXTURE0);
  }

  /**
   * Raycast/Projective Quad Hit-Testing: Projects each visible card's 4 vertices
   * to screen space and checks point-in-convex-polygon.
   */
  public hitTest(
    clientX: number,
    clientY: number,
    projects: ShowcaseProject[],
    pos: number,
    projMat: Mat4,
    viewMat: Mat4,
    canvasWidth: number,
    canvasHeight: number,
    responsiveScale = 1.0
  ): ShowcaseProject | null {
    const cfg = this.config;
    const rScale = responsiveScale;
    const numItems = projects.length;
    const spacing = cfg.spacing * rScale;
    const radiusX = cfg.radiusX * rScale;
    let radiusZ = cfg.radiusZ * rScale;
    if (rScale < 0.85) {
      radiusZ *= 1.0 + (0.85 - rScale) * 0.55;
    }
    const loopWidth = numItems * spacing;
    const halfW = (cfg.cardWidth * rScale) / 2;
    const halfH = (cfg.cardHeight * rScale) / 2;

    const visibleHits: { proj: ShowcaseProject; viewZ: number }[] = [];

    for (let i = 0; i < numItems; i++) {
      let wrappedX = (i * spacing + pos) % loopWidth;
      wrappedX = ((wrappedX % loopWidth) + loopWidth) % loopWidth;
      if (wrappedX > loopWidth / 2) wrappedX -= loopWidth;

      const angle = wrappedX / radiusX;
      if (Math.abs(angle) > cfg.maxAngle) continue;

      const x = Math.sin(angle) * radiusX;
      const z = (Math.cos(angle) - 1.0) * radiusZ;
      const rotY = angle * cfg.ovalRatio;

      let scale = 1.0;
      const angularSpan = (spacing / radiusX) * cfg.angularSpanFactor;
      if (Math.abs(angle) < angularSpan) {
        const t = Math.abs(angle) / angularSpan;
        scale += cfg.centerBonusScale * Math.pow(Math.cos(t * Math.PI * 0.5), 2.0);
      }

      mat4Identity(this.modelMat);
      mat4Translate(this.modelMat, this.modelMat, [x, 0, z]);
      mat4RotateY(this.modelMat, this.modelMat, rotY);
      mat4Scale(this.modelMat, this.modelMat, [scale, scale, scale]);

      mat4Multiply(this.mvpMat, viewMat, this.modelMat);
      mat4Multiply(this.mvpMat, projMat, this.mvpMat);

      const p0 = projectPoint(this.mvpMat, -halfW,  halfH, 0, canvasWidth, canvasHeight);
      const p1 = projectPoint(this.mvpMat,  halfW,  halfH, 0, canvasWidth, canvasHeight);
      const p2 = projectPoint(this.mvpMat,  halfW, -halfH, 0, canvasWidth, canvasHeight);
      const p3 = projectPoint(this.mvpMat, -halfW, -halfH, 0, canvasWidth, canvasHeight);

      if (p0 && p1 && p2 && p3 && pointInConvexPolygon(clientX, clientY, [
        [p0[0], p0[1]],
        [p1[0], p1[1]],
        [p2[0], p2[1]],
        [p3[0], p3[1]]
      ])) {
        visibleHits.push({ proj: projects[i], viewZ: z + cfg.cameraZ });
      }
    }

    if (visibleHits.length === 0) return null;
    visibleHits.sort((a, b) => b.viewZ - a.viewZ);
    return visibleHits[0].proj;
  }
}
