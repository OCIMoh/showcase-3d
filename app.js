/**
 * Agrumêa Farm — Main Application Controller
 * Orchestrates physics loader sequence, custom cursor, product modal,
 * and carousel initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Components
  const fruitLoader = document.getElementById('fruitLoader');
  const loaderPercent = document.getElementById('loaderPercent');
  const enterBtn = document.getElementById('enterBtn');
  const btnPhysicsToggle = document.getElementById('btnPhysicsToggle');

  // Custom Cursor Elements
  const customCursor = document.getElementById('customCursor');
  const cursorPill = document.getElementById('cursorPill');
  const cursorText = document.getElementById('cursorText');

  // Modal Elements
  const productModal = document.getElementById('productModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const modalJarImg = document.getElementById('modalJarImg');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');

  // 1. Initialize Physics Engine
  const physics = new FruitPhysics('physicsCanvas');

  // 2. Simulated Loader Progress with Continuous Fruit Dropping
  let progress = 0;
  let fruitInterval = setInterval(() => {
    if (progress < 100) {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress > 100) progress = 100;
      loaderPercent.textContent = `${progress}%`;

      // Spawn a fresh fruit every tick
      physics.spawnFruit();

      if (progress === 100) {
        clearInterval(fruitInterval);
        enterBtn.classList.add('ready');
      }
    }
  }, 120);

  // Close Loader and Trigger Signature Sweep Transition
  function closeLoader() {
    fruitLoader.classList.add('is-closing');
    setTimeout(() => {
      fruitLoader.classList.add('is-done');
      // Initialize the Angled 10° Marquee Carousel
      window.carousel = new AgrumeaCarousel();
    }, 1100);
  }

  enterBtn.addEventListener('click', closeLoader);

  // Re-open Fruit Physics Stage anytime from header toggle
  btnPhysicsToggle.addEventListener('click', () => {
    fruitLoader.classList.remove('is-done', 'is-closing');
    fruitLoader.style.opacity = '1';
    enterBtn.classList.add('ready');
    // Drop 6 bonus fruits
    for (let i = 0; i < 6; i++) {
      setTimeout(() => physics.spawnFruit(), i * 100);
    }
  });

  // 3. Custom Cursor Mechanics
  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;
    customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Contextual Cursor Labels
  const interactiveElements = [
    { selector: '.jar-slider__wrapper', text: 'DRAG' },
    { selector: '.jar-slider__item', text: 'DISCOVER' },
    { selector: '.fruit-loader__stage', text: 'TOSS & BLAST' },
    { selector: 'button, .btn-shop, .nav-link', text: 'CLICK' }
  ];

  interactiveElements.forEach(({ selector, text }) => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorText.textContent = text;
        customCursor.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursorText.textContent = 'DRAG';
        customCursor.classList.remove('hovering');
      });
    });
  });

  document.addEventListener('mousedown', () => customCursor.classList.add('grabbing'));
  document.addEventListener('mouseup', () => customCursor.classList.remove('grabbing'));

  // 4. Product Drawer Modal Functionality
  window.openProductModal = function(product) {
    modalJarImg.src = product.image;
    modalCategory.textContent = product.category;
    modalTitle.textContent = product.title;
    modalDesc.textContent = product.desc;
    productModal.classList.add('is-open');
  };

  function closeModal() {
    productModal.classList.remove('is-open');
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});

