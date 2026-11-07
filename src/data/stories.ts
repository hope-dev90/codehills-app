import { exploreStories, stories as bundledStories } from './data';
import { resolveImageKey } from './imageAliases';
import { storyCategories } from './categories';
import type { ImageKey } from './images';
import type { Story } from '../types';

function relatedIds(currentId: string, category: string, explorer?: string): string[] {
  const pool = mappedStories.filter((s) => s.id !== currentId);
  const sameExplorer = explorer ? pool.filter((s) => s.explorerCategory === explorer) : [];
  const sameCategory = pool.filter((s) => s.category === category);
  const picks = [...sameExplorer, ...sameCategory.filter((s) => !sameExplorer.includes(s))];
  return Array.from(new Set(picks.map((s) => s.id))).slice(0, 4);
}

function galleryFor(image: ImageKey): ImageKey[] {
  const extras: ImageKey[] = ['hills', 'dance', 'imigongo', 'basket', 'lakeKivu', 'artisan'];
  return extras.filter((k) => k !== image).slice(0, 3);
}

const coreStories: Story[] = bundledStories.map((s) => {
  const image = resolveImageKey(s.imageKey);
  return {
    id: s.id,
    title: s.title,
    subtitle: s.location,
    category: s.category,
    summary: s.description,
    body: [s.description, s.contentSummary],
    tags: [s.category, s.explorerCategory, s.location].filter(Boolean),
    image,
    gallery: galleryFor(image),
    relatedStoryIds: [],
    location: s.location,
    explorerCategory: s.explorerCategory,
    isDemo: false,
    sourceNote: 'Bundled CodeHills story summary. Oral-tradition versions may differ.',
  };
});

const exploreAsStories: Story[] = exploreStories.map((s) => {
  const image = resolveImageKey(s.imageKey);
  return {
    id: s.id,
    title: s.title,
    subtitle: s.location,
    category: s.category,
    summary: s.description,
    body: [s.description],
    tags: [s.category, s.era, s.location].filter(Boolean),
    image,
    gallery: galleryFor(image),
    relatedStoryIds: [],
    location: s.location,
    explorerCategory: s.era,
    isDemo: false,
    sourceNote: 'Bundled CodeHills explore entry from local data.js.',
  };
});

const mappedStories: Story[] = [...coreStories, ...exploreAsStories];

export const mockStories: Story[] = mappedStories.map((s) => ({
  ...s,
  relatedStoryIds: relatedIds(s.id, s.category, s.explorerCategory).filter((id) =>
    mappedStories.some((other) => other.id === id),
  ),
}));

export { storyCategories };

export const getStoryById = (id: string): Story | undefined => mockStories.find((s) => s.id === id);
