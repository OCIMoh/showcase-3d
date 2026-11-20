/**
 * Application Bootstrap & Spatial Routing Host — Showcase3D.cloud
 * 
 * - Persistent Single WebGL Canvas: Context is permanently preserved across all routes
 * - Decoupled Spatial Router: Coordinates URL history with 3D camera waypoints and DOM views
 * - Views:
 *   /              -> Active 3D Cylindrical Stage (Waypoint: STAGE)
 *   /work/:slug    -> In-Situ 3D Barrel Case Study (Waypoint: CASE_STUDY)
 *   /studio        -> Luxury Editorial Studio & Services (Waypoint: STUDIO)
 *   /contact       -> Commission Terminal Drawer (Waypoint: DRAWER)
 */

import './style/main.css';
import { CustomCursor } from './engine/cursor';
import { CylinderCarouselEngine } from './engine/cylinder/engine';
import { SHOWCASE_PROJECTS } from './data/showcaseProjects';
import { AnimaxLoader } from './engine/cylinder/ui/animaxLoader';
import { SpatialRouter } from './router/spatialRouter';
import { StudioView } from './views/studioView';
import { ContactView } from './views/contactView';

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
    onContact: () => router.navigate('/contact')
  });
  studioView.mount(viewMount);

  const contactView = new ContactView({
    onClose: () => {
      const prev = router.getPreviousRoute();
      if (prev && prev.pathname !== '/contact' && prev.pathname !== '/hire') {
        router.navigate(prev.pathname);
      } else {
        router.navigate('/');
      }
    }
  });
  contactView.mount(viewMount);

  // 6. Connect Spatial Router to 3D Waypoints & DOM Overlays
  router.onRoute((current, previous) => {
    const overlay = engine.getOverlay();
    overlay.setActiveNav(current.pathname);

    // Route-aware Header Visibility & Active Nav States
    const maHeader = document.getElementById('maHeader');
    const navWork = document.getElementById('navWork');
    const navStudio = document.getElementById('navStudio');
    const navContact = document.getElementById('navContact');

    if (current.route.name === 'home') {
      maHeader?.classList.remove('is-hidden');
      navWork?.classList.add('is-active');
      navStudio?.classList.remove('is-active');
      navContact?.classList.remove('is-active');
    } else {
      maHeader?.classList.add('is-hidden');
      navWork?.classList.remove('is-active');
      if (current.route.name === 'studio' || current.route.name === 'about-alias' || current.route.name === 'services-alias') {
        navStudio?.classList.add('is-active');
      } else if (current.route.name === 'contact' || current.route.name === 'hire-alias' || current.route.name === 'contact-alias') {
        navContact?.classList.add('is-active');
      }
    }

    switch (current.route.name) {
      case 'home': {
        if (engine.heroOpenAmount > 0.5) {
          engine.closeProject();
        }
        engine.setWaypoint('STAGE');
        studioView.exit();
        contactView.exit();
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
        contactView.exit();
        break;
      }

      case 'contact':
      case 'contact-alias':
      case 'hire-alias': {
        engine.setWaypoint('DRAWER');
        studioView.exit();
        contactView.enter();
        break;
      }

      case 'project-detail':
      case 'project-detail-alias': {
        studioView.exit();
        contactView.exit();
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
        contactView.exit();
        break;
      }
    }

    // Refresh dynamic cursor attachments for new interactive elements
    setTimeout(() => {
      cursor.bindInteractive(document.querySelectorAll('a, button, input, textarea, summary'), 'EXPLORE');
      cursor.bindInteractive(document.querySelectorAll('.ma-studio-close-btn, .ma-contact-close-btn, .ma-case-close-btn'), 'CLOSE');
      cursor.bindInteractive(document.querySelectorAll('.ma-nav-cta, .ma-cta-contact-btn, .ma-submit-btn'), 'START');
      cursor.bindInteractive(document.querySelectorAll('#dispatchMainBtn, #dispatchCopyBtn, #dispatchPillEmail'), 'CONTACT');
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
