/**
 * ElasticDeckCarousel — Luxury Tactile Card Deck with Spring Peeling Physics
 * Inspired by Apple iOS Wallet, Tinder gesture kinematics, and Codrops Elastic Stack.
 */

import { Product } from '../data/products';

export interface DeckCarouselOptions {
  container: HTMLElement;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export class ElasticDeckCarousel {
  private container: HTMLElement;
  private products: Product[];
  private onSelectProduct?: (product: Product) => void;

  private wrapper!: HTMLElement;
  private cardStack!: HTMLElement;
  private cardElements: HTMLElement[] = [];
  private currentIndex = 0;

  // Drag physics state
  private isDragging = false;
  private hasDragged = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private lastX = 0;
  private lastTime = 0;
  private velocityX = 0;

  // UI elements
  private counterEl!: HTMLElement;
  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;

  private boundEvents: { target: EventTarget; type: string; handler: EventListenerOrEventListenerObject }[] = [];

  constructor(options: DeckCarouselOptions) {
    this.container = options.container;
    this.products = options.products;
    this.onSelectProduct = options.onSelectProduct;

    this.buildDOM();
    this.renderStack();
    this.bindEvents();
  }

  private buildDOM(): void {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'deck-carousel';
    this.wrapper.innerHTML = `
      <div class="deck-carousel__header">
        <span class="deck-carousel__tag">Tactile Card Deck • Swipe or Flick</span>
        <div class="deck-carousel__counter" id="deckCounter">01 / ${String(this.products.length).padStart(2, '0')}</div>
      </div>

      <div class="deck-carousel__stage">
        <div class="deck-carousel__stack" id="cardStack"></div>
      </div>

      <div class="deck-carousel__controls">
        <button class="deck-carousel__btn deck-carousel__btn--prev" id="deckPrev" aria-label="Previous card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="deck-carousel__hint">Drag to peel or throw card</div>
        <button class="deck-carousel__btn deck-carousel__btn--next" id="deckNext" aria-label="Next card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    `;

    this.container.appendChild(this.wrapper);

    this.cardStack = this.wrapper.querySelector('#cardStack')!;
    this.counterEl = this.wrapper.querySelector('#deckCounter')!;
    this.prevBtn = this.wrapper.querySelector('#deckPrev')!;
    this.nextBtn = this.wrapper.querySelector('#deckNext')!;

    // Create Card DOM nodes
    this.cardElements = this.products.map((prod, i) => {
      const card = document.createElement('div');
      card.className = 'deck-card';
      card.dataset.index = String(i);

      card.innerHTML = `
        <div class="deck-card__inner">
          <div class="deck-card__badge-row">
            <span class="deck-card__category">${prod.category.toUpperCase()}</span>
            <span class="deck-card__weight">${prod.weight}</span>
          </div>
          
          <div class="deck-card__jar-stage">
            <img class="deck-card__jar-img" src="${prod.jarUrl}" alt="${prod.title}" draggable="false" />
            <div class="deck-card__jar-shadow"></div>
          </div>

          <div class="deck-card__content">
            <h3 class="deck-card__title">${prod.title}</h3>
            <p class="deck-card__subtitle">${prod.latinSubtitle}</p>
            <p class="deck-card__desc">${prod.description}</p>
            
            <div class="deck-card__footer">
              <span class="deck-card__price">${prod.price}</span>
              <span class="deck-card__cta">Explore Flavor →</span>
            </div>
          </div>
        </div>
      `;

      this.cardStack.appendChild(card);
      return card;
    });
  }

  private renderStack(springAnimate = false): void {
    const total = this.products.length;
    this.counterEl.textContent = `${String(this.currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

    this.cardElements.forEach((card, i) => {
      // Relative offset from current active card
      const offset = (i - this.currentIndex + total) % total;

      card.style.transition = springAnimate ? 'transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease' : 'none';

      if (offset === 0) {
        // Top active card
        card.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
        card.style.opacity = '1';
        card.style.zIndex = '10';
        card.style.pointerEvents = 'auto';
        card.classList.add('is-active');
      } else if (offset === 1) {
        // 2nd card
        card.style.transform = 'translate3d(0, 22px, -40px) scale(0.95)';
        card.style.opacity = '0.9';
        card.style.zIndex = '9';
        card.style.pointerEvents = 'none';
        card.classList.remove('is-active');
      } else if (offset === 2) {
        // 3rd card
        card.style.transform = 'translate3d(0, 44px, -80px) scale(0.90)';
        card.style.opacity = '0.65';
        card.style.zIndex = '8';
        card.style.pointerEvents = 'none';
        card.classList.remove('is-active');
      } else if (offset === 3) {
        // 4th card
        card.style.transform = 'translate3d(0, 66px, -120px) scale(0.85)';
        card.style.opacity = '0.35';
        card.style.zIndex = '7';
        card.style.pointerEvents = 'none';
        card.classList.remove('is-active');
      } else {
        // Hidden cards further down the deck
        card.style.transform = 'translate3d(0, 80px, -160px) scale(0.80)';
        card.style.opacity = '0';
        card.style.zIndex = '1';
        card.style.pointerEvents = 'none';
        card.classList.remove('is-active');
      }
    });
  }

  private bindEvents(): void {
    const topCard = () => this.cardElements[this.currentIndex];

    const onStart = (e: MouseEvent | TouchEvent) => {
      const activeCard = topCard();
      if (!activeCard) return;

      this.isDragging = true;
      this.hasDragged = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      this.startX = clientX;
      this.startY = clientY;
      this.currentX = 0;
      this.currentY = 0;
      this.lastX = clientX;
      this.lastTime = performance.now();
      this.velocityX = 0;

      activeCard.style.transition = 'none';
      activeCard.style.cursor = 'grabbing';
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      this.currentX = clientX - this.startX;
      this.currentY = clientY - this.startY;

      if (Math.hypot(this.currentX, this.currentY) > 8) {
        this.hasDragged = true;
      }

      const now = performance.now();
      const dt = Math.max(now - this.lastTime, 12);
      this.velocityX = (clientX - this.lastX) / dt;
      this.lastX = clientX;
      this.lastTime = now;

      // Apply tactile peeling tilt
      const activeCard = topCard();
      if (activeCard) {
        const rot = this.currentX * 0.08;
        activeCard.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) rotate(${rot}deg) scale(1.02)`;
      }

      // Step underlying cards slightly forward as you pull
      const pullProgress = Math.min(Math.abs(this.currentX) / 220, 1);
      const nextCard = this.cardElements[(this.currentIndex + 1) % this.products.length];
      if (nextCard) {
        const nextScale = 0.95 + pullProgress * 0.05;
        const nextY = 22 - pullProgress * 22;
        nextCard.style.transform = `translate3d(0, ${nextY}px, -40px) scale(${nextScale})`;
      }
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const activeCard = topCard();
      if (!activeCard) return;

      activeCard.style.cursor = 'grab';

      // Throw threshold: distance > 110px OR flick velocity > 0.4
      const shouldThrow = Math.abs(this.currentX) > 110 || Math.abs(this.velocityX) > 0.4;

      if (shouldThrow) {
        // Fling top card off screen
        const throwDir = this.currentX >= 0 ? 1 : -1;
        const throwDist = throwDir * (window.innerWidth * 0.85);

        activeCard.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.35s ease';
        activeCard.style.transform = `translate3d(${throwDist}px, ${this.currentY * 1.5}px, 50px) rotate(${throwDir * 28}deg)`;
        activeCard.style.opacity = '0';

        setTimeout(() => {
          this.currentIndex = (this.currentIndex + 1) % this.products.length;
          this.renderStack(true);
        }, 220);
      } else {
        // Elastic snap back to origin
        activeCard.style.transition = 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        activeCard.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
        const nextCard = this.cardElements[(this.currentIndex + 1) % this.products.length];
        if (nextCard) {
          nextCard.style.transition = 'transform 0.45s ease';
          nextCard.style.transform = 'translate3d(0, 22px, -40px) scale(0.95)';
        }
      }
    };

