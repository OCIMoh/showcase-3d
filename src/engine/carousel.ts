/**
 * AgrumeaCarousel — High-Performance Floating Glass Jar Carousel
 * 10° Diagonal Incline, Decoupled LERP Momentum, 3D Cylindrical Label Projection,
 * Synchronized Typographic Seal Rotation, Responsive Resizing & Zero False Clicks
 */

import { Product } from '../data/products';

export interface CarouselItem {
  element: HTMLAnchorElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  product: Product;
  index: number;
  labelImg?: HTMLImageElement;
  labelLoaded: boolean;
}

export interface CarouselOptions {
  wrapper: HTMLElement;
  track: HTMLElement;
  badge?: HTMLElement | null;
  products: Product[];
  inclineAngle?: number;
  onSelectProduct?: (product: Product) => void;
  onUpdateTelemetry?: (data: { velocity: number; rotation: number }) => void;
}

export class AgrumeaCarousel {
  private wrapper: HTMLElement;
  private track: HTMLElement;
  private badge: HTMLElement | null;
  private products: Product[];
  private onSelectProduct?: (product: Product) => void;
  private onUpdateTelemetry?: (data: { velocity: number; rotation: number }) => void;

  public targetX = 0;
  public currentX = 0;
  private lerpFactor = 0.085;
  private itemWidth = 220;
  private itemSpacing = 40;
  private effectiveItemWidth = 260;
  private trackWidth: number = 2600;

  // Pointer drag tracking (Fix: False Clicks & Momentum Toss)
  private isDragging = false;
  private hasDragged = false;
  private startClientX = 0;
  private startClientY = 0;
  private startTargetX = 0;
  private lastClientX = 0;
  private lastTime = 0;
  private dragVelocity = 0;
  public velocity = 0;

