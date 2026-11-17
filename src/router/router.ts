/**
 * Lightweight Client SPA Router with Studio K95 Sweep Panel Transitions
 */

import { globalScrollManager } from '../engine/scroll';

export type RouteHandler = (params: Record<string, string>) => Promise<HTMLElement> | HTMLElement;

export interface RouteEntry {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
  title: string;
}

export class AppRouter {
  private routes: RouteEntry[] = [];
  private mountPoint: HTMLElement;
  private transitionEl: HTMLElement;
  private isTransitioning = false;
  private isInitialLoad = true;

  constructor(mountPoint: HTMLElement) {
    this.mountPoint = mountPoint;

    // Create sweep transition panel if not present
    let trans = document.querySelector<HTMLElement>('.page-transition');
    if (!trans) {
      trans = document.createElement('div');
      trans.className = 'page-transition';
      trans.innerHTML = '<div class="page-transition__panel"></div>';
      document.body.appendChild(trans);
    }
    this.transitionEl = trans;

    window.addEventListener('popstate', () => this.handleCurrentRoute());
    document.addEventListener('click', (e) => this.handleLinkClicks(e));
  }

  public register(pathPattern: string, handler: RouteHandler, title: string = 'Agrumêa Farm'): void {
    const paramNames: string[] = [];
    const regexStr = pathPattern
      .replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');

    const pattern = new RegExp(`^${regexStr}$`);
    this.routes.push({ pattern, paramNames, handler, title });
  }

  public navigate(url: string): void {
    if (window.location.pathname === url) return;
    window.history.pushState({}, '', url);
    this.handleCurrentRoute();
  }

  public navigateTo(url: string): void {
    this.navigate(url);
  }

  private handleLinkClicks(e: MouseEvent): void {
    const target = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;

    e.preventDefault();
    this.navigate(href);
  }

  public async handleCurrentRoute(): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const path = window.location.pathname || '/';

    // Find matching route
    let matchedEntry: RouteEntry | null = null;
    let params: Record<string, string> = {};

    for (const r of this.routes) {
      const match = path.match(r.pattern);
      if (match) {
        matchedEntry = r;
        r.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        break;
      }
    }

    if (!matchedEntry && this.routes.length > 0) {
      matchedEntry = this.routes[0]; // Fallback to home
    }

    if (!matchedEntry) {
      this.isTransitioning = false;
      return;
    }

    // On initial page load, mount immediately without delay
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
      document.title = matchedEntry.title;
      this.updateActiveNavLink(path);
      window.scrollTo(0, 0);
      globalScrollManager?.scrollTo(0, { immediate: true });
      this.mountPoint.innerHTML = '';
      const newView = await matchedEntry.handler(params);
      this.mountPoint.appendChild(newView);
      this.isTransitioning = false;
      return;
    }

    // Trigger Orange Sweep Wipe In on subsequent route transitions
    this.transitionEl.classList.add('is-active');

    // Update document title and header active link
    document.title = matchedEntry.title;
    this.updateActiveNavLink(path);

    // Wait for sweep sheet to cover screen (~550ms)
    await new Promise((resolve) => setTimeout(resolve, 550));

    // Render new view & reset scroll position cleanly
    window.scrollTo(0, 0);
    globalScrollManager?.scrollTo(0, { immediate: true });
    this.mountPoint.innerHTML = '';
    const newView = await matchedEntry.handler(params);
    this.mountPoint.appendChild(newView);

    // Wait for sweep sheet to exit (~550ms)
    await new Promise((resolve) => setTimeout(resolve, 550));
    this.transitionEl.classList.remove('is-active');
    this.isTransitioning = false;
  }

  private updateActiveNavLink(currentPath: string): void {
    document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath !== '/' && href !== '/' && currentPath.startsWith(href || ''))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

