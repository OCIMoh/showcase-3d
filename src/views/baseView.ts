/**
 * Base Spatial View Interface
 * Provides standardized lifecycle hooks for HTML route overlays.
 */

export interface SpatialView {
  readonly id: string;
  mount(container: HTMLElement): void;
  enter(prevPath?: string): Promise<void>;
  exit(nextPath?: string): Promise<void>;
  destroy(): void;
  getElement(): HTMLElement | null;
  isVisible(): boolean;
}
