import { images, type ImageKey } from './images';

/**
 * Logical image keys from src/data/data.js mapped onto bundled assets.
 * Keys without a dedicated photograph fall back to the closest available image.
 */
export const STORY_IMAGE_ALIASES: Record<string, ImageKey> = {
  'royal-court': 'kigali',
  buhanga: 'hills',
  ruganzu: 'volcanoes',
  'lake-kivu': 'lakeKivu',
  inanga: 'festival',
  nyanza: 'kigali',
  intore: 'dance',
  artifact: 'imigongo',
  weaving: 'basket',
  safari: 'hills',
  imigongo: 'imigongo',
};

/** Image keys referenced by data.js that do not have a dedicated local asset. */
export const MISSING_STORY_IMAGE_ASSETS = [
  'royal-court',
  'buhanga',
  'ruganzu',
  'inanga',
  'nyanza',
  'intore',
  'artifact',
  'weaving',
  'safari',
] as const;

export function resolveImageKey(key: string | undefined | null): ImageKey {
  if (key && key in images) return key as ImageKey;
  if (key && STORY_IMAGE_ALIASES[key]) return STORY_IMAGE_ALIASES[key];
  return 'hills';
}

export function isKnownImageKey(key: string): key is ImageKey {
  return key in images;
}
