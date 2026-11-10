/**
 * Hardcoded story library — the six Rwandan heritage stories authored in
 * src/data/stories/*.js.  These are the default content shown in the Stories
 * tab before any backend / CRUD stories are loaded (see services/api.ts).
 *
 * Each raw story object carries an `image` field set to a key inside
 * assets/images/commonsImageCache.json.  We resolve that key to a remote URL
 * here and also pick a bundled ImageKey as a graceful fallback for offline
 * use or broken links (SmartImage tries `uri` first, then `imageKey`).
 *
 * Ruganzu's story uses multilingual { en, rw, fr } objects for title / desc /
 * content; the others use plain strings.  Both shapes are handled below.
 */
import { gihangaStory } from './stories/gihanga';
import { nyirarucyabaStory } from './stories/nyirarucyaba';
import { ruganzuStory } from './stories/ruganzu';
import { kigeliStory } from './stories/kigeli';
import { ryangombeStory } from './stories/ryangombe';
import { inangaStory } from './stories/inanga';
import commonsImageCache from '../../assets/images/commonsImageCache.json';
import type { ImageKey } from './images';
import type { Story } from '../types';

// ─── Raw story shape (loose — JS modules are not type-checked) ────────────────

type Localized = { en?: string; rw?: string; fr?: string };

interface RawStory {
  id: string;
  title: string | Localized;
  category: string;
  explorerCategory?: string;
  location?: string;
  /** Key into commonsImageCache.json. */
  image: string;
  xpReward?: number;
  desc: string | Localized;
  content: string | Localized;
  quiz?: unknown[];
}

const rawStories: RawStory[] = [
  gihangaStory,
  nyirarucyabaStory,
  ruganzuStory,
  kigeliStory,
  ryangombeStory,
  inangaStory,
] as RawStory[];

// ─── Bundled fallback images (used when the remote URL fails) ─────────────────

const FALLBACK_IMAGE: Record<string, ImageKey> = {
  'gihanga-ngomijana': 'hills',
  nyirarucyaba: 'hills',
  'ruganzu-ii-ndoli': 'volcanoes',
  'kigeli-iv-rwabugiri': 'lakeKivu',
  ryangombe: 'volcanoes',
  'inanga-mazimpaka': 'festival',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pick the English text from a string or a { en, rw, fr } object. */
function pickLang(value: string | Localized): string {
  if (typeof value === 'string') return value;
  return value.en ?? value.rw ?? value.fr ?? '';
}

/** Split content (paragraphs joined by blank lines) into a body array. */
function toBodyArray(content: string | Localized): string[] {
  return pickLang(content)
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Look up a commons cache key and return the remote URL (or undefined). */
function resolveImageUrl(cacheKey: string): string | undefined {
  const cache = commonsImageCache as Record<string, string>;
  const url = cache[cacheKey];
  // Skip base64 data URIs — too heavy for the story cards. Fall back to bundled image.
  if (url && url.startsWith('http')) return url;
  return undefined;
}

// ─── Map raw stories → Story type ─────────────────────────────────────────────

const mappedStories: Story[] = rawStories.map((raw) => {
  const image = FALLBACK_IMAGE[raw.id] ?? 'hills';
  return {
    id: raw.id,
    title: pickLang(raw.title),
    subtitle: raw.location ?? '',
    category: raw.category,
    summary: pickLang(raw.desc),
    body: toBodyArray(raw.content),
    tags: [raw.category, raw.explorerCategory, raw.location].filter(Boolean) as string[],
    image,
    imageUrl: resolveImageUrl(raw.image),
    gallery: [],
    relatedStoryIds: [],
    location: raw.location,
    explorerCategory: raw.explorerCategory,
    isDemo: false,
    sourceNote: 'Rwandan oral tradition. Versions may differ across communities.',
  };
});

// ─── Related stories & gallery (same logic as the previous stories.ts) ───────

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

// ─── Public exports ───────────────────────────────────────────────────────────

export const mockStories: Story[] = mappedStories.map((s) => ({
  ...s,
  relatedStoryIds: relatedIds(s.id, s.category, s.explorerCategory),
  gallery: galleryFor(s.image),
}));

export const storyCategories: string[] = Array.from(
  new Set(rawStories.map((s) => s.category)),
);

export const getStoryById = (id: string): Story | undefined =>
  mockStories.find((s) => s.id === id);
