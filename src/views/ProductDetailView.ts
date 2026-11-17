/**
 * ProductDetailView — Detailed Product Showcase & Ingredients (English)
 */

import { PRODUCTS } from '../data/products';

export function createProductDetailView(params: Record<string, string>): HTMLElement {
  const container = document.createElement('div');
  const slug = params.slug || 'smeraldo';
  const product = PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];

  container.innerHTML = `
    <div class="product-detail">
      <div class="product-detail__stage">
        <span class="product-detail__badge">CERTIFIED ORGANIC • 100% SICILIAN</span>
        <img src="${product.jarUrl || product.image}" alt="${product.title}" />
      </div>

      <div class="product-detail__info">
        <span class="product-card__category" style="font-size:0.85rem; margin-bottom:12px; display:block;">
          ${product.category.toUpperCase()} • ${product.weight}
        </span>
        <h1 class="page-title" style="text-align:left; margin-bottom:12px;">${product.title}</h1>
        <p style="font-family:var(--font-serif); font-size:1.15rem; color:var(--color-orange); margin-bottom:24px;">
          ${product.latinSubtitle}
        </p>

        <p class="page-desc" style="text-align:left; margin:0 0 28px 0;">
          ${product.description}
        </p>

        <div style="margin-bottom:32px;">
          <h3 style="font-family:var(--font-serif); font-size:1rem; color:var(--color-border); margin-bottom:12px;">
            Natural Ingredients:
          </h3>
          <ul style="padding-left:20px; line-height:1.8; color:var(--color-text-muted); font-size:0.95rem;">
            ${product.ingredients.map((ing) => `<li>${ing}</li>`).join('')}
          </ul>
        </div>

        <div style="display:flex; align-items:center; gap:24px; padding-top:24px; border-top:1px solid rgba(118,37,48,0.15);">
          <span style="font-family:var(--font-serif); font-size:2rem; font-weight:700; color:var(--color-border);">
            ${product.price}
          </span>
          <button id="btnAddToCart" class="btn-shop" style="padding:16px 36px; font-size:0.95rem; cursor:pointer;">
            Add to Cart
          </button>
        </div>

        <div style="margin-top:28px;">
          <a href="/dispensa" style="font-family:var(--font-serif); font-size:0.85rem; color:var(--color-orange); letter-spacing:0.1em; text-decoration:none;">
            ← BACK TO THE PANTRY
          </a>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const btn = container.querySelector('#btnAddToCart');
    btn?.addEventListener('click', () => {
      btn.textContent = 'Added! ✓';
      setTimeout(() => (btn.textContent = 'Add to Cart'), 2000);
    });
  }, 0);

  return container;
}
