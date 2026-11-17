/**
 * Agrumêa Farm — Straight Horizontal Marquee Carousel & 3D Cylindrical Label Engine
 * Implements decoupled LERP momentum, modulo infinite wrap-around,
 * real-time cylindrical Canvas texture projection, and multiplane parallax.
 */

class AgrumeaCarousel {
  constructor(options = {}) {
    this.wrapper = document.getElementById('sliderWrapper');
    this.track = document.getElementById('sliderTrack');
    this.badge = document.getElementById('sliderBadge');
    this.shapeLayer = document.getElementById('shapeLayer');
    
    // HUD Telemetry
    this.hudVelocity = document.getElementById('hudVelocity');
    this.hudRotation = document.getElementById('hudRotation');

    // Products Catalog (High-Resolution Artisanal Preserves via Unsplash)
    this.products = [
      {
        id: 'pistacchio',
        title: 'Pesto di Pistacchio',
        subtitle: 'Oro Verde di Bronte',
        category: 'Dispensa Salata',
        desc: 'Crushed raw Sicilian pistachios blended with cold-pressed extra virgin olive oil and Trapani sea salt.',
        image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
        labelColor: '#2b442b',
        textColor: '#e6c89f'
      },
      {
        id: 'arancia',
        title: 'Marmellata di Arancia',
        subtitle: 'Tarocco & Moro IGP',
        category: 'Confettura Artigianale',
        desc: 'Sun-ripened organic blood oranges cooked gently in small copper cauldrons with natural citrus peel zest.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        labelColor: '#e94e1b',
        textColor: '#fdf3eb'
      },
      {
        id: 'caponata',
        title: 'Caponata Tradizionale',
        subtitle: 'Ricetta Catanese',
        category: 'Antipasti & Conserve',
        desc: 'Fried heirloom aubergines, sweet Nocellara olives, Pantelleria capers, and sweet & sour agrodolce glaze.',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        labelColor: '#762530',
        textColor: '#fdf3eb'
      },
      {
        id: 'gelsi',
        title: 'Confettura di Gelsi Neri',
        subtitle: 'Raccolti a Mano',
        category: 'Specialità Rara',
        desc: 'Intense and delicate black mulberries from old trees on the slopes of Mount Etna, pure summer in a jar.',
        image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80',
        labelColor: '#3c1424',
        textColor: '#e6c89f'
      },
      {
        id: 'fragole',
        title: 'Fragole di Maletto',
        subtitle: 'Gocce dell\'Etna',
        category: 'Confettura Artigianale',
        desc: 'Wild mountain strawberries hand-picked on volcanic soil, with an unforgettable fragrant sweet perfume.',
        image: 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?auto=format&fit=crop&w=600&q=80',
        labelColor: '#a62432',
        textColor: '#fdf3eb'
      },
      {
        id: 'mandorle',
        title: 'Crema di Mandorle',
        subtitle: 'Pizzuta di Avola',
        category: 'Crema Spalmabile',
        desc: 'Slowly stone-milled toasted Avola almonds transformed into a velvet spread with a touch of Madagascar vanilla.',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
        labelColor: '#8a6238',
        textColor: '#fdf3eb'
      },
      {
        id: 'limone',
        title: 'Crema di Limoni IGP',
        subtitle: 'Siracusa Floreale',
        category: 'Crema Delicata',
        desc: 'Zesty lemon curd crafted with fresh-squeezed organic Femminello lemons and golden farm butter.',
        image: 'https://images.unsplash.com/photo-1533083475698-7615354104b7?auto=format&fit=crop&w=600&q=80',
        labelColor: '#cf9c17',
        textColor: '#261612'
      }
    ];

    // Carousel Kinematics State
    this.targetX = 0;
    this.currentX = 0;
    this.lerpFactor = 0.085;
    this.itemWidth = 260; // card width + horizontal spacing
    this.totalItems = this.products.length;
    this.trackWidth = this.totalItems * this.itemWidth;

    // Interaction State
    this.isDragging = false;
    this.startX = 0;
    this.startTargetX = 0;
    this.velocity = 0;
    this.lastFrameX = 0;

    // Mouse Parallax State
    this.mouseTarget = { x: 0, y: 0 };
    this.mouseCurrent = { x: 0, y: 0 };

    this.items = [];

    this.initDOM();
    this.bindEvents();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initDOM() {
    this.track.innerHTML = '';
    
    // Create DOM elements for products
    this.products.forEach((prod, index) => {
      const item = document.createElement('div');
      item.className = 'jar-slider__item';
      item.dataset.index = index;
      item.dataset.id = prod.id;

      item.innerHTML = `
        <div class="jar-slider__card">
          <div class="jar-glass">
            <div class="jar-lid"></div>
            <img class="jar-image" src="${prod.image}" alt="${prod.title}" loading="eager" />
            <canvas class="jar-canvas" width="300" height="180"></canvas>
          </div>
          <div class="jar-meta">
            <span class="jar-title">${prod.title}</span>
            <span class="jar-subtitle">${prod.subtitle}</span>
          </div>
        </div>
      `;

      this.track.appendChild(item);
      const canvas = item.querySelector('.jar-canvas');
      this.items.push({
        element: item,
        canvas: canvas,
        ctx: canvas.getContext('2d'),
        product: prod,
        index: index
      });

      // Render initial 3D label
      this.renderCylindricalLabel(this.items[index], 0);
    });
  }

  /**
   * The Agrumêa 3D Cylindrical Label projection
   * Maps a flat label onto a curved cylindrical surface with non-linear horizontal
   * trigonometric compression and ambient specular/shadow highlights.
   */
  renderCylindricalLabel(item, progress) {
    const ctx = item.ctx;
    const w = item.canvas.width;
    const h = item.canvas.height;
    const prod = item.product;

    ctx.clearRect(0, 0, w, h);

    // Label background with curved borders
    ctx.save();
    ctx.fillStyle = prod.labelColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 8);
    ctx.fill();

    // Subtle gold foil border
    ctx.strokeStyle = '#e6c89f';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    ctx.strokeStyle = 'rgba(230, 200, 159, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Dynamic horizontal label shift based on jar rotation (sinusoidal offset)
    const labelShift = Math.sin(progress * 0.003 + item.index) * 25;

    // Typography
    ctx.textAlign = 'center';
    ctx.fillStyle = prod.textColor;

    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('AGRUMÊA FARM • SICILIA', w / 2 + labelShift * 0.5, 36);

    ctx.font = '700 18px "Cinzel", serif';
    ctx.fillText(prod.title, w / 2 + labelShift, 75);

    ctx.font = 'italic 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(prod.subtitle, w / 2 + labelShift * 0.8, 105);

    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('210g ℮ • FLORIDIA (SR)', w / 2 + labelShift * 0.5, 145);

    // Cylindrical 3D Lighting & Shadows Overlay:
    // Left edge shadow, center highlight, right edge shadow
    const lighting = ctx.createLinearGradient(0, 0, w, 0);
    lighting.addColorStop(0.0, 'rgba(0, 0, 0, 0.45)');  // Left curvature shadow
    lighting.addColorStop(0.18, 'rgba(0, 0, 0, 0.05)');
    lighting.addColorStop(0.48, 'rgba(255, 255, 255, 0.25)'); // Center glass specular highlight
    lighting.addColorStop(0.82, 'rgba(0, 0, 0, 0.05)');
    lighting.addColorStop(1.0, 'rgba(0, 0, 0, 0.5)');   // Right curvature shadow

    ctx.fillStyle = lighting;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  bindEvents() {
    // Pointer Drag Interactions
    const onStart = (e) => {
      this.isDragging = true;
      this.startX = e.touches ? e.touches[0].clientX : e.clientX;
      this.startTargetX = this.targetX;
      document.body.classList.add('grabbing');
    };

    const onMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - this.startX;
      // Straight horizontal pointer dragging
      this.targetX = this.startTargetX + deltaX * 1.35;
    };

    const onEnd = () => {
      this.isDragging = false;
      document.body.classList.remove('grabbing');
    };

    this.wrapper.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.wrapper.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    // Mousewheel scroll driving carousel
    this.wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
      this.targetX -= delta * 1.5;
    }, { passive: false });

    // Multiplane Mouse Parallax
    window.addEventListener('mousemove', (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      this.mouseTarget.x = (e.clientX - centerX);
      this.mouseTarget.y = (e.clientY - centerY);
    });

    // Item Click to Open Drawer
    this.items.forEach(item => {
      item.element.addEventListener('click', (e) => {
        // Only open if wasn't a significant drag fling
        if (Math.abs(this.velocity) < 1.5) {
          if (window.openProductModal) {
            window.openProductModal(item.product);
          }
        }
      });
    });
  }

  loop() {
    // 1. Decoupled LERP Momentum Step
    const prevCurrent = this.currentX;
    this.currentX += (this.targetX - this.currentX) * this.lerpFactor;
    this.velocity = this.currentX - prevCurrent;

    // Autoplay gentle creep when idle
    if (!this.isDragging && Math.abs(this.velocity) < 0.05) {
      this.targetX -= 0.6;
    }

    // 2. Mouse Parallax LERP
    this.mouseCurrent.x += (this.mouseTarget.x - this.mouseCurrent.x) * 0.06;
    this.mouseCurrent.y += (this.mouseTarget.y - this.mouseCurrent.y) * 0.06;

    document.documentElement.style.setProperty('--jar-parallax-x', `${this.mouseCurrent.x}px`);
    document.documentElement.style.setProperty('--jar-parallax-y', `${this.mouseCurrent.y}px`);

    // 3. Infinite Modulo Coordinates for Jars
    const trackCenter = window.innerWidth / 2;
    this.items.forEach((item) => {
      const rawX = this.currentX + item.index * this.itemWidth;
      // Closed Modulo wrap
      let wrappedX = ((rawX % this.trackWidth) + this.trackWidth) % this.trackWidth;
      // Center around viewport
      wrappedX -= this.trackWidth / 2 - trackCenter;

      // Distance from center for scale / depth curve
      const distFromCenter = Math.abs(wrappedX - trackCenter);
      const normalizedDist = Math.min(distFromCenter / (window.innerWidth * 0.7), 1);
      const scale = 1 - normalizedDist * 0.12;
      const opacity = 1 - Math.pow(normalizedDist, 3) * 0.6;

      // Apply GPU transform
      item.element.style.transform = `translate3d(${wrappedX}px, 0, 0) scale(${scale})`;
      item.element.style.opacity = opacity;

      // Update 3D label projection
      this.renderCylindricalLabel(item, this.currentX);
    });

    // 4. Synchronized Rotation of the Typographic Seal Badge
    const badgeRotationDeg = (this.currentX * 0.12) % 360;
    document.documentElement.style.setProperty('--jar-circle-rotation', `${badgeRotationDeg}deg`);

    // 5. Update Telemetry HUD
    if (this.hudVelocity) {
      this.hudVelocity.textContent = `${Math.abs(this.velocity).toFixed(2)} px/f`;
    }
    if (this.hudRotation) {
      this.hudRotation.textContent = `${badgeRotationDeg.toFixed(1)}°`;
    }

    requestAnimationFrame(this.loop);
  }
}

window.AgrumeaCarousel = AgrumeaCarousel;

