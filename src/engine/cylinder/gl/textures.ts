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
  private nextTextures: (WebGLTexture | null)[] = [];
  private galleryTextures: Map<string, (WebGLTexture | null)[]> = new Map();
  private fallbackTexture: WebGLTexture;
  private disposed = false;

  // Asymmetric multi-image cycling with Liquid Shader Ripple Transitions (Option 2)
  private projects: ShowcaseProject[] = [];
  private projectSlides: Map<number, HTMLCanvasElement[]> = new Map();
  private currentSlideIdx: Map<number, number> = new Map();
  private nextSwapTime: Map<number, number> = new Map();
  private transitionStartTime: Map<number, number> = new Map();
  private transitionProgress: Map<number, number> = new Map();
  private previouslyVisibleCards: Set<number> = new Set();
  private readonly TRANSITION_DURATION = 680; // ms duration of liquid ripple

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
   * Loads all images per project and sets up staggered slideshow cycling and video streams.
   */
  public initPreviewTextures(projects: ShowcaseProject[]): (WebGLTexture | null)[] {
    this.projects = projects;
    const gl = this.gl;

    this.nextTextures = [];
    this.transitionStartTime.clear();
    this.transitionProgress.clear();

    this.previewTextures = projects.map((proj, idx) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);

      const initialCanvas = this.renderProjectTexture(proj, idx);
      this.uploadTexture(tex!, initialCanvas);

      const nextTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, nextTex);
      this.uploadTexture(nextTex!, initialCanvas);
      this.nextTextures[idx] = nextTex;

      this.transitionProgress.set(idx, 0.0);

      // Initialize asymmetric staggered slide swap schedule across cards (~1.5s intervals)
      this.currentSlideIdx.set(idx, 0);
      const initialWarmup = 1500 + (idx * 1500);
      this.nextSwapTime.set(idx, performance.now() + initialWarmup);

      // Collect all image sources for this project
      const sources: string[] = [];
      if (proj.galleryImages && proj.galleryImages.length > 0) {
        sources.push(...proj.galleryImages);
      }
      if (sources.length === 0 && proj.previewImageUrl) {
        sources.push(proj.previewImageUrl);
      }

      const slides: HTMLCanvasElement[] = [];
      this.projectSlides.set(idx, slides);

      sources.forEach((src, imgIdx) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (this.disposed) return;
          const composite = this.renderProjectTexture(proj, idx, img);
          slides[imgIdx] = composite;
          if (imgIdx === 0) {
            this.uploadTexture(tex!, composite);
            if (this.nextTextures[idx]) {
              this.uploadTexture(this.nextTextures[idx]!, composite);
            }
          }
        };
        img.src = src;
      });

      return tex;
    });

    return this.previewTextures;
  }

  /**
   * Called every animation frame from engine tick.
   * Manages asymmetric multi-image cycling with Liquid Ripple Transitions (Option 2).
   * Strict Concurrency Lock: Exactly ONE card in the carousel ripples at any given millisecond.
   * Viewport-Aware: ONLY cards currently in view on screen can trigger ripples.
   */
  public update(now: number, visibleIndices: number[] = [], isRapidScrolling = false): void {
    if (this.disposed) return;

    // 1. Process active liquid transition to completion (at most 1 active card across the carousel)
    for (let idx = 0; idx < this.projects.length; idx++) {
      if (!this.transitionStartTime.has(idx)) continue;

      const startTime = this.transitionStartTime.get(idx)!;
      const elapsed = now - startTime;
      const rawP = Math.min(1.0, elapsed / this.TRANSITION_DURATION);

      // Smooth cubic ease-in-out for liquid displacement dynamics
      const easeP = rawP * rawP * (3.0 - 2.0 * rawP);
      this.transitionProgress.set(idx, easeP);

      if (rawP >= 1.0) {
        // Transition complete: Swap texture handles so incoming texture becomes current
        const temp = this.previewTextures[idx];
        this.previewTextures[idx] = this.nextTextures[idx];
        this.nextTextures[idx] = temp;

        this.transitionProgress.set(idx, 0.0);
        this.transitionStartTime.delete(idx);

        // Dwell interval: 1.5 seconds (1500ms + subtle 250ms organic jitter)
        const nextDwell = 1500 + (Math.random() * 250);
        this.nextSwapTime.set(idx, now + nextDwell);
      }
    }

    // 2. Grant a 1.5s viewing window to cards entering the viewport from off-screen
    // (Prevents a card from rippling the instant it touches the edge of the screen)
    for (const idx of visibleIndices) {
      if (!this.previouslyVisibleCards.has(idx)) {
        const currentTarget = this.nextSwapTime.get(idx);
        if (currentTarget === undefined || currentTarget < now + 1200) {
          this.nextSwapTime.set(idx, now + 1500 + Math.random() * 250);
        }
      }
    }
    this.previouslyVisibleCards = new Set(visibleIndices);

    // 3. Concurrency Lock: If any card is actively transitioning, DO NOT start another
    if (this.transitionStartTime.size > 0) return;

    // 4. Motion Gate: Pause new transitions while the user is actively flinging/spinning
    if (isRapidScrolling) return;

    // 5. Initiate next transition ONLY on cards currently visible to the user
    for (const idx of visibleIndices) {
      const slides = this.projectSlides.get(idx);
      if (!slides || slides.length <= 1) continue;
      if (this.transitionStartTime.has(idx)) continue;

      const targetTime = this.nextSwapTime.get(idx);
      if (targetTime !== undefined && now >= targetTime) {
        const curIdx = ((this.currentSlideIdx.get(idx) || 0) + 1) % slides.length;
        const nextCanvas = slides[curIdx];
        const nextTex = this.nextTextures[idx];

        if (nextTex && nextCanvas) {
          this.currentSlideIdx.set(idx, curIdx);
          this.uploadTexture(nextTex, nextCanvas);
          this.transitionStartTime.set(idx, now);
          this.transitionProgress.set(idx, 0.001);
          // Lock claimed for this frame — only ONE visible card initiates
          break;
        } else {
          // If slide canvas hasn't finished loading yet, nudge target by 800ms
          this.nextSwapTime.set(idx, now + 800);
        }
      }
    }
  }

  public getPreviewTexture(index: number): WebGLTexture {
    return this.previewTextures[index] || this.fallbackTexture;
  }

  public getNextTexture(index: number): WebGLTexture {
    return this.nextTextures[index] || this.fallbackTexture;
  }

  public getTransitionProgress(index: number): number {
    return this.transitionProgress.get(index) || 0.0;
  }

  /**
   * Preload all key assets with progress callback for Animax Loader.
   */
  public async preloadAllAssets(
    onProgress?: (loaded: number, total: number, name: string) => void
  ): Promise<void> {
    const urls: { name: string; url: string }[] = [];

    this.projects.forEach(p => {
      if (p.galleryImages && p.galleryImages.length > 0) {
        p.galleryImages.forEach(u => urls.push({ name: p.name, url: u }));
      } else if (p.previewImageUrl) {
        urls.push({ name: p.name, url: p.previewImageUrl });
      }
    });

    const total = urls.length + 1; // +1 for fonts
    let loaded = 0;

    const report = (name: string) => {
      loaded++;
      if (onProgress) {
        onProgress(loaded, total, name);
      }
    };

    // Wait for document fonts
    try {
      await document.fonts.ready;
      report('Typography Fonts');
    } catch {
      report('Typography Fonts');
    }

    // Preload image promises in parallel
    const promises = urls.map(item => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = item.url;
        img.onload = () => {
          report(item.name);
          resolve();
        };
        img.onerror = () => {
          report(item.name);
          resolve();
        };
      });
    });

    await Promise.all(promises);
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
   * Renders the preview card composite canvas (non-destructively cropped to remove right scrollbars).
   */
  public renderProjectTexture(
    proj: ShowcaseProject,
    idx: number,
    img?: HTMLImageElement
  ): HTMLCanvasElement {
    const c = document.createElement('canvas');

    if (img && img.complete && img.naturalWidth > 0) {
      // Non-destructively crop off the browser scrollbar captured on the right edge
      const isScreenshot = img.naturalWidth === 1310 || (img.src && !img.src.includes('images.unsplash.com'));
      const cropRight = isScreenshot ? 18 : 0;
      const cropW = Math.max(10, img.naturalWidth - cropRight);

      if (img.naturalHeight > cropW * 1.2) {
        // Full-page scroll captures: display top hero viewport at 1.95:1
        const cropH = Math.round(cropW / 1.95);
        c.width = cropW;
        c.height = cropH;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
      } else {
        // 100% full uncropped image at exact natural resolution minus the scrollbar
        c.width = cropW;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, cropW, img.naturalHeight, 0, 0, cropW, img.naturalHeight);
      }
      return c;
    }

    c.width = 1310 - 18;
    c.height = 671;
    const ctx = c.getContext('2d')!;
    this.renderPlaceholderBackdrop(ctx, c.width, c.height);
    return c;
  }

  /**
   * Renders slide cards for the 3D barrel gallery (non-destructively cropped to remove right scrollbars).
   */
  public renderGalleryCard(
    proj: ShowcaseProject,
    slideIdx: number,
    img?: HTMLImageElement
  ): HTMLCanvasElement {
    const c = document.createElement('canvas');

    if (img && img.complete && img.naturalWidth > 0) {
      // Non-destructively crop off the browser scrollbar captured on the right edge
      const isScreenshot = img.naturalWidth === 1310 || (img.src && !img.src.includes('images.unsplash.com'));
      const cropRight = isScreenshot ? 18 : 0;
      const cropW = Math.max(10, img.naturalWidth - cropRight);

      if (img.naturalHeight > cropW * 1.2) {
        // Full-page scroll captures: display top hero viewport at 1.95:1
        const cropH = Math.round(cropW / 1.95);
        c.width = cropW;
        c.height = cropH;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
      } else {
        // 100% full uncropped image at exact natural resolution minus the scrollbar
        c.width = cropW;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, cropW, img.naturalHeight, 0, 0, cropW, img.naturalHeight);
      }
      return c;
    }

    c.width = 1310 - 18;
    c.height = 671;
    const ctx = c.getContext('2d')!;
    this.renderPlaceholderBackdrop(ctx, c.width, c.height);
    return c;
  }

  /**
   * Renders floating typography panels with strictly transparent background and deep authentic domain content.
   * 0: INTENT (Hero statement, brand tagline, location / allocation)
   * 1: CRAFT & PROCESS (Story steps, fragrance pyramid, or technical execution)
   * 2: COLOPHON (Swiss 2-column tabular specs: alloy core, flacon, charter, tour seats)
   * 3: ARCHIVE (Authentic founder / tester quote & catalog provenance)
   */
  public renderTypographyPanel(proj: ShowcaseProject, type: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    const ctx = c.getContext('2d')!;

    // Strictly 100% transparent background — ZERO box/card
    ctx.clearRect(0, 0, 2048, 1024);

    if (type === 0) {
      // INTENT: Left-anchored design statement with negative space on the right
      ctx.save();
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText(`INTENT // ${(proj.brand || proj.name).toUpperCase()}`, 140, 220);
      ctx.restore();

      ctx.fillStyle = 'rgba(18, 18, 18, 0.18)';
      ctx.fillRect(140, 240, 60, 2);

      const headline = proj.heroHeadline || proj.title.split('—')[0].trim();
      ctx.font = '700 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#111111';
      wrapText(ctx, headline, 140, 360, 1360, 80, 2);

      ctx.font = '400 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.76)';
      const intentBody = proj.tagline ? `“${proj.tagline}” — ${proj.description}` : proj.description;
      wrapText(ctx, intentBody, 140, 540, 1360, 52, 4);

      if (proj.location || proj.pricing?.price) {
        ctx.font = '600 22px monospace';
        ctx.fillStyle = 'rgba(18, 18, 18, 0.45)';
        const metaText = proj.location
          ? `LOCATION: ${proj.location.toUpperCase()} · ${proj.contact?.phone || ''}`
          : `EDITION: ${proj.pricing?.price} · ${proj.pricing?.allocation || proj.pricing?.scarcity || 'ACTIVE'}`;
        ctx.fillText(metaText, 140, 820);
      }

    } else if (type === 1) {
      // CRAFT / HIGHLIGHTS / PROCESS: Multi-phase narrative
      ctx.save();
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('CRAFT & PROCESS', 520, 220);
      ctx.restore();

      ctx.font = '700 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#111111';
      const subTitle = proj.storySteps
        ? 'Sequential Execution & Story'
        : (proj.fragrancePyramid ? 'Olfactory Scent Architecture' : 'Structural Observations & Execution');
      ctx.fillText(subTitle, 520, 330);

      if (proj.storySteps && proj.storySteps.length > 0) {
        let startY = 430;
        for (let i = 0; i < Math.min(3, proj.storySteps.length); i++) {
          const step = proj.storySteps[i];
          ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.fillStyle = '#111111';
          ctx.fillText(step.step, 520, startY);

          ctx.font = '400 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.fillStyle = 'rgba(18, 18, 18, 0.78)';
          wrapText(ctx, `${step.headline} — ${step.body}`, 520, startY + 40, 1380, 40, 2);
          startY += 120;
        }
      } else if (proj.fragrancePyramid && proj.fragrancePyramid.length > 0) {
        let startY = 430;
        for (let i = 0; i < Math.min(3, proj.fragrancePyramid.length); i++) {
          const pyr = proj.fragrancePyramid[i];
          ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.fillStyle = '#111111';
          ctx.fillText(`${pyr.layer} — ${pyr.title}`, 520, startY);

          ctx.font = '400 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.fillStyle = 'rgba(18, 18, 18, 0.78)';
          wrapText(ctx, pyr.notes, 520, startY + 40, 1380, 40, 2);
          startY += 120;
        }
      } else {
        const highlights = proj.highlights || [];
        let startY = 440;
        for (let i = 0; i < Math.min(3, highlights.length); i++) {
          ctx.font = '400 30px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.fillStyle = 'rgba(18, 18, 18, 0.78)';
          ctx.fillText('—', 520, startY);
          wrapText(ctx, highlights[i], 560, startY, 1340, 44, 2);
          startY += 96;
        }
      }

    } else if (type === 2) {
      // COLOPHON / SPECIFICATIONS: Swiss 2-column tabular rail
      ctx.save();
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('COLOPHON // SPECIFICATIONS', 140, 200);
      ctx.restore();

      const specs: Array<{ label: string; value: string }> = [];
      if (proj.specs) {
        for (const [k, v] of Object.entries(proj.specs)) {
          specs.push({ label: k.toUpperCase(), value: v });
        }
      }
      if (specs.length === 0) {
        specs.push(
          { label: 'DISCIPLINE', value: proj.category || 'Creative Engineering / 3D WebGL' },
          { label: 'STACK', value: proj.techStack?.join('   ·   ') || 'TypeScript · WebGL · GLSL · GSAP' },
          { label: 'METRICS', value: proj.metrics || 'Production Build · 60 FPS Locked' },
          { label: 'RELEASE', value: `${proj.year || '2026'} Edition // ${proj.client || 'Studio'}` }
        );
      }

      let rowY = 320;
      for (const spec of specs.slice(0, 4)) {
        ctx.fillStyle = 'rgba(18, 18, 18, 0.08)';
        ctx.fillRect(140, rowY - 50, 1760, 1.5);

        ctx.save();
        ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = 'rgba(18, 18, 18, 0.45)';
        if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.14em';
        ctx.fillText(spec.label, 140, rowY);
        ctx.restore();

        ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#121212';
        ctx.fillText(spec.value, 540, rowY);

        rowY += 120;
      }

    } else {
      // ARCHIVE / MANIFESTO: Literary monograph quote & provenance
      ctx.save();
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('ARCHIVE // FIELD MANIFESTO', 140, 240);
      ctx.restore();

      ctx.font = 'italic 400 44px Georgia, "Times New Roman", serif';
      ctx.fillStyle = '#181818';
      const quoteText = proj.quote?.text
        ? `“${proj.quote.text}”`
        : '“An exploration in continuous spatial momentum, procedural vertex deformation, and tactile digital physics.”';
      wrapText(ctx, quoteText, 140, 370, 1480, 66, 3);

      ctx.font = '500 22px monospace';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.45)';
      const prov = proj.quote?.author
        ? `— ${proj.quote.author.toUpperCase()}${proj.quote.role ? `, ${proj.quote.role.toUpperCase()}` : ''} // ${(proj.brand || proj.name).toUpperCase()}`
        : `STUDIO ARCHIVE // ${proj.name.toUpperCase()} — CATALOG // RELEASE ${proj.year || '2026'}`;
      ctx.fillText(prov, 140, 680);
    }

    return c;
  }

  public destroy(): void {
    this.disposed = true;
    const gl = this.gl;
    this.previewTextures.forEach(t => t && gl.deleteTexture(t));
    this.nextTextures.forEach(t => t && gl.deleteTexture(t));
    this.galleryTextures.forEach(list => list.forEach(t => t && gl.deleteTexture(t)));
    this.projectSlides.clear();
    this.nextSwapTime.clear();
    this.previouslyVisibleCards.clear();
    this.transitionStartTime.clear();
    this.transitionProgress.clear();
  }
}
