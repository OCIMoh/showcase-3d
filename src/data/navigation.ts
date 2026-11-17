/**
 * Navigation Routes Configuration
 */

export interface NavRoute {
  path: string;
  label: string;
  title: string;
}

export const NAV_ROUTES: NavRoute[] = [
  { path: '/', label: 'Home', title: 'Agrumêa Farm — Artisanal Preserves' },
  { path: '/dispensa', label: 'Dispensa', title: 'La Dispensa — Botanical Pantry' },
  { path: '/produzione', label: 'Produzione', title: 'Produzione — Heritage & Craft' },
  { path: '/experience', label: 'Experience', title: 'Experience — Orchard Tasting' },
  { path: '/chi-siamo', label: 'Chi Siamo', title: 'Chi Siamo — Generational Story' },
  { path: '/contatti', label: 'Contatti', title: 'Contatti — Floridia Estate' }
];

