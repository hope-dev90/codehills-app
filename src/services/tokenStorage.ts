/**
 * Secure token storage for JWT access + refresh tokens.
 *
 * Uses expo-secure-store on iOS/Android (encrypted keychain/keystore).
 * Falls back to AsyncStorage on web where SecureStore is unavailable.
 * Tokens are NEVER stored in plain AsyncStorage on native platforms.
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_KEY  = 'umuco.access_token';
const REFRESH_KEY = 'umuco.refresh_token';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

async function set(key: string, value: string): Promise<void> {
  if (isNative) {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

async function get(key: string): Promise<string | null> {
  if (isNative) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function remove(key: string): Promise<void> {
  if (isNative) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

export const tokenStorage = {
  getAccessToken:  ()                   => get(ACCESS_KEY),
  setAccessToken:  (token: string)      => set(ACCESS_KEY, token),
  removeAccessToken: ()                 => remove(ACCESS_KEY),

  getRefreshToken: ()                   => get(REFRESH_KEY),
  setRefreshToken: (token: string)      => set(REFRESH_KEY, token),
  removeRefreshToken: ()                => remove(REFRESH_KEY),

  async setTokenPair(access: string, refresh: string): Promise<void> {
    await Promise.all([set(ACCESS_KEY, access), set(REFRESH_KEY, refresh)]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([remove(ACCESS_KEY), remove(REFRESH_KEY)]);
  },
};
