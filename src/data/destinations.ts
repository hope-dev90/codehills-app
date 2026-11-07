import { exploreStories } from './data';
import { destinationCategories } from './categories';
import { resolveImageKey } from './imageAliases';
import type { Destination, DestinationCategory } from '../types';

function categoryFor(title: string, category: string): DestinationCategory {
  const hay = `${title} ${category}`.toLowerCase();
  if (hay.includes('lake') || hay.includes('falls') || hay.includes('marsh')) return 'Lakes';
  if (hay.includes('kigali') || hay.includes('stadium') || hay.includes('museum') || hay.includes('church')) {
    return 'City';
  }
  if (
    hay.includes('park') ||
    hay.includes('forest') ||
    hay.includes('mountain') ||
    hay.includes('hill') ||
    hay.includes('safari') ||
    hay.includes('cyumweru')
  ) {
    return 'Nature';
  }
  return 'Culture';
}

export { destinationCategories };

export const mockDestinations: Destination[] = exploreStories.map((s) => ({
  id: s.id,
  name: s.title,
  category: categoryFor(s.title, s.category),
  summary: s.description,
  description: `${s.description} Location: ${s.location}.`,
  latitude: s.latitude,
  longitude: s.longitude,
  image: resolveImageKey(s.imageKey),
  isDemo: false,
}));

export const getDestinationById = (id: string): Destination | undefined =>
  mockDestinations.find((d) => d.id === id);
