import { exploreStories, stories } from './data';
import type { DestinationCategory, ProductCategory } from '../types';

export const productCategories: ProductCategory[] = ['Handicrafts', 'Food & Drinks', 'Art'];

export const destinationCategories: DestinationCategory[] = ['Nature', 'Lakes', 'Culture', 'City'];

const fromBundled = [...stories.map((s) => s.category), ...exploreStories.map((s) => s.category)];

export const storyCategories: string[] = Array.from(new Set(fromBundled));

export const productCategoryIds: Record<ProductCategory, string> = {
  Handicrafts: 'handicrafts',
  'Food & Drinks': 'food-drinks',
  Art: 'art',
};
