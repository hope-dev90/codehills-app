// data/stories/index.js
//
// Central library of all written stories. Used by Home.jsx as the LOCAL
// fallback for the personalized "highlight" card while the real backend
// endpoint (/api/heritage?category=...) doesn't exist yet. Once that backend
// is live, it takes priority automatically — this file only fills the gap
// until then, and keeps working afterward as a safety net if that request
// ever fails or returns nothing.

import { gihangaStory } from './gihanga';
import { nyirarucyabaStory } from './nyirarucyaba';
import { ruganzuStory } from './ruganzu';
import { kigeliStory } from './kigeli';
import { ryangombeStory } from './ryangombe';
import { inangaStory } from './inanga';

export const ALL_STORIES = [
  gihangaStory,
  nyirarucyabaStory,
  ruganzuStory,
  kigeliStory,
  ryangombeStory,
  inangaStory,
];

/**
 * Returns the best local story to show as the dashboard's "Today's Highlight"
 * for a given explorer category ('warrior' | 'nature' | 'royal' | 'folklore' | 'music').
 *
 * Every explorer type now has at least one matching story:
 *   warrior          → Ruganzu II Ndoli, Kigeli IV Rwabugiri
 *   royal-historian  → Gihanga Ngomijana
 *   folktale-hunter  → Nyirarucyaba
 *   nature-lover     → Ryangombe
 *   music-explorer   → The Inanga and the Poet-King
 */
export function getHighlightForCategory(category) {
  const match = ALL_STORIES.find((s) => s.explorerCategory === category);
  return match || ALL_STORIES[0];
}

export default ALL_STORIES;