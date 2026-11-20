/**
 * Application Bootstrap & Spatial Routing Host — Showcase3D.cloud
 * 
 * - Persistent Single WebGL Canvas: Context is permanently preserved across all routes
 * - Decoupled Spatial Router: Coordinates URL history with 3D camera waypoints and DOM views
 * - Views:
 *   /              -> Active 3D Cylindrical Stage (Waypoint: STAGE)
 *   /work/:slug    -> In-Situ 3D Barrel Case Study (Waypoint: CASE_STUDY)
 *   /studio        -> Luxury Editorial Studio & Services (Waypoint: STUDIO)
 *   /hire          -> Commission Terminal Drawer (Waypoint: DRAWER)
 */

import './style/main.css';
import { CustomCursor } from './engine/cursor';
import { CylinderCarouselEngine } from './engine/cylinder/engine';
import { SHOWCASE_PROJECTS } from './data/showcaseProjects';
import { AnimaxLoader } from './engine/cylinder/ui/animaxLoader';
import { SpatialRouter } from './router/spatialRouter';
import { StudioView } from './views/studioView';
import { HireView } from './views/hireView';

document.addEventListener('DOMContentLoaded', () => {
  const viewMount = document.getElementById('viewMount');
  if (!viewMount) return;

  // 1. Mount Animax Studio High-Precision Preloader
  const loader = new AnimaxLoader();
  loader.setProgress(14, 'INITIALIZING SPATIAL 3D ENGINE');

  // 2. Initialize Magnetic Contextual Cursor
  const cursor = new CustomCursor();

  // 3. Initialize Spatial Router & Parse Initial Route
  const router = new SpatialRouter();
  const initialRoute = router.getCurrentRoute();
  let initialSlug: string | undefined = undefined;

  if (
    initialRoute.route.name === 'project-detail' ||
    initialRoute.route.name === 'project-detail-alias'
  ) {
    initialSlug = initialRoute.params.slug;
  }

  // 4. Initialize Single Persistent 3D WebGL Engine
  const engine = new CylinderCarouselEngine({
    container: viewMount,
    projects: SHOWCASE_PROJECTS,
    initialSlug,
    onNavigate: (newPath) => {
      // Sync engine-driven navigation (clicking a card, closing case study) with router
      router.navigate(newPath);
    }
  });

  // 5. Mount Spatial Route Overlay Views
  const studioView = new StudioView({
    onClose: () => router.navigate('/'),
    onHire: () => router.navigate('/hire')
  });
  studioView.mount(viewMount);

  const hireView = new HireView({
    onClose: () => {
      const prev = router.getPreviousRoute();
      if (prev && prev.pathname !== '/hire' && prev.pathname !== '/contact') {
        router.navigate(prev.pathname);
      } else {
        router.navigate('/');
      }
    }
  });
  hireView.mount(viewMount);

  // 6. Connect Spatial Router to 3D Waypoints & DOM Overlays
  router.onRoute((current, previous) => {
    const overlay = engine.getOverlay();
    overlay.setActiveNav(current.pathname);

    switch (current.route.name) {
      case 'home': {
        if (engine.heroOpenAmount > 0.5) {
          engine.closeProject();
        }
        engine.setWaypoint('STAGE');
        studioView.exit();
        hireView.exit();
        break;
      }

      case 'studio':
      case 'about-alias':
      case 'services-alias': {
        if (engine.heroOpenAmount > 0.5) {
          engine.closeProject();
        }
        engine.setWaypoint('STUDIO');
        studioView.enter();
        hireView.exit();
        break;
      }

      case 'hire':
      case 'contact-alias': {
        engine.setWaypoint('DRAWER');
        hireView.enter();
        // Keep studio underneath if arriving from /studio
        if (previous?.route.name !== 'studio' && previous?.route.name !== 'about-alias' && previous?.route.name !== 'services-alias') {
          studioView.exit();
        }
        break;
      }

      case 'project-detail':
      case 'project-detail-alias': {
        studioView.exit();
        hireView.exit();
        engine.setWaypoint('CASE_STUDY');
        const targetSlug = current.params.slug;
        const activeProj = engine.getActiveProject();
        if (!activeProj || activeProj.slug !== targetSlug) {
          engine.openProjectBySlug(targetSlug);
        }
        break;
      }

      default: {
        engine.setWaypoint('STAGE');
        studioView.exit();
        hireView.exit();
        break;
      }
    }

    // Refresh dynamic cursor attachments for new interactive elements
    setTimeout(() => {
      cursor.bindInteractive(document.querySelectorAll('a, button, input, textarea, summary'), 'EXPLORE');
      cursor.bindInteractive(document.querySelectorAll('.ma-studio-close-btn, .ma-hire-close-btn, .ma-case-close-btn'), 'CLOSE');
      cursor.bindInteractive(document.querySelectorAll('.ma-nav-cta, .ma-cta-hire-btn, .ma-submit-btn'), 'START');
      cursor.bindInteractive(document.querySelectorAll('.ma-case-view-link, .ma-call-link'), 'VISIT');
      cursor.bindInteractive(document.querySelectorAll('.ma-sound-toggle, .ma-case-sound-btn'), 'AUDIO');
    }, 100);
  });

  // 7. Track Real Asset Loading & Buffer Progress with Fail-Safe Timeout
  const minLoadTimePromise = new Promise((res) => setTimeout(res, 1800));
  const maxTimeoutPromise = new Promise((res) => setTimeout(res, 4000));

  const assetPreloadPromise = engine
    .preloadAssets((loaded, total, name) => {
      const rawPct = 15 + Math.round((loaded / total) * 82);
      loader.setProgress(rawPct, `BUFFERING: ${name}`);
    })
    .catch(() => {});

  Promise.race([
    Promise.all([assetPreloadPromise, minLoadTimePromise]),
    maxTimeoutPromise
  ]).finally(() => {
    loader.finish();
  });
});
