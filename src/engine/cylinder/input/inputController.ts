/**
 * Scoped Input Controller: Pointer Drag, Parallax Tilt, Wheel Physics, and Keyboard Listeners
 */

export interface InputCallbacks {
  onDragMove: (deltaX: number, deltaY: number, dt: number) => void;
  onFling: (vx: number, vy: number) => void;
  onTap: (clientX: number, clientY: number) => void;
  onWheel: (deltaX: number, deltaY: number) => void;
  onWheelEnd: () => void;
  onPointerParallax: (normX: number, normY: number) => void;
  onArrowKey: (key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown') => void;
  onEscape: () => void;
  isCaseStudyOpen: () => boolean;
}

interface BoundListener {
  target: EventTarget;
  type: string;
  handler: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
}

export class InputController {
  private canvas: HTMLCanvasElement;
  private wrapper: HTMLElement;
  private callbacks: InputCallbacks;
  private boundEvents: BoundListener[] = [];

  // Drag physics state
  private isDragging = false;
  private hasDragged = false;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private lastPointerTime = 0;
  private dragVelocityX = 0;
  private dragVelocityY = 0;
  private wheelSnapTimer: number | null = null;

  constructor(canvas: HTMLCanvasElement, wrapper: HTMLElement, callbacks: InputCallbacks) {
    this.canvas = canvas;
    this.wrapper = wrapper;
    this.callbacks = callbacks;
    this.bindEvents();
  }

  private add(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(type, handler, options);
    this.boundEvents.push({ target, type, handler, options });
  }

  private bindEvents(): void {
    const onPointerDown = (e: PointerEvent) => {
      // Ignore drags initiating on interactive DOM buttons
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a, input, select, textarea')) return;

      this.isDragging = true;
      this.hasDragged = false;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.lastPointerTime = performance.now();
      this.dragVelocityX = 0;
      this.dragVelocityY = 0;
      this.canvas.style.cursor = 'grabbing';

      if (this.wheelSnapTimer !== null) {
        window.clearTimeout(this.wheelSnapTimer);
        this.wheelSnapTimer = null;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      // Aspect-balanced parallax: Dampen horizontal travel on ultrawide displays (>2:1)
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const aspectDamp = aspect > 2.0 ? 1.77 / aspect : 1.0;
      const normX = ((e.clientX / window.innerWidth) * 2 - 1) * aspectDamp;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      this.callbacks.onPointerParallax(normX, normY);

      if (!this.isDragging) return;

      const deltaX = e.clientX - this.lastPointerX;
      const deltaY = e.clientY - this.lastPointerY;
      const now = performance.now();
      const dt = Math.max(1, now - this.lastPointerTime);

      if (Math.hypot(e.clientX - this.pointerStartX, e.clientY - this.pointerStartY) > 5) {
        this.hasDragged = true;
      }

      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.lastPointerTime = now;

      this.dragVelocityX = (deltaX / dt) * 16.0;
      this.dragVelocityY = (deltaY / dt) * 16.0;

      this.callbacks.onDragMove(deltaX, deltaY, dt);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';

      // Tap without dragging
      if (!this.hasDragged) {
        this.callbacks.onTap(e.clientX, e.clientY);
        return;
      }

      // Fling velocity
      this.callbacks.onFling(this.dragVelocityX, this.dragVelocityY);
    };

    const onWheel = (e: WheelEvent) => {
      // If user is hovering an interactive element or overlay, do not capture wheel
      const target = e.target as HTMLElement | null;
      const isCanvasOrRoot =
        target === this.canvas ||
        target === this.wrapper ||
        (target !== null && target.classList.contains('ma-cylinder-root'));

      if (!isCanvasOrRoot && !this.callbacks.isCaseStudyOpen()) {
        return;
      }

      e.preventDefault();
      this.callbacks.onWheel(e.deltaX, e.deltaY);

      if (this.wheelSnapTimer !== null) {
        window.clearTimeout(this.wheelSnapTimer);
      }
      this.wheelSnapTimer = window.setTimeout(() => {
        this.callbacks.onWheelEnd();
      }, 220);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.callbacks.onEscape();
        return;
      }

      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        this.callbacks.onArrowKey(e.key);
      }
    };

    this.add(this.wrapper, 'pointerdown', onPointerDown as EventListener);
    this.add(window, 'pointermove', onPointerMove as EventListener);
    this.add(window, 'pointerup', onPointerUp as EventListener);
    this.add(window, 'pointercancel', onPointerUp as EventListener);
    this.add(window, 'wheel', onWheel as EventListener, { passive: false });
    this.add(window, 'keydown', onKeyDown as EventListener);
  }

  public destroy(): void {
    if (this.wheelSnapTimer !== null) {
      window.clearTimeout(this.wheelSnapTimer);
      this.wheelSnapTimer = null;
    }

    this.boundEvents.forEach(({ target, type, handler, options }) => {
      target.removeEventListener(type, handler, options);
    });
    this.boundEvents = [];
  }
}