    this.addTrackedListener(this.cardStack, 'mousedown', onStart as EventListener);
    this.addTrackedListener(window, 'mousemove', onMove as EventListener);
    this.addTrackedListener(window, 'mouseup', onEnd as EventListener);

    this.addTrackedListener(this.cardStack, 'touchstart', onStart as EventListener, { passive: true });
    this.addTrackedListener(window, 'touchmove', onMove as EventListener, { passive: true });
    this.addTrackedListener(window, 'touchend', onEnd as EventListener);

    // Prev / Next buttons
    this.addTrackedListener(this.nextBtn, 'click', () => {
      this.throwCurrentCard(1);
    });

    this.addTrackedListener(this.prevBtn, 'click', () => {
      this.throwCurrentCard(-1);
    });

    // Click on active card to view product
    this.cardElements.forEach((card, idx) => {
      this.addTrackedListener(card, 'click', (e) => {
        if (this.hasDragged) return;
        if (idx === this.currentIndex && this.onSelectProduct) {
          e.preventDefault();
          this.onSelectProduct(this.products[idx]);
        }
      });
    });
  }

  private throwCurrentCard(direction: number): void {
    const activeCard = this.cardElements[this.currentIndex];
    if (!activeCard) return;

    activeCard.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.35s ease';
    activeCard.style.transform = `translate3d(${direction * 650}px, -40px, 50px) rotate(${direction * 22}deg)`;
    activeCard.style.opacity = '0';

    setTimeout(() => {
      const total = this.products.length;
      this.currentIndex = direction > 0 ? (this.currentIndex + 1) % total : (this.currentIndex - 1 + total) % total;
      this.renderStack(true);
    }, 200);
  }

  private addTrackedListener(target: EventTarget, type: string, handler: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) {
    target.addEventListener(type, handler, options);
    this.boundEvents.push({ target, type, handler: handler as EventListenerOrEventListenerObject });
  }

  public destroy(): void {
    this.boundEvents.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this.boundEvents = [];

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }
}

