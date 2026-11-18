/**
 * Application Bootstrap & Routing Host
 * 
 * - html & body are fixed with zero document scroll
 * - Single full-screen 3D scene handles both Carousel and 3D Barrel Gallery Case Studies
 * - Host router manages browser history state via popstate and onNavigate
 */

import './style/main.css';
import { CustomCursor } from './engine/cursor';
import { CylinderCarouselEngine } from './engine/cylinder/engine';
import { SHOWCASE_PROJECTS } from './data/showcaseProjects';

document.addEventListener('DOMContentLoaded', () => {
  const viewMount = document.getElementById('viewMount');
  if (!viewMount) return;

  // 1. Initialize Magnetic Contextual Cursor
  const cursor = new CustomCursor();

  // 2. Parse initial route for deep linking
  const path = window.location.pathname;
  let initialSlug: string | undefined = undefined;
  if (path.startsWith('/projects/') || path.startsWith('/project/')) {
    initialSlug = path.split('/').filter(Boolean).pop();
  }

  // 3. Initialize Single Persistent 3D WebGL Engine
  const engine = new CylinderCarouselEngine({
    container: viewMount,
    projects: SHOWCASE_PROJECTS,
    initialSlug,
    onNavigate: (newPath) => {
      if (window.location.pathname !== newPath) {
        window.history.pushState({ path: newPath }, '', newPath);
      }
      if (newPath === '/') {
        document.title = 'Studio — 3D Interactive Portfolio';
      } else {
        const slug = newPath.split('/').filter(Boolean).pop();
        const p = SHOWCASE_PROJECTS.find(item => item.slug === slug);
        document.title = p ? `${p.title.split('—')[0].trim()} — Case Study` : 'Case Study — Portfolio';
      }
    }
  });

  // 4. Host History Router Adapter (handles browser back/forward buttons)
  window.addEventListener('popstate', () => {
    const curPath = window.location.pathname;
    if (curPath.startsWith('/projects/') || curPath.startsWith('/project/')) {
      const slug = curPath.split('/').filter(Boolean).pop();
      const found = SHOWCASE_PROJECTS.find(p => p.slug === slug);
      if (found) {
        engine.openProject(found, window.innerWidth / 2, window.innerHeight / 2);
      }
    } else if (engine.heroOpenAmount > 0.5) {
      engine.closeProject();
    }
  });

  // 5. Bind interactive cursor triggers
  cursor.bindInteractive(document.querySelectorAll('a, button'), 'EXPLORE');
  cursor.bindInteractive(document.querySelectorAll('.ma-case-close-btn'), 'CLOSE');
  cursor.bindInteractive(document.querySelectorAll('.ma-case-view-link, .ma-bento-btn'), 'VISIT');
  cursor.bindInteractive(document.querySelectorAll('.ma-case-sound-btn, .ma-sound-toggle'), 'AUDIO');
  cursor.bindInteractive(document.querySelectorAll('.ma-about-link'), 'VISIT');
});
