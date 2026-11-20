/**
 * SpatialRouter — Persistent Client-Side History Router
 * 
 * - Zero external framework dependencies
 * - Preserves WebGL context permanently across all route transitions
 * - Synchronizes browser history (pushState/popstate)
 * - Intercepts internal <a> clicks for seamless 0ms perceived transitions
 * - Updates document title and meta description dynamically
 */

import { matchRoute, MatchedRoute } from './routes';

export type RouteChangeHandler = (current: MatchedRoute, previous: MatchedRoute | null) => void;

export class SpatialRouter {
  private currentMatched: MatchedRoute;
  private previousMatched: MatchedRoute | null = null;
  private listeners: Set<RouteChangeHandler> = new Set();
  private metaDescriptionEl: HTMLMetaElement | null = null;

  constructor() {
    this.currentMatched = matchRoute(window.location.pathname);
    this.metaDescriptionEl = document.querySelector('meta[name="description"]');

    // 1. Listen for browser back / forward buttons
    window.addEventListener('popstate', () => {
      this.handleLocationChange(window.location.pathname, false);
    });

    // 2. Intercept internal anchor clicks
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      // Ignore external links, mailto, tel, downloads, or target="_blank"
      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('rel')?.includes('external') ||
        anchor.href.startsWith('mailto:') ||
        anchor.href.startsWith('tel:')
      ) {
        return;
      }

      // Check if same origin
      if (anchor.origin === window.location.origin) {
        const targetPath = anchor.pathname;
        // Don't intercept anchor hash jumps on the same page
        if (targetPath === window.location.pathname && anchor.hash) {
          return;
        }

        e.preventDefault();
        this.navigate(targetPath);
      }
    });
  }

  /**
   * Navigates to a new route without reloading the browser.
   */
  public navigate(path: string, options: { replace?: boolean; silent?: boolean } = {}): void {
    const cleanPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    if (window.location.pathname === cleanPath && !options.replace) {
      return;
    }

    if (options.replace) {
      window.history.replaceState({ path: cleanPath }, '', cleanPath);
    } else {
      window.history.pushState({ path: cleanPath }, '', cleanPath);
    }

    this.handleLocationChange(cleanPath, options.silent ?? false);
  }

  /**
   * Register a route change callback.
   */
  public onRoute(handler: RouteChangeHandler): () => void {
    this.listeners.add(handler);
    // Immediately call with current route
    handler(this.currentMatched, null);
    return () => this.listeners.delete(handler);
  }

  public getCurrentRoute(): MatchedRoute {
    return this.currentMatched;
  }

  public getPreviousRoute(): MatchedRoute | null {
    return this.previousMatched;
  }

  private handleLocationChange(pathname: string, silent: boolean): void {
    const nextMatched = matchRoute(pathname);
    this.previousMatched = this.currentMatched;
    this.currentMatched = nextMatched;

    // Update document title and description
    this.updateMetadata(nextMatched);

    if (!silent) {
      this.listeners.forEach((fn) => {
        try {
          fn(nextMatched, this.previousMatched);
        } catch (err) {
          console.error('[SpatialRouter] Error in route listener:', err);
        }
      });
    }
  }

  private updateMetadata(matched: MatchedRoute): void {
    const fullUrl = `https://showcase3d.cloud${matched.pathname === '/' ? '' : matched.pathname}`;
    const title = matched.route.title || 'Showcase3D.cloud — Custom Interactive 3D Websites & Spatial Web Design';
    const desc = matched.route.description || 'We design and engineer bespoke, high-performance 3D websites and WebGL experiences that turn ordinary brand visits into unforgettable interactive spaces.';

    // 1. Document Title
    document.title = title;

    // 2. Meta Description
    if (this.metaDescriptionEl) {
      this.metaDescriptionEl.content = desc;
    }

    // 3. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

    // 4. Open Graph Tags
    const setMetaProp = (prop: string, val: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.content = val;
    };
    setMetaProp('og:title', title);
    setMetaProp('og:description', desc);
    setMetaProp('og:url', fullUrl);

    // 5. Twitter Tags
    const setMetaName = (name: string, val: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.content = val;
    };
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', desc);

    // 6. Accessible Screen Reader Announcement
    const ariaLive = document.getElementById('maAriaLive');
    if (ariaLive) {
      ariaLive.textContent = `Navigated to ${matched.route.name.replace(/-/g, ' ')}: ${title}`;
    }
  }
}
