import { mockStories } from '../data/stories';
import type { CartItem } from '../types';

/** Total number of stories that can be unlocked. */
export const totalRewardStories = (): number => mockStories.length;

/**
 * Picks the story unlocked by an order: first the story linked to a purchased product that the user
 * has not unlocked yet, then any story not unlocked yet. Returns null when everything is unlocked.
 * This is a DEMO rule; a verified rule must be enforced server-side once orders are real.
 */
export function pickRewardStory(lines: CartItem[], unlocked: string[]): string | null {
  const linked = lines.map((l) => l.rewardStoryId).find((id) => !unlocked.includes(id));
  if (linked) return linked;
  const next = mockStories.find((s) => !unlocked.includes(s.id));
  return next ? next.id : null;
}
