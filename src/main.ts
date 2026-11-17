/**
 * Mathias Adolfsson '26 Portfolio — Main Application Bootstrap
 * Single Persistent WebGL Scene Architecture (Codrops Feature)
 * 
 * - html & body are fixed with zero document scroll
 * - Single full-screen 3D scene handles both Carousel and 3D Barrel Gallery Case Studies
 * - URL routes (/ and /projects/<slug>) drive scene states with browser history
 */

import './style/main.css';
import { CustomCursor } from './engine/cursor';
import { MathiasCylinderEngine } from './engine/mathiasCylinderEngine';
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
  new MathiasCylinderEngine({
    container: viewMount,
    projects: SHOWCASE_PROJECTS,
    initialSlug,
    onNavigate: (newPath) => {
      if (newPath === '/') {
        document.title = 'Mathias Adolfsson — Creative Engineer & WebGL Developer';
      } else {
        const slug = newPath.split('/').filter(Boolean).pop();
        const p = SHOWCASE_PROJECTS.find(item => item.slug === slug);
        document.title = p ? `${p.title.split('—')[0].trim()} — Mathias Adolfsson` : 'Case Study — Mathias Adolfsson';
      }
    }
  });

  // 4. Bind interactive cursor triggers
  cursor.bindInteractive(document.querySelectorAll('a, button'), 'EXPLORE');
  cursor.bindInteractive(document.querySelectorAll('.ma-case-overlay__back'), 'REEL');
  cursor.bindInteractive(document.querySelectorAll('.ma-sound-toggle'), 'AUDIO');
  cursor.bindInteractive(document.querySelectorAll('.ma-about-link'), 'ABOUT');
});
