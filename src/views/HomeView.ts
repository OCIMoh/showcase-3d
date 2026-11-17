/**
 * HomeView — The Multi-Experience Product Showcase
 * Toggle seamlessly between award-winning carousel archetypes:
 * 1. Studio K95 10° Incline Marquee (Original)
 * 2. WebGL Liquid Wave & Chromatic Aberration Shader
 * 3. Elastic Tactile Peeling Card Deck
 * 4. Active Theory 3D Spatial Ribbon & Vertical Tunnel
 * 5. Bi-Directional Counter-Motion Editorial Split (Aesop / Byredo / Locomotive)
 * 6. Off-Screen Orbital Sundial Arc (Hermès Timepieces / Bang & Olufsen)
 * 7. A24 35mm Cinema Film Strip & Anamorphic Dolly (A24 Films)
 * 8. Aristide Benoist Accordion Slat Reel & Brutalist Meter (Aristide Benoist)
 */

import { PRODUCTS, Product } from '../data/products';
import { AgrumeaCarousel } from '../engine/carousel';
import { WebglLiquidCarousel } from '../engine/webglCarousel';
import { ElasticDeckCarousel } from '../engine/deckCarousel';
import { ActiveTheoryCarousel } from '../engine/activeTheoryCarousel';
import { SplitEditorialCarousel } from '../engine/splitCarousel';
import { OrbitalSundialCarousel } from '../engine/orbitalCarousel';
import { A24CinemaCarousel } from '../engine/a24Carousel';
import { AristideSlatsCarousel } from '../engine/aristideCarousel';

type CarouselMode = 'incline' | 'liquid' | 'deck' | 'activetheory' | 'split' | 'orbital' | 'a24' | 'aristide';

