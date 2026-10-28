import type { Story, StoryCategory } from '../types';

/**
 * DEMONSTRATION CONTENT.
 * These texts only exist to make the layouts real. They are NOT verified heritage material.
 * The verified stories, proverbs, legends and artwork will come from https://umucocore.rw/
 * once the backend details are available (see src/services/api.ts).
 */
const DEMO_NOTE =
  'Demo text. The verified version of this story will be loaded from the CodeHills / umucocore.rw content once it is connected.';

export const storyCategories: StoryCategory[] = [
  'Culture',
  'Traditions',
  'Heritage',
  'Crafts',
  'Places',
  'Food',
];

export const mockStories: Story[] = [
  {
    id: 'intore-dance',
    title: 'The Power of Intore Dance',
    subtitle: 'Movement, rhythm and community',
    category: 'Culture',
    summary: 'A look at Intore dance as a living performance tradition in Rwanda.',
    body: [
      'Intore is a traditional Rwandan dance form that is still performed at celebrations and cultural gatherings.',
      'This placeholder paragraph stands in for the full narrative that the CodeHills team will provide: the movements, the drums, the costumes and the people who keep the dance alive.',
      DEMO_NOTE,
    ],
    tags: ['Culture', 'Dance', 'Rwanda'],
    image: 'dance',
    gallery: ['imigongo', 'festival', 'artisan'],
    isDemo: true,
    sourceNote: DEMO_NOTE,
  },
  {
    id: 'imigongo-art',
    title: 'Imigongo: More Than Art',
    subtitle: 'Geometric patterns from Rwanda',
    category: 'Crafts',
    summary: 'Imigongo is a geometric art form associated with Rwanda. Learn how it is made.',
    body: [
      'Imigongo is known for bold geometric patterns, usually in a small set of earthy colours.',
      'This placeholder text will be replaced with the verified description of the technique, its materials and its makers.',
      DEMO_NOTE,
    ],
    tags: ['Art', 'Crafts', 'Patterns'],
    image: 'imigongo',
    gallery: ['basket', 'artisan', 'hills'],
    isDemo: true,
    sourceNote: DEMO_NOTE,
  },
  {
    id: 'lake-kivu',
    title: 'The Story of Lake Kivu',
    subtitle: 'Water, hills and everyday life',
    category: 'Places',
    summary: 'Lake Kivu lies along Rwanda\'s western border. Discover the places around its shore.',
    body: [
      'Lake Kivu is one of the best-known landscapes in western Rwanda, surrounded by hills.',
      'This placeholder narrative will be replaced with locally sourced stories about the communities and traditions around the lake.',
      DEMO_NOTE,
    ],
    tags: ['Places', 'Lake', 'Nature'],
    image: 'lakeKivu',
    gallery: ['hills', 'tea', 'volcanoes'],
    isDemo: true,
    sourceNote: DEMO_NOTE,
  },
  {
    id: 'woven-baskets',
    title: 'Woven Baskets, Woven Lives',
    subtitle: 'The craft of basket weaving',
    category: 'Crafts',
    summary: 'Hand-woven baskets are a well-known Rwandan craft. Meet the idea behind the weave.',
    body: [
      'Basket weaving is a hand craft practised by artisans across Rwanda.',
      'This placeholder paragraph will be replaced with the verified story of the craft, its patterns and the artisans who practise it.',
      DEMO_NOTE,
    ],
    tags: ['Crafts', 'Handmade'],
    image: 'basket',
    gallery: ['imigongo', 'artisan', 'honey'],
    isDemo: true,
    sourceNote: DEMO_NOTE,
  },
  {
    id: 'coffee-hills',
    title: 'Coffee From the Hills',
    subtitle: 'From the farm to the cup',
    category: 'Food',
    summary: 'Coffee is grown on hillsides across Rwanda. Follow the journey from harvest to cup.',
    body: [
      'Coffee is one of the products associated with Rwanda\'s hillside farms.',
      'This placeholder text will be replaced with farmer-sourced stories about harvesting, washing, drying and tasting.',
      DEMO_NOTE,
    ],
    tags: ['Food', 'Coffee', 'Farming'],
    image: 'coffeeHarvest',
    gallery: ['coffee', 'tea', 'hills'],
    isDemo: true,
    sourceNote: DEMO_NOTE,
  },
  {
    id: 'proverbs',
    title: 'Proverbs and Sayings',
    subtitle: 'Wisdom passed on in words',
    category: 'Traditions',
    summary: 'Proverbs carry values from one generation to the next. A home for them in the app.',
    body: [
      'Proverbs and sayings are an important part of oral tradition.',
      'No proverbs are reproduced here on purpose: they will be added from the verified collection published by the CodeHills team so that wording and meaning are accurate.',
      DEMO_NOTE,
    ],
    tags: ['Traditions', 'Language'],
    image: 'hills',
    gallery: ['lakeKivu', 'tea', 'dance'],
    isDemo: true,
    sourceNote: DEMO_NOTE,
  },
  {
    id: 'honey-hills',
    title: 'Honey and the Hills',
    subtitle: 'Local products, local hands',
    category: 'Heritage',
    summary: 'Small producers and their products: the idea behind shopping local.',
    body: [
      'Local producers bring honey, tea and coffee from the hills to the market.',
      'This placeholder text will be replaced with verified producer stories.',
      DEMO_NOTE,
    ],
    tags: ['Heritage', 'Local'],
    image: 'honey',
    gallery: ['tea', 'coffee', 'basket'],
    isDemo: true,
    sourceNote: DEMO_NOTE,
  },
];

export const getStoryById = (id: string): Story | undefined => mockStories.find((s) => s.id === id);
