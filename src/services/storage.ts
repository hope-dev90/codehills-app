import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData } from '../types';

const KEY = 'codehills.appdata.v1';

export const defaultAppData: AppData = {
  user: null,
  preferences: { language: 'en', rememberMe: true },
  rememberedContact: '',
  cart: [],
  favorites: [],
  bookmarks: [],
  savedPlaces: [],
  orders: [],
  unlockedStories: [],
  business: null,
};

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultAppData;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...defaultAppData,
      ...parsed,
      preferences: { ...defaultAppData.preferences, ...(parsed.preferences ?? {}) },
    };
  } catch {
    // Corrupt or unavailable storage must never block the app from starting.
    return defaultAppData;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Persistence is best-effort for demo data.
  }
}

export async function clearAppData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
