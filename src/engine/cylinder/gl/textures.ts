/**
 * WebGL Texture Management, Canvas Compositing, Cover-fit, Lazy-loading, and Mipmaps
 */

import { ShowcaseProject } from '../../../data/showcaseProjects';

/**
 * Universal safe rounded rectangle path generator for Canvas 2D.
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Draws an image with CSS object-fit: cover behavior onto a 2D canvas.
 */
export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number
): void {
  const hRatio = cw / img.naturalWidth;
  const vRatio = ch / img.naturalHeight;
  const ratio = Math.max(hRatio, vRatio);
  const nw = img.naturalWidth * ratio;
  const nh = img.naturalHeight * ratio;
  const ox = (cw - nw) / 2;
  const oy = (ch - nh) / 2;
  ctx.drawImage(img, ox, oy, nw, nh);
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
   * Initializes preview card textures for the carousel.
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
   */
  public getGalleryTextures(proj: ShowcaseProject): (WebGLTexture | null)[] {
    if (this.galleryTextures.has(proj.slug)) {
      return this.galleryTextures.get(proj.slug)!;
    }

    const gl = this.gl;
    const texList: (WebGLTexture | null)[] = [];

    for (let i = 0; i < 4; i++) {
      const tex = gl.createTexture();
      const initialCanvas = this.renderGalleryCard(proj, i);
      this.uploadTexture(tex!, initialCanvas);
      texList.push(tex);
    }
    this.galleryTextures.set(proj.slug, texList);

    // Asynchronously load image assets for each individual gallery slide
    const slideSources: (string | undefined)[] = [
      proj.galleryImages?.[0] || proj.previewImageUrl,
      proj.galleryImages?.[1] || proj.galleryImages?.[0] || proj.previewImageUrl,
      proj.galleryImages?.[2],
      proj.galleryImages?.[3]
    ];

    slideSources.forEach((src, idx) => {
      if (!src) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (this.disposed) return;
        const cached = this.galleryTextures.get(proj.slug);
        if (!cached || !cached[idx]) return;
        const canvas = this.renderGalleryCard(proj, idx, img);
        this.uploadTexture(cached[idx]!, canvas);
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
   * Renders the preview card composite canvas.
   */
  public renderProjectTexture(
    proj: ShowcaseProject,
    idx: number,
    img?: HTMLImageElement
  ): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 1600;
    c.height = 1000;
    const ctx = c.getContext('2d')!;

    // 1. Draw base photo or sophisticated obsidian backdrop with cover-fit
    if (img && img.complete && img.naturalWidth > 0) {
      drawCoverImage(ctx, img, c.width, c.height);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1000);
      bgGrad.addColorStop(0, '#0c0d11');
      bgGrad.addColorStop(0.5, '#13151c');
      bgGrad.addColorStop(1, '#090a0d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1600, 1000);

      const radGrad = ctx.createRadialGradient(800, 500, 50, 800, 500, 750);
      radGrad.addColorStop(0, (proj.color || '#3a86ff') + '33');
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, 1600, 1000);
    }

    // 2. Cinematic Gradient Overlay
    const overlayGrad = ctx.createLinearGradient(0, 0, 0, 1000);
    overlayGrad.addColorStop(0, 'rgba(8, 8, 12, 0.45)');
    overlayGrad.addColorStop(0.35, 'rgba(8, 8, 12, 0.15)');
    overlayGrad.addColorStop(0.65, 'rgba(8, 8, 12, 0.55)');
    overlayGrad.addColorStop(1, 'rgba(6, 6, 9, 0.92)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, 1600, 1000);

    // 3. Subtle Outer Border Glow
    ctx.strokeStyle = (proj.color || '#ffffff') + '33';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 1540, 940);

    // 4. Header Bar
    const padX = 80;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '600 22px monospace';
    ctx.fillText(`0${idx + 1} // ${proj.year}`, padX, 90);

    if (proj.isLive) {
      ctx.fillStyle = '#00ff66';
      ctx.beginPath();
      ctx.arc(1420, 82, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '600 18px monospace';
      ctx.fillText('LIVE DEPLOYMENT', 1435, 88);
    }

    // 5. Hero Project Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const cleanTitle = proj.title.split('—')[0].trim();
    ctx.fillText(cleanTitle, padX, 700);

    // 6. Category Tagline
    ctx.fillStyle = proj.color || '#00e5ff';
    ctx.font = '600 22px monospace';
    ctx.fillText(proj.category, padX, 745);

    // 7. Tech Stack Chips
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '500 20px monospace';
    const stackStr = proj.techStack.slice(0, 4).join('  ·  ');
    ctx.fillText(stackStr, padX, 790);

    // 8. Bottom Status Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 18px monospace';
    ctx.fillText(`[ ${proj.client.toUpperCase()} // ${proj.name} ]`, padX, 890);

    return c;
  }

  /**
   * Renders bespoke slide cards for the 3D barrel gallery.
   */
  public renderGalleryCard(
    proj: ShowcaseProject,
    slideIdx: number,
    img?: HTMLImageElement
  ): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 1600;
    c.height = 1000;
    const ctx = c.getContext('2d')!;

    if (slideIdx === 0) {
      // SLIDE 0: Brand Hero Banner with cover-fit
      if (img && img.complete && img.naturalWidth > 0) {
        drawCoverImage(ctx, img, c.width, c.height);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1000);
        bgGrad.addColorStop(0, '#0c0d12');
        bgGrad.addColorStop(1, '#151720');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1600, 1000);

        const radial = ctx.createRadialGradient(800, 500, 50, 800, 500, 800);
        radial.addColorStop(0, (proj.color || '#3a86ff') + '33');
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, 1600, 1000);
      }

      const grad = ctx.createLinearGradient(0, 0, 0, 1000);
      grad.addColorStop(0, 'rgba(10, 10, 14, 0.65)');
      grad.addColorStop(0.35, 'rgba(10, 10, 14, 0.25)');
      grad.addColorStop(0.65, 'rgba(10, 10, 14, 0.55)');
      grad.addColorStop(1, 'rgba(8, 8, 12, 0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1600, 1000);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '600 20px monospace';
      ctx.fillText(`[ REPOSITORY // ${proj.year} ]`, 90, 120);

      if (proj.isLive) {
        ctx.fillStyle = '#00ff66';
        ctx.beginPath();
        ctx.arc(1420, 114, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '600 18px monospace';
        ctx.fillText('LIVE DEPLOYMENT', 1435, 120);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const cleanTitle = proj.title.split('—')[0].trim();
      ctx.fillText(cleanTitle, 90, 680);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '400 28px -apple-system, BlinkMacSystemFont, sans-serif';
      const desc = proj.description || 'Modern web engineering and interactive digital showcase.';
      const words = desc.split(' ');
      let line = '';
      let descY = 740;
      for (const w of words) {
        const testLine = line ? `${line} ${w}` : w;
        if (ctx.measureText(testLine).width > 1250) {
          ctx.fillText(line, 90, descY);
          line = w;
          descY += 40;
        } else {
          line = testLine;
        }
      }
      if (line) ctx.fillText(line, 90, descY);

      const domain = proj.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const pillW = Math.max(180, ctx.measureText(domain).width + 60);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      drawRoundRect(ctx, 90, 870, pillW, 44, 22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 18px monospace';
      ctx.fillText(domain, 115, 898);
    } else if (slideIdx === 1) {
      // SLIDE 1: Interactive Capabilities & Feature Architecture
      ctx.fillStyle = '#fbf9f4';
      ctx.fillRect(0, 0, 1600, 1000);

      ctx.fillStyle = '#78756e';
      ctx.font = '600 20px monospace';
      ctx.fillText('CORE CAPABILITIES & SYSTEM MODULES', 90, 110);

      ctx.fillStyle = '#161618';
      ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText(`${proj.title.split('—')[0].trim()} Feature Architecture`, 90, 170);

      const features =
        proj.highlights && proj.highlights.length >= 3
          ? proj.highlights
          : [
              'High-performance 60 FPS WebGL shader pipeline',
              'Fluid state transitions and kinetic micro-animations',
              'Responsive multi-viewport touch architecture'
            ];

      let rowY = 270;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#f5c518';
        ctx.beginPath();
        ctx.arc(120, rowY + 12, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#121214';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(112, rowY + 12);
        ctx.lineTo(118, rowY + 18);
        ctx.lineTo(128, rowY + 7);
        ctx.stroke();

        ctx.fillStyle = '#161618';
        ctx.font = '600 24px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(features[i] || `Interactive Feature Module 0${i + 1}`, 160, rowY + 10);

        ctx.fillStyle = '#7a7770';
        ctx.font = '400 17px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('Verified Production Module · Zero Latency', 160, rowY + 38);

        ctx.fillStyle = '#9c9991';
        ctx.font = '500 15px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('Show details', 160, rowY + 62);

        ctx.strokeStyle = '#e6e3d9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(90, rowY + 95);
        ctx.lineTo(880, rowY + 95);
        ctx.stroke();

        rowY += 150;
      }

      ctx.fillStyle = '#18181a';
      ctx.font = '600 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(`Status: ${proj.metrics}`, 90, 890);

      ctx.fillStyle = '#121316';
      drawRoundRect(ctx, 960, 90, 550, 820, 24);
      ctx.fill();
      ctx.strokeStyle = '#25272e';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        drawRoundRect(ctx, 962, 92, 546, 560, 22);
        ctx.clip();
        const ir = Math.max(546 / img.naturalWidth, 560 / img.naturalHeight);
        const inw = img.naturalWidth * ir;
        const inh = img.naturalHeight * ir;
        ctx.drawImage(img, 962 + (546 - inw) / 2, 92 + (560 - inh) / 2, inw, inh);
        ctx.restore();
      } else {
        ctx.fillStyle = '#1a1b22';
        ctx.fillRect(962, 92, 546, 560);
        ctx.fillStyle = '#3a86ff';
        ctx.font = '600 24px monospace';
        ctx.fillText('// 3D PREVIEW', 1020, 360);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(proj.title.split('—')[0].trim(), 1000, 710);

      ctx.fillStyle = '#8f929d';
      ctx.font = '400 16px monospace';
      ctx.fillText(`ENGINE: WEBGL & PERSISTENT DOM`, 1000, 750);
      ctx.fillText(`BRANCH: main // 60 FPS`, 1000, 785);
      ctx.fillText(`CLIENT: ${proj.client.toUpperCase()}`, 1000, 820);

      ctx.fillStyle = '#00ff66';
      ctx.beginPath();
      ctx.arc(1005, 868, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 15px monospace';
      ctx.fillText('VERIFIED PRODUCTION DEPLOYMENT', 1020, 873);
    } else if (slideIdx === 2) {
      // SLIDE 2: Full-Stack Technical Specifications
      ctx.fillStyle = '#0f1014';
      ctx.fillRect(0, 0, 1600, 1000);

      ctx.strokeStyle = (proj.color || '#3a86ff') + '44';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, 1520, 920);

      ctx.fillStyle = proj.color || '#3a86ff';
      ctx.font = '600 20px monospace';
      ctx.fillText('SYSTEM ARCHITECTURE & DISCIPLINES // 02', 90, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('Full-Stack Technical Specifications', 90, 185);

      let chipX = 90;
      let chipY = 240;
      ctx.font = '600 18px monospace';
      for (const t of proj.techStack) {
        const tw = ctx.measureText(t).width + 44;
        if (chipX + tw > 1500) {
          chipX = 90;
          chipY += 56;
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        drawRoundRect(ctx, chipX, chipY, tw, 42, 21);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(t, chipX + 22, chipY + 27);
        chipX += tw + 16;
      }

      const panels = [
        { label: 'RUNTIME ENGINE', val: 'Native WebGL', note: 'Zero external 3D libraries' },
        { label: 'FRAME TIMINGS', val: '60 FPS Damped', note: 'Single RAF motion lerp factor' },
        { label: 'DEPLOYMENT CDN', val: 'Vercel Edge', note: 'Instant global asset caching' }
      ];

      for (let p = 0; p < 3; p++) {
        const px = 90 + p * 480;
        const py = 430;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        drawRoundRect(ctx, px, py, 440, 240, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = '600 16px monospace';
        ctx.fillText(panels[p].label, px + 32, py + 52);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(panels[p].val, px + 32, py + 115);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = '400 17px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(panels[p].note, px + 32, py + 165);
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      drawRoundRect(ctx, 90, 720, 1420, 180, 18);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '600 16px monospace';
      ctx.fillText('GIT REPOSITORY URL & ACCESS', 125, 770);

      ctx.fillStyle = '#ffffff';
      ctx.font = '500 24px monospace';
      ctx.fillText(proj.githubUrl, 125, 820);

      ctx.fillStyle = '#00ff66';
      ctx.font = '600 16px monospace';
      ctx.fillText('● PUBLIC REPOSITORY // FULL SOURCE AVAILABLE', 125, 865);
    } else {
      // SLIDE 3: Interactive Experience & Live Demonstration Reel
      ctx.fillStyle = '#14151b';
      ctx.fillRect(0, 0, 1600, 1000);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '600 20px monospace';
      ctx.fillText('PRODUCTION LAUNCH & DEPLOYMENT // 04', 90, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('Experience The Live Application', 90, 200);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '400 26px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(
        'Click the "View" link in the top-right corner to open the live production deployment.',
        90,
        260
      );

      ctx.fillStyle = '#090a0d';
      drawRoundRect(ctx, 90, 330, 1420, 520, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ff5f56';
      ctx.beginPath();
      ctx.arc(130, 375, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffbd2e';
      ctx.beginPath();
      ctx.arc(155, 375, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#27c93f';
      ctx.beginPath();
      ctx.arc(180, 375, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '500 16px monospace';
      ctx.fillText(`terminal // ${proj.name}`, 220, 381);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '500 22px monospace';
      ctx.fillText(`$ git clone ${proj.githubUrl}.git`, 130, 460);
      ctx.fillText(`$ cd ${proj.slug}`, 130, 510);
      ctx.fillText('$ npm install && npm run build', 130, 560);
      ctx.fillStyle = '#00ff66';
      ctx.fillText('✓ built in 0.95s — 0 errors, 100% test coverage', 130, 620);
      ctx.fillStyle = '#3a86ff';
      ctx.fillText(`➜ Live URL: ${proj.liveUrl}`, 130, 680);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '400 20px monospace';
      ctx.fillText('Ready for exploration. Use [ESC] or the close button to return to the carousel.', 130, 770);
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
