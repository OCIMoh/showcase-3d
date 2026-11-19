/**
 * Custom Contextual Magnetic Cursor
 * Luxury Minimal Dot that expands into a pill ONLY on interactive hover or drag
 */

export class CustomCursor {
  private element: HTMLElement;
  private dot: HTMLElement;
  private pill: HTMLElement;
  private text: HTMLElement;

  private mouseX = -100;
  private mouseY = -100;
  private currentX = -100;
  private currentY = -100;
  private isVisible = false;
  private isHovering = false;
  private isGrabbing = false;
  private isRunning = true;
  private rafId: number | null = null;
  private cleanupFns: Array<() => void> = [];

  constructor(cursorId: string = 'customCursor') {
    let el = document.getElementById(cursorId);
    if (!el) {
      el = document.createElement('div');
      el.id = cursorId;
      el.className = 'custom-cursor';
      el.innerHTML = `
        <div class="cursor-dot"></div>
        <div class="cursor-pill" id="cursorPill">
          <span class="cursor-diamond"></span>
          <span class="cursor-text" id="cursorText">EXPLORE</span>
        </div>
      `;
      document.body.appendChild(el);
    }
    this.element = el;
    this.dot = el.querySelector('.cursor-dot') as HTMLElement;
    this.pill = el.querySelector('.cursor-pill') as HTMLElement;
    this.text = el.querySelector('.cursor-text') as HTMLElement;

    this.bindEvents();
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);
  }

  private bindEvents(): void {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return; // Touch device — native finger interaction
    }

    const onMouseMove = (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (!this.isVisible) {
        this.isVisible = true;
        this.element.classList.add('is-visible');
      }
    };

    const onMouseLeave = () => {
      this.isVisible = false;
      this.element.classList.remove('is-visible');
    };

    const onMouseEnter = () => {
      this.isVisible = true;
      this.element.classList.add('is-visible');
    };

    const onMouseDown = () => {
      this.isGrabbing = true;
      this.element.classList.add('is-grabbing');
    };

    const onMouseUp = () => {
      this.isGrabbing = false;
      this.element.classList.remove('is-grabbing');
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    this.cleanupFns.push(() => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    });
  }

  public setContext(label: string, isHovering: boolean = true): void {
    this.isHovering = isHovering;
    if (this.text) this.text.textContent = label;
    if (isHovering) {
      this.element.classList.add('is-hovering');
    } else {
      this.element.classList.remove('is-hovering');
    }
  }

  public bindInteractive(elements: NodeListOf<Element> | Element[], label: string): void {
    elements.forEach(el => {
      const onEnter = () => this.setContext(label, true);
      const onLeave = () => this.setContext('EXPLORE', false);
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      this.cleanupFns.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  private loop(): void {
    if (!this.isRunning) return;

    // Smooth LERP motion tracking
    this.currentX += (this.mouseX - this.currentX) * 0.22;
    this.currentY += (this.mouseY - this.currentY) * 0.22;

    this.element.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;

    this.rafId = requestAnimationFrame(this.loop);
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.element.remove();
  }
}
