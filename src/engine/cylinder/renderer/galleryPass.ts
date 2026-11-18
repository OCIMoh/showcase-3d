/**
 * Gallery Render Pass: 3D Vertical Cylinder Barrel Gallery (Inside Active Case Study)
 * Dedicated to GalleryPass with isolated GalleryProgramInfo.
 */

import { Mat4, mat4Identity, mat4Translate, mat4Scale, mat4Create, clamp } from '../math/mat4';
import { GalleryProgramInfo } from '../gl/program';
import { CylinderConfig } from '../core/config';
import { ShowcaseProject } from '../../../data/showcaseProjects';
import { TextureManager } from '../gl/textures';

export interface GalleryDrawParams {
  activeProject: ShowcaseProject;
  galleryPos: number;
  galleryVelocity: number;
  galleryCurve: number;
  galleryEntrance: number;
  galleryOffsetX?: number;
  heroOpenAmount: number;
  meshAspect: number;
  reducedMotion: boolean;
  responsiveScale?: number;
}

export class GalleryPass {
  private gl: WebGLRenderingContext;
  private programInfo: GalleryProgramInfo;
  private config: CylinderConfig;
  private textureManager: TextureManager;
  private modelMat = mat4Create();

  constructor(
    gl: WebGLRenderingContext,
    programInfo: GalleryProgramInfo,
    config: CylinderConfig,
    textureManager: TextureManager
  ) {
    this.gl = gl;
    this.programInfo = programInfo;
    this.config = config;
    this.textureManager = textureManager;
  }

  public render(
    params: GalleryDrawParams,
    numIndices: number,
    projMat: Mat4,
    viewMat: Mat4
  ): void {
    if (params.heroOpenAmount <= 0.08) return;

    const gl = this.gl;
    const u = this.programInfo.uniforms;
    const cfg = this.config;

    // Clear depth buffer so vertical barrel gallery is never occluded by hero plane
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // 1. Activate dedicated Gallery Shader Program
    gl.useProgram(this.programInfo.program);

    const rScale = params.responsiveScale ?? 1.0;

    // 2. Bind Camera Matrices & Barrel Geometry Uniforms
    gl.uniformMatrix4fv(u.uProjection, false, projMat);
    gl.uniformMatrix4fv(u.uView, false, viewMat);
    gl.uniform1f(u.uBarrelRadius, cfg.barrelRadius * rScale);
    gl.uniform1f(u.uOvalFlatness, cfg.ovalFlatness);
    gl.uniform1f(u.uCurveAmount, params.galleryCurve);

    const gTextures = this.textureManager.getGalleryTextures(params.activeProject);
    const numG = gTextures.length;

    // Entrance spacing: arrives fully curved, with doubled gaps and zero opacity, and relaxes into place
    const entranceSpacingMult = 1.0 + (1.0 - params.galleryEntrance);
    const gSpacing = cfg.gallerySpacing * rScale * entranceSpacingMult;
    const galLoopHeight = numG * gSpacing;

    const offsetX = params.galleryOffsetX ?? 0;

    for (let g = 0; g < numG; g++) {
      let wrappedY = (g * gSpacing + params.galleryPos) % galLoopHeight;
      wrappedY = ((wrappedY % galLoopHeight) + galLoopHeight) % galLoopHeight;
      if (wrappedY > galLoopHeight / 2) wrappedY -= galLoopHeight;

      const distY = Math.abs(wrappedY);

      // Soft-edged band only at the extreme off-screen margins to avoid loop pops
      // Cards anywhere on screen are 100% solid and vibrant with ZERO white haze
      const maxBand = galLoopHeight * 0.48;
      const fadeStart = 4.8 * rScale;
      let bandOpacity = 1.0;
      if (distY > fadeStart) {
        bandOpacity = clamp(1.0 - (distY - fadeStart) / (maxBand - fadeStart), 0.0, 1.0);
      }

      const gOpacity = bandOpacity *
                       params.heroOpenAmount *
                       clamp(params.galleryEntrance * 1.35, 0.0, 1.0);
      if (gOpacity < 0.01) continue;

      gl.uniform1f(u.uMeshOffsetY, wrappedY);
      gl.uniform1f(u.uOpacity, gOpacity);
      gl.uniform1f(u.uDimFactor, 1.0);

      mat4Identity(this.modelMat);
      mat4Translate(this.modelMat, this.modelMat, [offsetX, wrappedY, 1.2]);
      mat4Scale(this.modelMat, this.modelMat, [rScale, rScale, rScale]);
      gl.uniformMatrix4fv(u.uModel, false, this.modelMat);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gTextures[g] || this.textureManager.getFallbackTexture());
      gl.uniform1i(u.uTexture, 0);

      gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
    }
  }
}
