/**
 * Carousel Render Pass: Oval Arc Geometry, Back-to-Front Depth Sorting, Center Scale, and Screen Hit-Testing
 */

import { Mat4, mat4Identity, mat4Translate, mat4RotateY, mat4Scale, mat4Multiply, mat4Create, projectPoint, pointInConvexPolygon, clamp } from '../math/mat4';
import { ProgramInfo } from '../gl/program';
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
  private programInfo: ProgramInfo;
  private config: CylinderConfig;
  private textureManager: TextureManager;
  private modelMat = mat4Create();
  private mvpMat = mat4Create();

  constructor(
    gl: WebGLRenderingContext,
    programInfo: ProgramInfo,
    config: CylinderConfig,
    textureManager: TextureManager
  ) {
    this.gl = gl;
    this.programInfo = programInfo;
    this.config = config;
    this.textureManager = textureManager;
  }

  public render(params: CarouselDrawParams, numIndices: number): void {
    const gl = this.gl;
    const u = this.programInfo.uniforms;
    const cfg = this.config;
    const numItems = params.projects.length;
    const loopWidth = numItems * cfg.spacing;

    const cardsToDraw: CardDraw[] = [];

    for (let i = 0; i < numItems; i++) {
      const isHero = i === params.activeHeroIndex;

      let wrappedX = (i * cfg.spacing + params.pos) % loopWidth;
      wrappedX = ((wrappedX % loopWidth) + loopWidth) % loopWidth;
      if (wrappedX > loopWidth / 2) wrappedX -= loopWidth;

      const angle = wrappedX / cfg.radiusX;

      if (!isHero && Math.abs(angle) > cfg.maxAngle) {
        continue;
      }

      let x = Math.sin(angle) * cfg.radiusX;
      let z = (Math.cos(angle) - 1.0) * cfg.radiusZ;
      let rotY = angle * cfg.ovalRatio;

      let baseScale = 1.0;
      const angularSpan = (cfg.spacing / cfg.radiusX) * cfg.angularSpanFactor;
      if (Math.abs(angle) < angularSpan) {
        const t = Math.abs(angle) / angularSpan;
        const centerBonus = cfg.centerBonusScale * Math.pow(Math.cos(t * Math.PI * 0.5), 2.0);
        baseScale += centerBonus;
      }

      let scale = baseScale;
      let wrapAmount = 1.0;
      let dimFactor = 1.0;
      let opacity = 1.0;

      if (isHero) {
        x = x * (1.0 - params.heroOpenAmount);
        z = z * (1.0 - params.heroOpenAmount) + 1.8 * params.heroOpenAmount;
        rotY = rotY * (1.0 - params.heroOpenAmount);
        scale = baseScale + 1.25 * params.heroOpenAmount;
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

    for (const card of cardsToDraw) {
      // Per-draw uniforms guaranteed set for every draw call (No uniform leakage)
      gl.uniform1f(u.uIsBarrelGallery, 0.0);
      gl.uniform1f(u.uWrapAmount, card.wrapAmount);
      gl.uniform1f(u.uVelocity, params.velocity);
      gl.uniform1f(u.uOpacity, card.opacity);
      gl.uniform1f(u.uDimFactor, card.dimFactor);
      gl.uniform1f(u.uAspect, params.meshAspect);
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
      mat4Scale(this.modelMat, this.modelMat, [card.scale, card.scale, 1.0]);
      gl.uniformMatrix4fv(u.uModel, false, this.modelMat);

      // Bind Texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.textureManager.getPreviewTexture(card.index));
      gl.uniform1i(u.uTexture, 0);

      gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
    }
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
    screenW: number,
    screenH: number
  ): ShowcaseProject | null {
    const cfg = this.config;
    const numItems = projects.length;
    const loopWidth = numItems * cfg.spacing;

    mat4Multiply(this.mvpMat, projMat, viewMat);

    let bestProject: ShowcaseProject | null = null;
    let bestDepth = Infinity;

    const hw = cfg.cardWidth * 0.5;
    const hh = cfg.cardHeight * 0.5;

    for (let i = 0; i < numItems; i++) {
      let wrappedX = (i * cfg.spacing + pos) % loopWidth;
      wrappedX = ((wrappedX % loopWidth) + loopWidth) % loopWidth;
      if (wrappedX > loopWidth / 2) wrappedX -= loopWidth;

      const angle = wrappedX / cfg.radiusX;
      if (Math.abs(angle) > cfg.maxAngle) continue;

      const x = Math.sin(angle) * cfg.radiusX;
      const z = (Math.cos(angle) - 1.0) * cfg.radiusZ;
      const rotY = angle * cfg.ovalRatio;

      let scale = 1.0;
      const angularSpan = (cfg.spacing / cfg.radiusX) * cfg.angularSpanFactor;
      if (Math.abs(angle) < angularSpan) {
        const t = Math.abs(angle) / angularSpan;
        scale += cfg.centerBonusScale * Math.pow(Math.cos(t * Math.PI * 0.5), 2.0);
      }

      mat4Identity(this.modelMat);
      mat4Translate(this.modelMat, this.modelMat, [x, 0, z]);
      mat4RotateY(this.modelMat, this.modelMat, rotY);
      mat4Scale(this.modelMat, this.modelMat, [scale, scale, 1.0]);

      const cardMVP = mat4Create();
      mat4Multiply(cardMVP, this.mvpMat, this.modelMat);

      const p1 = projectPoint(cardMVP, -hw, hh, 0, screenW, screenH);
      const p2 = projectPoint(cardMVP, hw, hh, 0, screenW, screenH);
      const p3 = projectPoint(cardMVP, hw, -hh, 0, screenW, screenH);
      const p4 = projectPoint(cardMVP, -hw, -hh, 0, screenW, screenH);

      if (!p1 || !p2 || !p3 || !p4) continue;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const screenQuad: [number, number][] = [
        [p1[0] / dpr, p1[1] / dpr],
        [p2[0] / dpr, p2[1] / dpr],
        [p3[0] / dpr, p3[1] / dpr],
        [p4[0] / dpr, p4[1] / dpr]
      ];

      if (pointInConvexPolygon(clientX, clientY, screenQuad)) {
        const avgZ = (p1[2] + p2[2] + p3[2] + p4[2]) * 0.25;
        if (avgZ < bestDepth) {
          bestDepth = avgZ;
          bestProject = projects[i];
        }
      }
    }

    return bestProject;
  }
}
