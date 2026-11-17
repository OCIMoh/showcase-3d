/**
 * StoryView — Heritage, Production, and Generational Craft (English)
 */

export function createStoryView(type: 'produzione' | 'chi-siamo' | 'experience' = 'produzione'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'page-container';

  const titles = {
    produzione: {
      eyebrow: 'Tradition & Method • Sicily',
      title: 'Our Production Method',
      desc: 'From volcanic soil to glass jar: honoring natural seasonal rhythms and gentle low-temperature cooking in copper kettles.'
    },
    'chi-siamo': {
      eyebrow: 'Generations of Growers',
      title: 'Our Story',
      desc: 'Custodians of Mount Etna\'s biodiversity since 1892. Cultivating passion, ancestral roots, and pure Sicilian authenticity.'
    },
    experience: {
      eyebrow: 'Tours & Guided Tastings',
      title: 'The Farm Experience',
      desc: 'Stroll among our century-old citrus groves and discover the timeless secrets of artisanal Sicilian preserve making.'
    }
  }[type];

  container.innerHTML = `
    <header class="page-header">
      <span class="page-eyebrow">${titles.eyebrow}</span>
      <h1 class="page-title">${titles.title}</h1>
      <p class="page-desc">${titles.desc}</p>
    </header>

    <div class="story-timeline">
      <div class="story-item">
        <div class="story-item__media">
          <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80" alt="Orchard" loading="lazy" />
        </div>
        <div class="story-item__info">
          <div class="story-item__num">01</div>
          <h2 class="story-item__title">Sun-Drenched Dawn Harvest</h2>
          <p class="page-desc" style="text-align:left;">
            Every single citrus fruit and organic crop is hand-picked at daybreak at its peak sugar and aromatic maturity, ensuring optimal natural pectin and essential oils.
          </p>
        </div>
      </div>

      <div class="story-item">
        <div class="story-item__media">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80" alt="Craft Laboratory" loading="lazy" />
        </div>
        <div class="story-item__info">
          <div class="story-item__num">02</div>
          <h2 class="story-item__title">Low-Temperature Vacuum Cooking</h2>
          <p class="page-desc" style="text-align:left;">
            Slow gentle reduction preserves vivid fruit colors, natural vitamins, and delicate volatile citrus aromas without charring natural sugars.
          </p>
        </div>
      </div>

      <div class="story-item">
        <div class="story-item__media">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" alt="Pure Preserves" loading="lazy" />
        </div>
        <div class="story-item__info">
          <div class="story-item__num">03</div>
          <h2 class="story-item__title">Hand-Sealed Glass Jars</h2>
          <p class="page-desc" style="text-align:left;">
            Zero artificial preservatives or chemicals. Only ancestral Sicilian knowledge combining gentle heat with the natural acidity of fresh citrus.
          </p>
        </div>
      </div>
    </div>
  `;

  return container;
}
