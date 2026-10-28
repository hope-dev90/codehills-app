import type { Product, ProductCategory } from '../types';

/**
 * DEMONSTRATION PRODUCTS. Names, prices and artisans are sample data only.
 * Replace with the real product catalogue through src/services/api.ts.
 */
export const productCategories: ProductCategory[] = ['Handicrafts', 'Food & Drinks', 'Art'];

export const mockProducts: Product[] = [
  {
    id: 'p-imigongo',
    name: 'Imigongo Art',
    priceRwf: 15000,
    category: 'Art',
    image: 'imigongo',
    description: 'A hand-made geometric wall piece in the Imigongo style.',
    craftsmanship:
      'Sample description: each piece is shaped and painted by hand. The verified craftsmanship notes will come from the artisan cooperative.',
    tags: ['Handmade', 'Local'],
    artisan: { name: 'Sample Artisan Cooperative', location: 'Rwanda (demo)' },
    rewardStoryId: 'imigongo-art',
    isDemo: true,
  },
  {
    id: 'p-coffee',
    name: 'Rwandan Coffee',
    priceRwf: 8000,
    category: 'Food & Drinks',
    image: 'coffee',
    description: 'Whole-bean coffee from Rwandan hills, roasted in small batches.',
    craftsmanship:
      'Sample description: grown, washed and dried by local producers. Verified farm details will be added with the real catalogue.',
    tags: ['Local', 'Small batch'],
    artisan: { name: 'Sample Coffee Growers', location: 'Rwanda (demo)' },
    rewardStoryId: 'coffee-hills',
    isDemo: true,
  },
  {
    id: 'p-basket',
    name: 'Traditional Basket',
    priceRwf: 12000,
    category: 'Handicrafts',
    image: 'basket',
    description: 'Handwoven by local artisans, this basket represents our heritage and craftsmanship.',
    craftsmanship:
      'Sample description: coiled and woven by hand over several days. Verified material and technique notes will come from the artisans.',
    tags: ['Handmade', 'Local', 'Woven'],
    artisan: { name: 'Sample Weavers Group', location: 'Rwanda (demo)' },
    rewardStoryId: 'woven-baskets',
    isDemo: true,
  },
  {
    id: 'p-honey',
    name: 'Tea Hills Honey',
    priceRwf: 10000,
    category: 'Food & Drinks',
    image: 'honey',
    description: 'Natural honey from a small local producer.',
    craftsmanship:
      'Sample description: collected in small quantities by local beekeepers. Verified producer information will be added later.',
    tags: ['Local', 'Natural'],
    artisan: { name: 'Sample Beekeepers', location: 'Rwanda (demo)' },
    rewardStoryId: 'honey-hills',
    isDemo: true,
  },
  {
    id: 'p-tea',
    name: 'Highland Tea',
    priceRwf: 6000,
    category: 'Food & Drinks',
    image: 'tea',
    description: 'Loose-leaf tea from the hills.',
    craftsmanship:
      'Sample description: leaves are picked by hand and dried locally. Verified details will be added with the real catalogue.',
    tags: ['Local', 'Loose leaf'],
    artisan: { name: 'Sample Tea Growers', location: 'Rwanda (demo)' },
    rewardStoryId: 'lake-kivu',
    isDemo: true,
  },
];

export const getProductById = (id: string): Product | undefined => mockProducts.find((p) => p.id === id);
