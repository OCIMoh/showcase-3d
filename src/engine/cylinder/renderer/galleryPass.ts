/**
 * Gallery Render Pass: 3D Vertical Cylinder Barrel Gallery (Inside Active Case Study)
 */

import { mat4Identity, mat4Translate, mat4Create, clamp } from '../math/mat4';
import { ProgramInfo } from '../gl/program';
import { CylinderConfig } from '../core/config';
import { ShowcaseProject } from '../../../data/showcaseProjects';
import { TextureManager } from '../gl/textures';

export interface GalleryDrawParams {
  activeProject: ShowcaseProject;
  galleryPos: number;
  galleryVelocity: number;
  galleryCurve: number;
  heroOpenAmount: number;
  meshAspect: number;
  reducedMotion: boolean;
}

export class GalleryPass {
  private gl: WebGLRenderingContext;
  private programInfo: ProgramInfo;
  private config: CylinderConfig;
  private textureManager: TextureManager;
  private modelMat = mat4Create();

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

  public render(params: GalleryDrawParams, numIndices: number): void {
    if (params.heroOpenAmount <= 0.08) return;

    const gl = this.gl;
    const u = this.programInfo.uniforms;
    const cfg = this.config;

    // Clear depth buffer so vertical barrel gallery is never occluded by hero plane
    gl.clear(gl.DEPTH_BUFFER_BIT);

    const gTextures = this.textureManager.getGalleryTextures(params.activeProject);
    const numG = gTextures.length;
    const gSpacing = cfg.gallerySpacing;
    const galLoopHeight = numG * gSpacing;

    // Gallery pass uniforms guaranteed set (zeroed hero backdrop and click bulge)
    gl.uniform1f(u.uIsHeroBackdrop, 0.0);
    gl.uniform2f(u.uClickPos, 0.0, 0.0);
    gl.uniform1f(u.uPullAmount, 0.0);
    gl.uniform1f(u.uWrapAmount, 0.0);

    gl.uniform1f(u.uIsBarrelGallery, 1.0);
    gl.uniform1f(u.uBarrelRadius, cfg.barrelRadius);
    gl.uniform1f(u.uOvalFlatness, cfg.ovalFlatness);
    gl.uniform1f(u.uCurveAmount, params.galleryCurve);
    gl.uniform1f(u.uVelocity, params.galleryVelocity);
    gl.uniform1f(u.uAspect, params.meshAspect);
    gl.uniform1f(u.uReducedMotion, params.reducedMotion ? 1.0 : 0.0);

    for (let g = 0; g < numG; g++) {
      let wrappedY = (g * gSpacing + params.galleryPos) % galLoopHeight;
      wrappedY = ((wrappedY % galLoopHeight) + galLoopHeight) % galLoopHeight;
      if (wrappedY > galLoopHeight / 2) wrappedY -= galLoopHeight;

      const distY = Math.abs(wrappedY);
      const gOpacity = clamp(1.0 - distY / (galLoopHeight * 0.48), 0.0, 1.0) * params.heroOpenAmount;
      if (gOpacity < 0.01) continue;

      gl.uniform1f(u.uMeshOffsetY, wrappedY);
      gl.uniform1f(u.uOpacity, gOpacity);
      gl.uniform1f(u.uDimFactor, 1.0);

      mat4Identity(this.modelMat);
      mat4Translate(this.modelMat, this.modelMat, [0, wrappedY, 1.2]);
      gl.uniformMatrix4fv(u.uModel, false, this.modelMat);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gTextures[g] || this.textureManager.getFallbackTexture());
      gl.uniform1i(u.uTexture, 0);

      gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
    }
  }
}
