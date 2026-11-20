/**
 * Route Configuration & Metadata for Showcase3D.cloud
 * Maps URLs to spatial camera waypoints, document titles, and SEO descriptions.
 */

export type SpatialWaypoint = 'STAGE' | 'CASE_STUDY' | 'STUDIO' | 'DRAWER';

export interface RouteDefinition {
  path: string;
  name: string;
  waypoint: SpatialWaypoint;
  title: string;
  description: string;
  isModal?: boolean;
}

export interface MatchedRoute {
  route: RouteDefinition;
  params: Record<string, string>;
  pathname: string;
}

export const ROUTES: RouteDefinition[] = [
  {
    path: '/',
    name: 'home',
    waypoint: 'STAGE',
    title: 'Showcase3D.cloud — Custom Interactive 3D Websites & Spatial Web Design',
    description: 'We design and build bespoke, high-performance 3D websites and WebGL experiences that turn ordinary brand visits into unforgettable interactive spaces.'
  },
  {
    path: '/work/:slug',
    name: 'project-detail',
    waypoint: 'CASE_STUDY',
    title: 'Case Study — Showcase3D.cloud',
    description: 'Deep dive into 3D WebGL architecture, performance metrics, and interactive engineering.'
  },
  {
    path: '/projects/:slug',
    name: 'project-detail-alias',
    waypoint: 'CASE_STUDY',
    title: 'Case Study — Showcase3D.cloud',
    description: 'Deep dive into 3D WebGL architecture, performance metrics, and interactive engineering.'
  },
  {
    path: '/studio',
    name: 'studio',
    waypoint: 'STUDIO',
    title: 'Studio & Services — Showcase3D.cloud Creative Technology',
    description: 'Our craft philosophy, 3-step delivery process, bespoke 3D WebGL packages, and FAQs.'
  },
  {
    path: '/about',
    name: 'about-alias',
    waypoint: 'STUDIO',
    title: 'Studio & Services — Showcase3D.cloud Creative Technology',
    description: 'Our craft philosophy, 3-step delivery process, bespoke 3D WebGL packages, and FAQs.'
  },
  {
    path: '/services',
    name: 'services-alias',
    waypoint: 'STUDIO',
    title: 'Studio & Services — Showcase3D.cloud Creative Technology',
    description: 'Our craft philosophy, 3-step delivery process, bespoke 3D WebGL packages, and FAQs.'
  },
  {
    path: '/contact',
    name: 'contact',
    waypoint: 'DRAWER',
    title: 'Commission the Studio — Showcase3D.cloud Spatial Dispatch',
    description: 'Direct atelier dispatch. Commission a bespoke 3D WebGL experience or architectural consultation.',
    isModal: true
  },
  {
    path: '/hire',
    name: 'hire-alias',
    waypoint: 'DRAWER',
    title: 'Commission the Studio — Showcase3D.cloud Spatial Dispatch',
    description: 'Direct atelier dispatch. Commission a bespoke 3D WebGL experience or architectural consultation.',
    isModal: true
  }
];

/**
 * Matches a URL pathname against configured routes, extracting dynamic params.
 */
export function matchRoute(pathname: string): MatchedRoute {
  // Normalize pathname: remove trailing slash unless root
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  for (const def of ROUTES) {
    if (def.path.includes(':')) {
      const defParts = def.path.split('/').filter(Boolean);
      const urlParts = cleanPath.split('/').filter(Boolean);

      if (defParts.length === urlParts.length) {
        const params: Record<string, string> = {};
        let isMatch = true;

        for (let i = 0; i < defParts.length; i++) {
          if (defParts[i].startsWith(':')) {
            const paramKey = defParts[i].slice(1);
            params[paramKey] = urlParts[i];
          } else if (defParts[i] !== urlParts[i]) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          return { route: def, params, pathname: cleanPath };
        }
      }
    } else if (def.path === cleanPath) {
      return { route: def, params: {}, pathname: cleanPath };
    }
  }

  // Fallback to home route
  return {
    route: ROUTES[0],
    params: {},
    pathname: '/'
  };
}
