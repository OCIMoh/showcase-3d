/**
 * WebGL Texture Management, Canvas Compositing, Lazy-loading, and Mipmaps
 */

import { ShowcaseProject } from '../../../data/showcaseProjects';

/**
 * Editorial text wrapping helper for 2D canvas typography rendering.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1 && n < words.length - 1) {
        ctx.fillText((line + words.slice(n + 1).join(' ')).trim(), x, currentY);
        return currentY;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

export class TextureManager {
  private gl: WebGLRenderingContext;
  private isWebGL2: boolean;
  private potCanvas: HTMLCanvasElement;
  private potCtx: CanvasRenderingContext2D;

  private previewTextures: (WebGLTexture | null)[] = [];
  private galleryTextures: Map<string, (WebGLTexture | null)[]> = new Map();
  private fallbackTexture: WebGLTexture;
  private disposed = false;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.isWebGL2 =
      typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

    this.potCanvas = document.createElement('canvas');
    this.potCanvas.width = 2048;
    this.potCanvas.height = 1024;
    this.potCtx = this.potCanvas.getContext('2d')!;

    // Create 1x1 fallback texture
    this.fallbackTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.fallbackTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([15, 15, 15, 255])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  public getFallbackTexture(): WebGLTexture {
    return this.fallbackTexture;
  }

  /**
   * Initializes preview card textures for the carousel (100% full uncropped images).
   */
  public initPreviewTextures(projects: ShowcaseProject[]): (WebGLTexture | null)[] {
    const gl = this.gl;
    this.previewTextures = projects.map((proj, idx) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);

      const initialCanvas = this.renderProjectTexture(proj, idx);
      this.uploadTexture(tex!, initialCanvas);

      if (proj.previewImageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (this.disposed) return;
          const composite = this.renderProjectTexture(proj, idx, img);
          this.uploadTexture(tex!, composite);
        };
        img.src = proj.previewImageUrl;
      }
      return tex;
    });

    return this.previewTextures;
  }

  public getPreviewTexture(index: number): WebGLTexture {
    return this.previewTextures[index] || this.fallbackTexture;
  }

  /**
   * Lazy-loads and retrieves gallery textures for the given active project.
   * Interleaves 4 image slides with 4 asymmetric typography panels:
   * [Img 0, Text 0 (INTENT), Img 1, Text 1 (HIGHLIGHTS), Img 2, Text 2 (COLOPHON), Img 3, Text 3 (ARCHIVE)]
   */
  public getGalleryTextures(proj: ShowcaseProject): (WebGLTexture | null)[] {
    if (this.galleryTextures.has(proj.slug)) {
      return this.galleryTextures.get(proj.slug)!;
    }

    const gl = this.gl;
    const texList: (WebGLTexture | null)[] = [];

    // 8 items total in the continuous vertical column
    for (let i = 0; i < 8; i++) {
      const tex = gl.createTexture();
      if (i % 2 === 1) {
        // Typography panel: Render and upload synchronously with transparent background
        const textCanvas = this.renderTypographyPanel(proj, Math.floor(i / 2));
        this.uploadTexture(tex!, textCanvas);
      } else {
        // Image card: Initial placeholder canvas
        const imgCanvas = this.renderGalleryCard(proj, Math.floor(i / 2));
        this.uploadTexture(tex!, imgCanvas);
      }
      texList.push(tex);
    }
    this.galleryTextures.set(proj.slug, texList);

    // Asynchronously load image assets for the 4 image slides (slots 0, 2, 4, 6)
    const images: string[] = [];
    if (proj.galleryImages && proj.galleryImages.length > 0) {
      images.push(...proj.galleryImages);
    }
    if (images.length === 0 && proj.previewImageUrl) {
      images.push(proj.previewImageUrl);
    }
    if (images.length === 0) {
      images.push('/touche-1.png');
    }

    const slideSources: string[] = [
      images[0],
      images[1 % images.length],
      images[2 % images.length],
      images[3 % images.length]
    ];

    slideSources.forEach((src, imgIdx) => {
      const slotIdx = imgIdx * 2; // 0, 2, 4, 6
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (this.disposed) return;
        const cached = this.galleryTextures.get(proj.slug);
        if (!cached || !cached[slotIdx]) return;
        const canvas = this.renderGalleryCard(proj, imgIdx, img);
        this.uploadTexture(cached[slotIdx]!, canvas);
      };
      img.src = src;
    });

    return texList;
  }

  /**
   * Uploads canvas to WebGL texture with power-of-two resizing or WebGL2 mipmaps.
   */
  private uploadTexture(texture: WebGLTexture, sourceCanvas: HTMLCanvasElement): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    try {
      if (this.isWebGL2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      } else {
        // Resize to 2048x1024 power-of-two for WebGL1 hardware mipmapping
        this.potCtx.clearRect(0, 0, 2048, 1024);
        this.potCtx.drawImage(sourceCanvas, 0, 0, 2048, 1024);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.potCanvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      }
    } catch {
      // Fallback for drivers that reject NPOT or mipmaps
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  }

  /**
   * Fallback backdrop while image assets are loading.
   */
  private renderPlaceholderBackdrop(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0c0d12');
    bgGrad.addColorStop(0.5, '#14161f');
    bgGrad.addColorStop(1, '#090a0d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Renders the preview card composite canvas (100% full uncropped image).
   */
  public renderProjectTexture(
    proj: ShowcaseProject,
    idx: number,
    img?: HTMLImageElement
  ): HTMLCanvasElement {
    const c = document.createElement('canvas');

    if (img && img.complete && img.naturalWidth > 0) {
      if (img.naturalHeight > img.naturalWidth * 1.2) {
        // Full-page scroll captures: display top hero viewport at 1.95:1
        const cropH = Math.round(img.naturalWidth / 1.95);
        c.width = img.naturalWidth;
        c.height = cropH;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, img.naturalWidth, cropH, 0, 0, img.naturalWidth, cropH);
      } else {
        // 100% full uncropped image at exact natural resolution
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
      }
      return c;
    }

    c.width = 1310;
    c.height = 671;
    const ctx = c.getContext('2d')!;
    this.renderPlaceholderBackdrop(ctx, c.width, c.height);
    return c;
  }

  /**
   * Renders slide cards for the 3D barrel gallery (100% full uncropped image).
   */
  public renderGalleryCard(
    proj: ShowcaseProject,
    slideIdx: number,
    img?: HTMLImageElement
  ): HTMLCanvasElement {
    const c = document.createElement('canvas');

    if (img && img.complete && img.naturalWidth > 0) {
      if (img.naturalHeight > img.naturalWidth * 1.2) {
        // Full-page scroll captures: display top hero viewport at 1.95:1
        const cropH = Math.round(img.naturalWidth / 1.95);
        c.width = img.naturalWidth;
        c.height = cropH;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, img.naturalWidth, cropH, 0, 0, img.naturalWidth, cropH);
      } else {
        // 100% full uncropped image at exact natural resolution
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
      }
      return c;
    }

    c.width = 1310;
    c.height = 671;
    const ctx = c.getContext('2d')!;
    this.renderPlaceholderBackdrop(ctx, c.width, c.height);
    return c;
  }

  /**
   * Renders floating typography panels with strictly transparent background (Option C - Pure Typographic Hierarchy).
   * 0: INTENT (Left-anchored design statement with negative space on right)
   * 1: HIGHLIGHTS (Right-staggered architectural observations with delicate dashes)
   * 2: COLOPHON (Swiss 2-column tabular credit rail)
   * 3: ARCHIVE (Literary monograph quote & provenance)
   */
  public renderTypographyPanel(proj: ShowcaseProject, type: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    const ctx = c.getContext('2d')!;

    // 1. Strictly 100% transparent background — ZERO box/card
    ctx.clearRect(0, 0, 2048, 1024);

    if (type === 0) {
      // INTENT: Left-anchored design statement with negative space on the right
      ctx.save();
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('INTENT', 140, 220);
      ctx.restore();

      ctx.fillStyle = 'rgba(18, 18, 18, 0.18)';
      ctx.fillRect(280, 212, 60, 2);

      const headline = proj.title.split('—')[0].trim();
      ctx.font = '700 68px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#111111';
      wrapText(ctx, headline, 140, 360, 1260, 84, 2);

      ctx.font = '400 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.72)';
      wrapText(ctx, proj.description, 140, 530, 1260, 52, 4);

    } else if (type === 1) {
      // HIGHLIGHTS: Right-staggered architectural observations
      ctx.save();
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('HIGHLIGHTS', 520, 220);
      ctx.restore();

      ctx.font = '700 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#111111';
      ctx.fillText('Structural Observations & Execution', 520, 330);

      const highlights = proj.highlights && proj.highlights.length > 0
        ? proj.highlights
        : [
            'Full-bleed widescreen viewport without letterbox cropping',
            'Subdivided 32×32 vertex displacement in custom GLSL',
            'Continuous spatial momentum with haptic traversal'
          ];

      let startY = 440;
      for (let i = 0; i < Math.min(3, highlights.length); i++) {
        ctx.font = '400 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(18, 18, 18, 0.78)';
        ctx.fillText('—', 520, startY);
        wrapText(ctx, highlights[i], 560, startY, 1340, 44, 2);
        startY += 88;
      }

    } else if (type === 2) {
      // COLOPHON: Swiss 2-column tabular credit rail
      ctx.save();
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('COLOPHON', 140, 200);
      ctx.restore();

      const specs = [
        { label: 'DISCIPLINE', value: proj.category || 'Creative Engineering / 3D WebGL' },
        { label: 'STACK', value: proj.techStack?.join('   ·   ') || 'TypeScript · WebGL · GLSL · GSAP' },
        { label: 'METRICS', value: proj.metrics || 'Production Build · 60 FPS Locked' },
        { label: 'RELEASE', value: `${proj.year || '2026'} Edition // ${proj.client || 'Studio'}` }
      ];

      let rowY = 320;
      for (const spec of specs) {
        ctx.fillStyle = 'rgba(18, 18, 18, 0.08)';
        ctx.fillRect(140, rowY - 50, 1760, 1.5);

        ctx.save();
        ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(18, 18, 18, 0.45)';
        if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.14em';
        ctx.fillText(spec.label, 140, rowY);
        ctx.restore();

        ctx.font = '500 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#121212';
        ctx.fillText(spec.value, 500, rowY);

        rowY += 120;
      }

    } else {
      // ARCHIVE: Literary monograph quote & provenance
      ctx.save();
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('ARCHIVE', 140, 240);
      ctx.restore();

      ctx.font = 'italic 400 44px Georgia, "Times New Roman", serif';
      ctx.fillStyle = '#181818';
      wrapText(
        ctx,
        '“An exploration in continuous spatial momentum, procedural vertex deformation, and tactile digital physics.”',
        140,
        370,
        1480,
        66,
        3
      );

      ctx.font = '500 22px monospace';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.45)';
      const prov = `STUDIO ARCHIVE // ${proj.name.toUpperCase()} — CATALOG // RELEASE ${proj.year || '2026'}`;
      ctx.fillText(prov, 140, 680);
    }

    return c;
  }

  public destroy(): void {
    this.disposed = true;
    const gl = this.gl;
    this.previewTextures.forEach(t => t && gl.deleteTexture(t));
    this.previewTextures = [];

    this.galleryTextures.forEach(list => list.forEach(t => t && gl.deleteTexture(t)));
    this.galleryTextures.clear();

    if (this.fallbackTexture) {
      gl.deleteTexture(this.fallbackTexture);
    }
  }
}
