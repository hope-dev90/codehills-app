/**
 * User collections — favorites, bookmarks, saved places, unlocked stories.
 *
 * When connected to the backend, every toggle is synced immediately.
 * On error the function throws so the caller (AppContext) can decide
 * whether to roll back the local optimistic update.
 *
 * All functions are no-ops when useMockData is true.
 */
import { config } from './config';
import { api } from './apiClient';

// ─── Favorites ───────────────────────────────────────────────────────────────

export async function syncFavorite(productId: string): Promise<{ favorited: boolean }> {
  if (config.useMockData) return { favorited: true };
  return api.post<{ favorited: boolean; productId: string }>(`/favorites/${productId}/toggle`, {});
}

export async function fetchFavoriteIds(): Promise<string[]> {
  if (config.useMockData) return [];
  try {
    const res = await api.get<{ ids: string[] }>('/favorites/ids');
    return res.ids;
  } catch { return []; }
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export async function syncBookmark(storyId: string): Promise<{ bookmarked: boolean }> {
  if (config.useMockData) return { bookmarked: true };
  return api.post<{ bookmarked: boolean; storyId: string }>(`/bookmarks/${storyId}/toggle`, {});
}

export async function fetchBookmarkIds(): Promise<string[]> {
  if (config.useMockData) return [];
  try {
    const res = await api.get<{ ids: string[] }>('/bookmarks/ids');
    return res.ids;
  } catch { return []; }
}

// ─── Saved places ─────────────────────────────────────────────────────────────
// Saved places are local-only; no dedicated backend endpoint exists yet.
// They remain in AsyncStorage via AppData.savedPlaces.

// ─── Unlocked stories ─────────────────────────────────────────────────────────

export async function fetchUnlockedStoryIds(): Promise<string[]> {
  if (config.useMockData) return [];
  try {
    const res = await api.get<{ ids: string[] }>('/rewards/ids');
    return res.ids;
  } catch { return []; }
}
