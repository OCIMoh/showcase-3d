/**
 * Main Application Bootstrap
 * Connects Router, Virtual Scroll (Lenis), Magnetic Cursor, and Luxury Header Menu (English)
 */

import './style/main.css';
import { AppRouter } from './router/router';
import { CustomCursor } from './engine/cursor';
import { ScrollManager } from './engine/scroll';

import { createHomeView } from './views/HomeView';
import { createCatalogView } from './views/CatalogView';
import { createProductDetailView } from './views/ProductDetailView';
import { createStoryView } from './views/StoryView';
import { createContactView } from './views/ContactView';

document.addEventListener('DOMContentLoaded', () => {
  const viewMount = document.getElementById('viewMount');
  if (!viewMount) return;

  // 1. Initialize Global Magnetic Cursor
  const cursor = new CustomCursor();

  // 2. Initialize Virtual Smooth Scroll (Lenis)
  new ScrollManager();

  // 3. Initialize SPA Router
  const router = new AppRouter(viewMount);

  // Register English Routes
  router.register('/', () => createHomeView(), 'Agrumêa Farm — Artisanal Sicilian Experience');
  router.register('/dispensa', () => createCatalogView(), 'The Botanical Pantry — Agrumêa Farm');
  router.register('/dispensa/:slug', (params) => createProductDetailView(params), 'Product Detail — Agrumêa Farm');
  router.register('/produzione', () => createStoryView('produzione'), 'Heritage & Method — Agrumêa Farm');
  router.register('/experience', () => createStoryView('experience'), 'Tastings & Visits — Agrumêa Farm');
  router.register('/chi-siamo', () => createStoryView('chi-siamo'), 'Our Story — Generations of Passion');
  router.register('/contatti', () => createContactView(), 'Contact & Estate — Agrumêa Farm');

  // Trigger initial route
  router.handleCurrentRoute();

  // 4. Header Menu Toggle & Full Page Navigation
  const menuToggle = document.getElementById('siteMenuToggle');
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.fp-nav__link');

  const closeNav = () => {
    document.body.classList.remove('is-nav-open');
    const nav = document.getElementById('siteFullPageNav');
    if (nav) nav.setAttribute('aria-hidden', 'true');
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('is-nav-open');
      const nav = document.getElementById('siteFullPageNav');
      if (nav) nav.setAttribute('aria-hidden', (!isOpen).toString());
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeNav();
      const href = link.getAttribute('href') || '/';
      router.navigateTo(href);

      navLinks.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');
    });
  });

  // Bind cursor hover triggers
  cursor.bindInteractive(document.querySelectorAll('a, button'), 'EXPLORE');
  cursor.bindInteractive(document.querySelectorAll('.site-menu-toggle'), 'MENU');
  cursor.bindInteractive(document.querySelectorAll('.site-header__brand'), 'HOME');
  cursor.bindInteractive(document.querySelectorAll('.jar-slider__item'), 'PANTRY');
});