  private items: CarouselItem[] = [];
  private isRunning = true;
  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject }[] = [];

  constructor(options: CarouselOptions) {
    this.wrapper = options.wrapper;
    this.track = options.track;
    this.badge = options.badge || null;
    this.products = options.products;
    this.onSelectProduct = options.onSelectProduct;
    this.onUpdateTelemetry = options.onUpdateTelemetry;

    const angle = options.inclineAngle !== undefined ? options.inclineAngle : 10;
    document.documentElement.style.setProperty('--jar-marquee-angle', `${angle}deg`);

    this.initDOM();
    this.updateDimensions();
    this.bindEvents();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  private initDOM(): void {
    this.track.innerHTML = '';
    this.items = [];

    this.products.forEach((prod, index) => {
      const item = document.createElement('a');
      item.className = 'jar-slider__item';
      item.href = `/dispensa/${prod.slug}`;
      item.setAttribute('aria-label', prod.title);
      item.dataset.index = index.toString();
      item.dataset.id = prod.id;

      item.innerHTML = `
        <img class="jar-slider__base" src="${prod.jarUrl}" alt="${prod.title}" loading="eager" />
        <canvas class="jar-slider__label" width="300" height="180" aria-hidden="true"></canvas>
      `;

      this.track.appendChild(item);

      const canvas = item.querySelector<HTMLCanvasElement>('.jar-slider__label');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const carouselItem: CarouselItem = {
        element: item,
        canvas,
        ctx,
        product: prod,
        index,
        labelLoaded: false
      };

      // Preload authentic cylindrical label texture
      if (prod.labelUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = prod.labelUrl;
        img.onload = () => {
          carouselItem.labelLoaded = true;
          carouselItem.labelImg = img;
          this.renderCylindricalLabel(carouselItem, this.currentX);
        };
      }

      this.items.push(carouselItem);
      this.renderCylindricalLabel(carouselItem, 0);
    });
  }

  /**
   * Dynamically calculate item dimensions on load and viewport resize (Fix 6)
   */
  public updateDimensions(): void {
    const first = this.items[0]?.element;
    if (first && first.offsetWidth > 0) {
      this.itemWidth = first.offsetWidth;
    } else {
      this.itemWidth = window.innerWidth <= 768 ? 160 : 200;
    }
    this.itemSpacing = Math.max(30, Math.round(window.innerWidth * 0.035));
    this.effectiveItemWidth = this.itemWidth + this.itemSpacing;
    this.trackWidth = this.products.length * this.effectiveItemWidth;
  }

  /**
   * 3D Cylindrical Label Canvas Projection with Specular & Shadow Lighting
   */
  private renderCylindricalLabel(item: CarouselItem, progress: number): void {
    const ctx = item.ctx;
    const w = item.canvas.width;
    const h = item.canvas.height;
    const prod = item.product;

    ctx.clearRect(0, 0, w, h);

    // Dynamic horizontal label shift based on jar rotation/incline
    const labelShift = Math.sin(progress * 0.0025 + item.index * 0.6) * 16;

    if (item.labelLoaded && item.labelImg) {
      ctx.save();
      ctx.drawImage(item.labelImg, labelShift, 0, w, h);

      // Overlay 3D Cylindrical Curvature & Glass Specular Lighting
      const lighting = ctx.createLinearGradient(0, 0, w, 0);
      lighting.addColorStop(0.0, 'rgba(0, 0, 0, 0.42)');
      lighting.addColorStop(0.18, 'rgba(0, 0, 0, 0.08)');
      lighting.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
      lighting.addColorStop(0.82, 'rgba(0, 0, 0, 0.08)');
      lighting.addColorStop(1.0, 'rgba(0, 0, 0, 0.45)');

      ctx.fillStyle = lighting;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else {
      // High-fidelity vector label fallback
      ctx.save();
      const bgColor = prod.category === 'sweet' ? '#d44213' : prod.category === 'spread' ? '#4a5d23' : '#762530';
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 6);
      ctx.fill();

      // Gold foil filigree border
      ctx.strokeStyle = '#e6c89f';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fdf3eb';

      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('AGRUMÊA FARM • SICILY', w / 2 + labelShift * 0.5, 36);

      ctx.font = '700 15px "Cinzel", serif';
      ctx.fillText(prod.title, w / 2 + labelShift, 72);

      ctx.font = 'italic 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(prod.latinSubtitle, w / 2 + labelShift * 0.8, 102);

      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${prod.weight} • ${prod.origin.split(',')[0]}`, w / 2 + labelShift * 0.5, 142);

      // Cylindrical Lighting
      const lighting = ctx.createLinearGradient(0, 0, w, 0);
      lighting.addColorStop(0.0, 'rgba(0, 0, 0, 0.42)');
      lighting.addColorStop(0.2, 'rgba(0, 0, 0, 0.05)');
      lighting.addColorStop(0.5, 'rgba(255, 255, 255, 0.22)');
      lighting.addColorStop(0.8, 'rgba(0, 0, 0, 0.05)');
      lighting.addColorStop(1.0, 'rgba(0, 0, 0, 0.45)');

      ctx.fillStyle = lighting;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  private addTrackedListener(target: EventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) {
    target.addEventListener(type, handler, options);
    this.boundEvents.push({ target, type, handler: handler as EventListenerOrEventListenerObject });
  }

  private bindEvents(): void {
    const onStart = (e: MouseEvent | TouchEvent) => {
      // Suspend drag when navigation menu is open (Fix 3)
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
      document.body.classList.add('grabbing');
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      if (document.body.classList.contains('is-nav-open')) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Track distance to reliably detect intentional drag vs click (Fix 2)
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
      document.body.classList.remove('grabbing');

      // Natural release inertia / throw (momentum continues and comes to a complete rest)
      if (Math.abs(this.dragVelocity) > 0.1) {
        this.targetX += this.dragVelocity * 200;
      }
    };

    this.addTrackedListener(this.wrapper, 'mousedown', onStart as EventListener);
    this.addTrackedListener(window, 'mousemove', onMove as EventListener);
    this.addTrackedListener(window, 'mouseup', onEnd as EventListener);

    this.addTrackedListener(this.wrapper, 'touchstart', onStart as EventListener, { passive: true });
    this.addTrackedListener(window, 'touchmove', onMove as EventListener, { passive: true });
    this.addTrackedListener(window, 'touchend', onEnd as EventListener);

    // Wheel drag interaction (Fix 3: Ignore wheel if menu is open)
    this.addTrackedListener(this.wrapper, 'wheel', ((e: WheelEvent) => {
      if (document.body.classList.contains('is-nav-open')) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      this.targetX -= delta * 1.5;
    }) as EventListener, { passive: false });

    // Dynamic viewport resize handling (Fix 6)
    let resizeTimer: number;
    this.addTrackedListener(window, 'resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => this.updateDimensions(), 100);
    });

    // Item selection with False-Click Protection (Fix 2)
    this.items.forEach(item => {
      this.addTrackedListener(item.element, 'click', ((e: MouseEvent) => {
        // If the user performed an intentional drag/swipe, SUPPRESS click
        if (this.hasDragged || Math.abs(this.velocity) > 0.8) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (this.onSelectProduct) {
          e.preventDefault();
          this.onSelectProduct(item.product);
        }
      }) as EventListener);
    });
  }

  public loop(): void {
    if (!this.isRunning) return;

    // 1. Decoupled LERP Momentum Step (Zero auto-glide when idle - completely stationary unless dragged or scrolled)
    const prevCurrent = this.currentX;
    this.currentX += (this.targetX - this.currentX) * this.lerpFactor;
    this.velocity = this.currentX - prevCurrent;

    // 2. Infinite Modulo Coordinates for Floating Jars
    const trackCenter = window.innerWidth / 2;
    const shouldRedrawCanvas = Math.abs(this.velocity) > 0.005; // Battery & Performance optimization (Fix 5)

    this.items.forEach(item => {
      const rawX = this.currentX + item.index * this.effectiveItemWidth;
      let wrappedX = ((rawX % this.trackWidth) + this.trackWidth) % this.trackWidth;
      wrappedX -= this.trackWidth / 2 - trackCenter;

      const distFromCenter = Math.abs(wrappedX - trackCenter);
      const normalizedDist = Math.min(distFromCenter / (window.innerWidth * 0.7), 1);
      const scale = 1 - normalizedDist * 0.12;
      const opacity = 1 - Math.pow(normalizedDist, 3) * 0.6;

      item.element.style.transform = `translate3d(${wrappedX}px, 0, 0) scale(${scale})`;
      item.element.style.opacity = opacity.toString();

      // Only recompute cylindrical canvas when actually moving (Fix 5)
      if (shouldRedrawCanvas) {
        this.renderCylindricalLabel(item, this.currentX);
      }
    });

    // 4. Synchronized Rotation of Terracotta Typographic Seal Badge
    const badgeRotationDeg = (this.currentX * -0.06) % 360;
    document.documentElement.style.setProperty('--jar-circle-rotation', `${badgeRotationDeg}deg`);

    // 5. Telemetry update
    if (this.onUpdateTelemetry) {
      this.onUpdateTelemetry({
        velocity: Math.abs(this.velocity),
        rotation: badgeRotationDeg
      });
    }

    requestAnimationFrame(this.loop);
  }

  public destroy(): void {
    this.isRunning = false;
    this.boundEvents.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.boundEvents = [];
  }
}
