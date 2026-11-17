/**
 * CatalogView — Pantry Grid with Category Filters & Card Hovers (English)
 */

import { PRODUCTS, Product } from '../data/products';

export function createCatalogView(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  container.innerHTML = `
    <header class="page-header">
      <span class="page-eyebrow">Artisanal Harvest • Sicily</span>
      <h1 class="page-title">The Botanical Pantry</h1>
      <p class="page-desc">
        Artisanal preserves, marmalades, sweet spreads, and delicacies crafted in small batches from organic crops grown on the volcanic slopes of Mount Etna.
      </p>
    </header>

    <div class="filter-tabs">
      <button class="filter-tab active" data-filter="all">All Preserves</button>
      <button class="filter-tab" data-filter="sweet">Sweet & Jams</button>
      <button class="filter-tab" data-filter="savory">Savory Delights</button>
      <button class="filter-tab" data-filter="spread">Sweet Spreads</button>
      <button class="filter-tab" data-filter="condiment">Condiments</button>
    </div>

    <div class="product-grid" id="catalogGrid"></div>
  `;

  setTimeout(() => {
    const grid = container.querySelector<HTMLElement>('#catalogGrid');
    const tabs = container.querySelectorAll<HTMLButtonElement>('.filter-tab');
    if (!grid) return;

    function renderProducts(items: Product[]) {
      if (!grid) return;
      grid.innerHTML = items
        .map(
          (p) => `
        <article class="product-card" data-category="${p.category}">
          <div class="product-card__thumb">
            <img src="${p.jarUrl || p.image}" alt="${p.title}" loading="lazy" />
          </div>
          <span class="product-card__category">${p.category.toUpperCase()} • ${p.weight}</span>
          <h2 class="product-card__title">${p.title}</h2>
          <p class="product-card__desc">${p.description}</p>
          <div class="product-card__footer">
            <span class="product-card__price">${p.price}</span>
            <a href="/dispensa/${p.slug}" class="product-card__btn">View Details</a>
          </div>
        </article>
      `
        )
        .join('');
    }

    renderProducts(PRODUCTS);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        if (filter === 'all') {
          renderProducts(PRODUCTS);
        } else {
          renderProducts(PRODUCTS.filter((p) => p.category === filter));
        }
      });
    });
  }, 0);

  return container;
}
