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
    requestAnimationFrame(this.loop);
  }

  private bindEvents(): void {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return; // Touch device — native finger interaction
    }
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (!this.isVisible) {
        this.isVisible = true;
        this.element.classList.add('is-visible');
      }
    });

    document.addEventListener('mouseleave', () => {
      this.isVisible = false;
      this.element.classList.remove('is-visible');
    });

    document.addEventListener('mouseenter', () => {
      this.isVisible = true;
      this.element.classList.add('is-visible');
    });

    document.addEventListener('mousedown', () => {
      this.isGrabbing = true;
      this.element.classList.add('is-grabbing');
    });

    document.addEventListener('mouseup', () => {
      this.isGrabbing = false;
      this.element.classList.remove('is-grabbing');
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
      el.addEventListener('mouseenter', () => this.setContext(label, true));
      el.addEventListener('mouseleave', () => this.setContext('EXPLORE', false));
    });
  }

  private loop(): void {
    if (!this.isRunning) return;

    // Smooth LERP motion tracking
    this.currentX += (this.mouseX - this.currentX) * 0.22;
    this.currentY += (this.mouseY - this.currentY) * 0.22;

    this.element.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;

    requestAnimationFrame(this.loop);
  }

  public destroy(): void {
    this.isRunning = false;
  }
}
