/**
 * Agrumêa Farm Products & Cutout Glass Jars
 * Authentic transparent 3D glass jar cutouts and cylindrical label textures (English)
 */

export interface Product {
  id: string;
  slug: string;
  title: string;
  latinSubtitle: string;
  category: 'sweet' | 'savory' | 'spread' | 'condiment';
  price: string;
  weight: string;
  origin: string;
  description: string;
  ingredients: string[];
  jarUrl: string;
  labelUrl: string;
  image?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'smeraldo',
    slug: 'smeraldo',
    title: 'Sicilian Pistachio Pesto',
    latinSubtitle: 'Pistacia Vera Siculus',
    category: 'savory',
    price: '€8.50',
    weight: '210g ℮',
    origin: 'Mount Etna Valley, Sicily',
    description: 'Artisanal savory pesto crafted with 65% select Sicilian pistachios, cold-pressed extra virgin olive oil, and Trapani sea salt.',
    ingredients: ['Sicilian Pistachio (65%)', 'Extra Virgin Olive Oil', 'Trapani Sea Salt', 'Black Pepper'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvhgweQX7-eWdJF_Pesto-salato_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvhgAeQX7-eWdJC_pesto_result-1.webp?auto=format,compress'
  },
  {
    id: 'marmellata_arancia',
    slug: 'marmellata_arancia',
    title: 'Sliced Orange Marmalade',
    latinSubtitle: 'Citrus Sinensis Dulcis',
    category: 'sweet',
    price: '€6.80',
    weight: '260g ℮',
    origin: 'Plain of Catania, Sicily',
    description: 'Finely sliced sun-ripened blood and blonde Sicilian oranges slow-cooked with candied rind in copper caldrons.',
    ingredients: ['Sicilian Oranges (70%)', 'Raw Cane Sugar', 'Fresh Lemon Juice'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvgwQeQX7-eWdIy_arancia_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvg-QeQX7-eWdIz_arancia_result-1.webp?auto=format,compress'
  },
  {
    id: 'caponata',
    slug: 'caponata',
    title: 'Traditional Sicilian Caponata',
    latinSubtitle: 'Solanum Melongena Agrodolce',
    category: 'savory',
    price: '€7.90',
    weight: '280g ℮',
    origin: 'Floridia, Syracuse, Sicily',
    description: 'Crisp fried eggplants in extra virgin olive oil, Nocellara olives, wild Pantelleria capers, and traditional sweet-and-sour reduction.',
    ingredients: ['Sicilian Eggplants', 'Tomato Passata', 'Nocellara Olives', 'Capers', 'Apple Cider Vinegar'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvhTgeQX7-eWdI0_caponata_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvhdAeQX7-eWdI2_caponata_result-1.webp?auto=format,compress'
  },
  {
    id: 'pestorosso',
    slug: 'pestorosso',
    title: 'Sun-Dried Tomato & Ricotta Pesto',
    latinSubtitle: 'Lycopersicon Sol Siculo',
    category: 'savory',
    price: '€6.90',
    weight: '200g ℮',
    origin: 'Hyblaean Mountains, Ragusa',
    description: 'Sun-drenched Sicilian tomatoes blended with artisanal salted ricotta, fresh sweet basil, and toasted pine nuts.',
    ingredients: ['Sun-Dried Tomato (50%)', 'Extra Virgin Olive Oil', 'Salted Ricotta', 'Toasted Pine Nuts', 'Wild Oregano'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvhfQeQX7-eWdI__pesto-rosso_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvhfgeQX7-eWdJA_pesto-rosso_result-1.webp?auto=format,compress'
  },
  {
    id: 'fregole_bacche',
    slug: 'fregole_bacche',
    title: 'Wild Strawberry & Goji Preserve',
    latinSubtitle: 'Fragaria Vesca Vulcani',
    category: 'sweet',
    price: '€7.50',
    weight: '230g ℮',
    origin: 'Maletto, Mount Etna',
    description: 'Wild Mount Etna forest strawberries paired with goji berries cultivated on mineral-rich volcanic potassium soils.',
    ingredients: ['Etna Strawberries (75%)', 'Sicilian Goji Berries', 'Raw Cane Sugar', 'Fresh Lemon Juice'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvheAeQX7-eWdI6_fragole_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvhdweQX7-eWdI5_fragola_result.webp?auto=format,compress'
  },
  {
    id: 'smeralda',
    slug: 'smeralda',
    title: 'Sweet Pistachio Cream',
    latinSubtitle: 'Pistacia Dulcis Smeralda',
    category: 'spread',
    price: '€9.50',
    weight: '200g ℮',
    origin: 'Bronte, Mount Etna',
    description: 'Velvety sweet green pistachio spread made from 45% pure Bronte PDO pistachio paste and rich cocoa butter.',
    ingredients: ['Bronte Pistachio Paste (45%)', 'Raw Cane Sugar', 'Vegetable Oils', 'Cocoa Butter', 'Skimmed Milk'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvhfweQX7-eWdJB_pesto_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvhhAeQX7-eWdJG_pistacchio_result.webp?auto=format,compress'
  },
  {
    id: 'gelsi_neri',
    slug: 'gelsi_neri',
    title: 'Black Mulberry Jam',
    latinSubtitle: 'Morus Nigra Siculus',
    category: 'sweet',
    price: '€9.20',
    weight: '220g ℮',
    origin: 'Giarre & Riposto, Sicily',
    description: 'Fresh black mulberries hand-picked at dawn along coastal orchards, celebrated for their deep floral aroma.',
    ingredients: ['Sicilian Black Mulberries (80%)', 'Raw Cane Sugar', 'Natural Fruit Pectin', 'Lemon Juice'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvhegeQX7-eWdI8_gelsi_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvheQeQX7-eWdI7_gelsi_result-1.webp?auto=format,compress'
  },
  {
    id: 'mennulata',
    slug: 'mennulata',
    title: 'Mennulata — Sweet Almond Cream',
    latinSubtitle: 'Prunus Dulcis Avola',
    category: 'spread',
    price: '€8.90',
    weight: '200g ℮',
    origin: 'Avola & Noto, Sicily',
    description: 'Pizzuta d\'Avola almonds roasted gently on wood fire and stone-ground to a luxurious buttery spread.',
    ingredients: ['Avola Pizzuta Almonds (50%)', 'Raw Cane Sugar', 'Extra Virgin Olive Oil', 'Bourbon Vanilla'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvhfAeQX7-eWdI-_mandorla_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvheweQX7-eWdI9_mandorla_result-1.webp?auto=format,compress'
  },
  {
    id: 'cipolla',
    slug: 'cipolla',
    title: 'Sweet & Sour Giarratana Onion',
    latinSubtitle: 'Allium Cepa Giarratana',
    category: 'condiment',
    price: '€6.50',
    weight: '280g ℮',
    origin: 'Giarratana, Ragusa',
    description: 'Remarkably sweet heirloom Giarratana onions braised slowly with fresh bay leaves, white wine vinegar, and wildflower honey.',
    ingredients: ['Giarratana Onions (70%)', 'Extra Virgin Olive Oil', 'White Wine Vinegar', 'Wildflower Honey', 'Bay Leaves'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvhdQeQX7-eWdI3_cipolla_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvhdgeQX7-eWdI4_cipolla-in-agrodolce_result.webp?auto=format,compress'
  },
  {
    id: 'pera_cannella',
    slug: 'pera_cannella',
    title: 'Coscia Pear & Ceylon Cinnamon',
    latinSubtitle: 'Pyrus Communis Cinnamomum',
    category: 'sweet',
    price: '€7.20',
    weight: '240g ℮',
    origin: 'Maniace, Mount Etna',
    description: 'Tender sugary Coscia pears from high Etna groves infused with freshly cold-ground Ceylon cinnamon quills.',
    ingredients: ['Etna Coscia Pears (75%)', 'Raw Cane Sugar', 'Ceylon Cinnamon (1%)', 'Lemon Juice'],
    jarUrl: 'https://images.prismic.io/agrumea-site/ahvhgQeQX7-eWdJD_pera_result.webp?auto=format,compress',
    labelUrl: 'https://images.prismic.io/agrumea-site/ahvhggeQX7-eWdJE_pera_result-1.webp?auto=format,compress'
  }
];
