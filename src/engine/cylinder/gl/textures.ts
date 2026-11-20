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
   * Loads all images per project and sets up staggered slideshow cycling with liquid shader transitions.
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
   * Slot 0 is the dedicated Hero Title Panel with nice typography & one-liner.
   * Followed by alternating image slides and deep craft/colophon panels:
   * [Text 0 (HERO TITLE), Img 0, Text 1 (CRAFT & PROCESS), Img 1, Text 2 (COLOPHON), Img 2, Text 3 (ARCHIVE), Img 3]
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
      if (i === 0) {
        // Slot 0: Pure Sick Hero Title — Project Name with monumental typography
        const heroCanvas = this.renderHeroTitlePanel(proj);
        this.uploadTexture(tex!, heroCanvas);
      } else if (i % 2 === 0) {
        // Even slots 2, 4, 6: Scattered typography panels throughout the barrel
        // Slot 2: INTENT (The design statement, poetic tagline, and story)
        // Slot 4: COLOPHON (Swiss tabular specs, discipline, provenance, allocation)
        // Slot 6: ARCHIVE (Literary manifesto, field notes, quote)
        let panelType = 0;
        if (i === 2) panelType = 0;      // INTENT & Thesis statement
        else if (i === 4) panelType = 2; // COLOPHON & Specs
        else if (i === 6) panelType = 3; // ARCHIVE & Manifesto
        const textCanvas = this.renderTypographyPanel(proj, panelType);
        this.uploadTexture(tex!, textCanvas);
      } else {
        // Odd slots 1, 3, 5, 7: Image cards (Image 0 appears directly after the Hero Title)
        const imgIdx = Math.floor(i / 2); // 0, 1, 2, 3
        const imgCanvas = this.renderGalleryCard(proj, imgIdx);
        this.uploadTexture(tex!, imgCanvas);
      }
      texList.push(tex);
    }
    this.galleryTextures.set(proj.slug, texList);

    // Asynchronously load image assets for the 4 image slides (slots 1, 3, 5, 7)
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
      const slotIdx = imgIdx * 2 + 1; // slots 1, 3, 5, 7
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
   * Renders the Hero Title Panel as Slot 0 of the 3D barrel gallery.
   * Features:
   * - Monumental, sculptural typography for the Project Name (increased by 50% to 315px scale)
   * - 100% transparent canvas (zero boxes, zero gray card containers, zero clutter)
   * - Slop-free architectural kicker above and confident monograph line below
   * - Narrative text, specs, and quotes are scattered across subsequent typography
   *   panels (Slots 2, 4, 6) in the vertical barrel scroll.
   */
  public renderHeroTitlePanel(proj: ShowcaseProject): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    const ctx = c.getContext('2d')!;

    // Strictly transparent canvas — typography floats cleanly on paper backdrop
    ctx.clearRect(0, 0, 2048, 1024);

    const padX = 140;

    // 1. Pristine Architectural Kicker (Slop-free: no code slashes or telemetry)
    ctx.save();
    ctx.font = '600 24px monospace';
    ctx.fillStyle = 'rgba(18, 18, 18, 0.40)';
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.24em';
    const kicker = `OVERVIEW · ${(proj.category.split('//')[0].trim()).toUpperCase()} · ${(proj.year || '2026')}`;
    ctx.fillText(kicker, padX, 260);
    ctx.restore();

    // Subtle hairline accent under kicker
    ctx.fillStyle = 'rgba(18, 18, 18, 0.16)';
    ctx.fillRect(padX, 282, 80, 2);

    // 2. SICK HERO TITLE (Massive 315px scale — increased by 50%)
    const projectName = proj.title.split('—')[0].trim();
    let fontSize = Math.round(210 * 1.5); // 315px
    if (projectName.length > 8) fontSize = Math.round(160 * 1.5); // 240px
    if (projectName.length > 12) fontSize = Math.round(130 * 1.5); // 195px

    ctx.save();
    ctx.font = `800 ${fontSize}px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.fillStyle = '#0e0e0e';
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '-0.025em';
    const titleY = 570;
    ctx.fillText(projectName, padX, titleY);
    ctx.restore();

    // 3. Elegant Sub-Baseline Monogram & Provenance Kicker (Slop-free)
    ctx.save();
    ctx.font = '600 24px monospace';
    ctx.fillStyle = 'rgba(18, 18, 18, 0.45)';
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.20em';
    const provenance = `${(proj.brand || proj.name).toUpperCase()} — ${(proj.location || proj.client || 'ATELIER COLLECTION').toUpperCase()}`;
    ctx.fillText(provenance, padX, titleY + 95);
    ctx.restore();

    return c;
  }

  /**
   * Renders floating typography panels with strictly transparent background and deep authentic domain content.
   * Slop-free: zero code comment slashes (//), zero dev telemetry (60 FPS, GPU, WebGL stack), zero redundant titles.
   * 0: INTENT & THESIS (Poetic tagline, monograph narrative, allocation)
   * 1: CRAFT & PROCESS (Story steps, fragrance pyramid, or technical execution)
   * 2: COLOPHON (Swiss tabular specs: concentration, flacon, cap, allocation)
   * 3: ARCHIVE (Authentic founder quote & catalog provenance)
   */
  public renderTypographyPanel(proj: ShowcaseProject, type: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    const ctx = c.getContext('2d')!;

    // Strictly 100% transparent background — ZERO box/card
    ctx.clearRect(0, 0, 2048, 1024);

    if (type === 0) {
      // INTENT & THESIS: Literary statement & brand monograph (no duplicate title, no slop)
      ctx.save();
      ctx.font = '600 24px monospace';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText(`THESIS · ${(proj.brand || proj.name).toUpperCase()} PHILOSOPHY`, 140, 200);
      ctx.restore();

      ctx.fillStyle = 'rgba(18, 18, 18, 0.16)';
      ctx.fillRect(140, 222, 60, 2);

      // Poetic Tagline / Monograph Hook
      const tagline = proj.tagline
        ? `“${proj.tagline}”`
        : (proj.quote ? `“${proj.quote.text}”` : `“${proj.description.split('.')[0]}.”`);

      ctx.font = 'italic 400 48px Georgia, "Times New Roman", serif';
      ctx.fillStyle = '#0e0e0e';
      const afterTaglineY = wrapText(ctx, tagline, 140, 340, 1720, 66, 2);

      // Deep Brand Monograph Body
      ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.72)';
      wrapText(ctx, proj.description, 140, afterTaglineY + 36, 1720, 44, 3);

      // Edition Notes & Allocation (Bottom)
      const editionNotes = proj.pricing?.allocation || proj.pricing?.scarcity || (proj.location ? `ATELIER LOCATION: ${proj.location.toUpperCase()}` : `EDITION RELEASE: ${proj.year || '2026'}`);
      ctx.fillStyle = 'rgba(18, 18, 18, 0.10)';
      ctx.fillRect(140, 780, 1720, 1.5);

      ctx.save();
      ctx.font = '600 20px monospace';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.46)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.18em';
      ctx.fillText(`ALLOCATION & HARVEST: ${editionNotes.toUpperCase()}`, 140, 825);
      ctx.restore();

    } else if (type === 1) {
      // CRAFT / HIGHLIGHTS / PROCESS: Multi-phase narrative (Slop-free)
      ctx.save();
      ctx.font = '600 24px monospace';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('CRAFT · PROCESS & SENSORY ARCHITECTURE', 140, 200);
      ctx.restore();

      ctx.fillStyle = 'rgba(18, 18, 18, 0.16)';
      ctx.fillRect(140, 222, 60, 2);

      ctx.font = '700 44px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#111111';
      const subTitle = proj.storySteps
        ? 'Sequential Execution & Story'
        : (proj.fragrancePyramid ? 'Olfactory Scent Architecture' : 'Structural Observations & Atelier Execution');
      ctx.fillText(subTitle, 140, 310);

      if (proj.storySteps && proj.storySteps.length > 0) {
        let startY = 410;
        for (let i = 0; i < Math.min(3, proj.storySteps.length); i++) {
          const step = proj.storySteps[i];
          ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#111111';
          ctx.fillText(step.step, 140, startY);

          ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = 'rgba(18, 18, 18, 0.74)';
          wrapText(ctx, `${step.headline} — ${step.body}`, 140, startY + 36, 1720, 38, 2);
          startY += 120;
        }
      } else if (proj.fragrancePyramid && proj.fragrancePyramid.length > 0) {
        let startY = 410;
        for (let i = 0; i < Math.min(3, proj.fragrancePyramid.length); i++) {
          const pyr = proj.fragrancePyramid[i];
          ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#111111';
          ctx.fillText(`${pyr.layer} — ${pyr.title}`, 140, startY);

          ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = 'rgba(18, 18, 18, 0.74)';
          wrapText(ctx, pyr.notes, 140, startY + 36, 1720, 38, 2);
          startY += 120;
        }
      } else {
        const highlights = proj.highlights || [];
        let startY = 420;
        for (let i = 0; i < Math.min(3, highlights.length); i++) {
          ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = 'rgba(18, 18, 18, 0.74)';
          ctx.fillText('—', 140, startY);
          wrapText(ctx, highlights[i], 180, startY, 1680, 42, 2);
          startY += 96;
        }
      }

    } else if (type === 2) {
      // COLOPHON / SPECIFICATIONS: Swiss tabular specifications rail (Zero dev telemetry)
      ctx.save();
      ctx.font = '600 24px monospace';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('COLOPHON · SPECIFICATIONS & ATELIER CRAFT', 140, 200);
      ctx.restore();

      ctx.fillStyle = 'rgba(18, 18, 18, 0.16)';
      ctx.fillRect(140, 222, 60, 2);

      const specs: Array<{ label: string; value: string }> = [];
      if (proj.specs) {
        for (const [k, v] of Object.entries(proj.specs)) {
          specs.push({ label: k.toUpperCase(), value: v });
        }
      }
      if (specs.length === 0) {
        specs.push(
          { label: 'DISCIPLINE', value: (proj.category.split('//')[0].trim()).toUpperCase() },
          { label: 'PROVENANCE', value: (proj.client || proj.brand || 'Bespoke Atelier Commission').toUpperCase() },
          { label: 'MATERIAL CRAFT', value: 'Architectural Fluted Crystal & Honed Mineral Assembly' },
          { label: 'ALLOCATION', value: (proj.pricing?.allocation || proj.pricing?.scarcity || `${proj.year || '2026'} Archive Edition`).toUpperCase() }
        );
      }

      let rowY = 320;
      for (const spec of specs.slice(0, 4)) {
        ctx.fillStyle = 'rgba(18, 18, 18, 0.08)';
        ctx.fillRect(140, rowY - 50, 1760, 1.5);

        ctx.save();
        ctx.font = '600 20px monospace';
        ctx.fillStyle = 'rgba(18, 18, 18, 0.45)';
        if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.14em';
        ctx.fillText(spec.label, 140, rowY);
        ctx.restore();

        ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#121212';
        ctx.fillText(spec.value, 540, rowY);

        rowY += 120;
      }

    } else {
      // ARCHIVE / MANIFESTO: Literary monograph quote & provenance (Zero buzzword slop)
      ctx.save();
      ctx.font = '600 24px monospace';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.42)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.22em';
      ctx.fillText('ARCHIVE · MONOGRAPH MANIFESTO & FIELD NOTES', 140, 240);
      ctx.restore();

      ctx.fillStyle = 'rgba(18, 18, 18, 0.16)';
      ctx.fillRect(140, 262, 60, 2);

      ctx.font = 'italic 400 46px Georgia, "Times New Roman", serif';
      ctx.fillStyle = '#141414';
      const quoteText = proj.quote?.text
        ? `“${proj.quote.text}”`
        : '“Crafted for those who linger in memory long after they have gone. An enduring dedication to tactile permanence, raw materials, and quiet restraint.”';
      wrapText(ctx, quoteText, 140, 390, 1680, 68, 3);

      ctx.save();
      ctx.font = '600 20px monospace';
      ctx.fillStyle = 'rgba(18, 18, 18, 0.45)';
      if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.16em';
      const author = proj.quote?.author || proj.client || proj.brand || proj.name;
      const location = proj.location || 'Atelier Laboratory';
      const year = proj.year || '2026';
      ctx.fillText(`— ${author.toUpperCase()} · ${location.toUpperCase()} (${year})`, 140, 680);
      ctx.restore();
    }

    return c;
  }

  public destroy(): void {
    this.disposed = true;
    const gl = this.gl;
    if (this.fallbackTexture) {
      gl.deleteTexture(this.fallbackTexture);
    }
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