export function createHomeView(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'view-home';

  container.innerHTML = `
    <!-- Active Carousel Mounting Stage -->
    <div class="carousel-stage" id="carouselStage" style="position:relative; width:100vw; height:100vh; overflow:hidden;"></div>

    <!-- Floating Mode Switcher Dock -->
    <nav class="carousel-mode-dock" aria-label="Carousel Experience Switcher">
      <button class="carousel-mode-dock__btn is-active" data-mode="incline" type="button" aria-label="10° Incline Marquee mode">
        <span class="carousel-mode-dock__btn-icon">✦</span>
        <span>10° Incline</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="liquid" type="button" aria-label="WebGL Liquid Shader mode">
        <span class="carousel-mode-dock__btn-icon">≋</span>
        <span>Liquid GL</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="deck" type="button" aria-label="Elastic Card Deck mode">
        <span class="carousel-mode-dock__btn-icon">❐</span>
        <span>Card Deck</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="activetheory" type="button" aria-label="Active Theory 3D Ribbon mode">
        <span class="carousel-mode-dock__btn-icon">⟁</span>
        <span>Active Theory 3D</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="split" type="button" aria-label="Bi-Directional Editorial Split mode">
        <span class="carousel-mode-dock__btn-icon">⧉</span>
        <span>Editorial Split</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="orbital" type="button" aria-label="Off-Screen Orbital Sundial Arc mode">
        <span class="carousel-mode-dock__btn-icon">◌</span>
        <span>Orbital Arc</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="a24" type="button" aria-label="A24 35mm Cinema Film Strip mode">
        <span class="carousel-mode-dock__btn-icon">🎞</span>
        <span>A24 Cinema</span>
      </button>
      <button class="carousel-mode-dock__btn" data-mode="aristide" type="button" aria-label="Aristide Benoist Accordion Slats mode">
        <span class="carousel-mode-dock__btn-icon">☌</span>
        <span>Aristide Slats</span>
      </button>
    </nav>
  `;

  let activeEngine: { destroy: () => void } | null = null;
  let currentMode: CarouselMode = 'incline';

  const navigateToProduct = (prod: Product) => {
    window.history.pushState({}, '', `/dispensa/${prod.slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const mountMode = (mode: CarouselMode) => {
    const stage = container.querySelector<HTMLElement>('#carouselStage');
    if (!stage) return;

    // Teardown previous engine
    if (activeEngine) {
      activeEngine.destroy();
      activeEngine = null;
    }
    stage.innerHTML = '';
    currentMode = mode;

    // Update active button state
    container.querySelectorAll('.carousel-mode-dock__btn').forEach(btn => {
      if ((btn as HTMLElement).dataset.mode === mode) {
        btn.classList.add('is-active');
        try {
          (btn as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } catch {
          // Safe fallback for older browsers
        }
      } else {
        btn.classList.remove('is-active');
      }
    });

    if (mode === 'incline') {
      // 1. Studio K95 10° Incline Marquee Mode
      stage.innerHTML = `
        <section class="jar-slider" id="jarSlider" data-jar-slider data-anim="hero" data-jar-slider-ready="true">
          <h1 class="visually-hidden">Agrumêa Farm: Artisanal Sicilian preserves, marmalades, sweet spreads and delicacies</h1>

          <!-- Deep Burgundy Geometric Arch Layer -->
          <div class="jar-slider__shape-layer" id="shapeLayer" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
            
            <!-- Revolving Terracotta Typographic Seal -->
            <div class="jar-slider__badge jar-slider__badge--artwork" id="sliderBadge">
              <img class="jar-slider__badge-artwork" src="/images/home/circle-text-en.svg" width="1169" height="1169" alt="" decoding="async">
            </div>
          </div>

          <!-- Center Lower Discovery Prompt -->
          <div class="jar-slider__overlay">
            <p class="jar-slider__prompt is-ready">Scroll or Drag to explore</p>
          </div>

          <!-- 10° Diagonal Marquee Track & Cutout Glass Jars -->
          <div class="jar-slider__wrapper" id="sliderWrapper" data-jar-slider-wrap>
            <div class="jar-slider__marquee" id="sliderMarquee">
              <div class="jar-slider__track" id="sliderTrack" data-jar-slider-track></div>
            </div>
          </div>
        </section>
      `;

      const wrapper = stage.querySelector<HTMLElement>('#sliderWrapper');
      const track = stage.querySelector<HTMLElement>('#sliderTrack');
      const badge = stage.querySelector<HTMLElement>('#sliderBadge');

      if (wrapper && track) {
        activeEngine = new AgrumeaCarousel({
          wrapper,
          track,
          badge,
          products: PRODUCTS,
          inclineAngle: 10,
          onSelectProduct: navigateToProduct
        });
      }
    } else if (mode === 'liquid') {
      // 2. WebGL Liquid & Chromatic Aberration Mode
      stage.innerHTML = `
        <div class="webgl-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.45; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="webglMount" style="position:absolute; inset:0;"></div>
        </div>
      `;

      const webglMount = stage.querySelector<HTMLElement>('#webglMount')!;
      activeEngine = new WebglLiquidCarousel({
        container: webglMount,
        products: PRODUCTS,
        onSelectProduct: navigateToProduct
      });
    } else if (mode === 'deck') {
      // 3. Elastic Tactile Card Deck Mode
      stage.innerHTML = `
        <div class="deck-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.45; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="deckMount" style="position:absolute; inset:0;"></div>
        </div>
      `;

      const deckMount = stage.querySelector<HTMLElement>('#deckMount')!;
      activeEngine = new ElasticDeckCarousel({
        container: deckMount,
        products: PRODUCTS,
        onSelectProduct: navigateToProduct
      });
    } else if (mode === 'activetheory') {
      // 4. Active Theory 3D Spatial Ribbon Mode
      stage.innerHTML = `
        <div class="activetheory-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.35; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="atMount" style="position:absolute; inset:0;"></div>
        </div>
      `;

      const atMount = stage.querySelector<HTMLElement>('#atMount')!;
      activeEngine = new ActiveTheoryCarousel({
        container: atMount,
        products: PRODUCTS,
        onSelectProduct: navigateToProduct
      });
    } else if (mode === 'split') {
      // 5. Bi-Directional Counter-Motion Editorial Split Mode
      stage.innerHTML = `
        <div class="split-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.25; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="splitMount" style="position:absolute; inset:0;"></div>
        </div>
      `;

      const splitMount = stage.querySelector<HTMLElement>('#splitMount')!;
      activeEngine = new SplitEditorialCarousel({
        container: splitMount,
        products: PRODUCTS,
        onSelectProduct: navigateToProduct
      });
    } else if (mode === 'orbital') {
      // 6. Off-Screen Orbital Sundial Arc Mode (Hermès / B&O)
      stage.innerHTML = `
        <div class="orbital-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <!-- Subtle atmospheric burgundy backdrop -->
          <div class="jar-slider__shape-layer" style="opacity:0.25; transform: translate3d(-50%, 0, 0);" aria-hidden="true">
            <img class="jar-slider__shape-image" src="/images/home/back-slider-home.svg" width="1407" height="601" alt="" decoding="async">
          </div>
          <div id="orbitalMount" style="position:absolute; inset:0;"></div>
        </div>
      `;

      const orbitalMount = stage.querySelector<HTMLElement>('#orbitalMount')!;
      activeEngine = new OrbitalSundialCarousel({
        container: orbitalMount,
        products: PRODUCTS,
        onSelectProduct: navigateToProduct
      });
    } else if (mode === 'a24') {
      // 7. A24 35mm Cinema Film Strip Mode
      stage.innerHTML = `
        <div class="a24-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="a24Mount" style="position:absolute; inset:0;"></div>
        </div>
      `;

      const a24Mount = stage.querySelector<HTMLElement>('#a24Mount')!;
      activeEngine = new A24CinemaCarousel({
        container: a24Mount,
        products: PRODUCTS,
        onSelectProduct: navigateToProduct
      });
    } else if (mode === 'aristide') {
      // 8. Aristide Benoist Accordion Slats Mode
      stage.innerHTML = `
        <div class="aristide-mount-stage" style="position:absolute; inset:0; overflow:hidden;">
          <div id="aristideMount" style="position:absolute; inset:0;"></div>
        </div>
      `;

      const aristideMount = stage.querySelector<HTMLElement>('#aristideMount')!;
      activeEngine = new AristideSlatsCarousel({
        container: aristideMount,
        products: PRODUCTS,
        onSelectProduct: navigateToProduct
      });
    }
  };

  // Wire mode switcher buttons
  container.querySelectorAll('.carousel-mode-dock__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetMode = ((e.currentTarget as HTMLElement).dataset.mode as CarouselMode) || 'incline';
      if (targetMode === currentMode) return;
      mountMode(targetMode);
    });
  });

  // Mount default mode immediately
  setTimeout(() => {
    mountMode('incline');
  }, 0);

  return container;
}
