/**
 * Authentication service.
 *
 * When EXPO_PUBLIC_API_URL is set (useMockData = false) all operations hit the
 * UmucoCore backend.  When the API URL is absent the old local AsyncStorage
 * implementation is used so the app still works without a server.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { config } from './config';
import { api, ApiError } from './apiClient';
import { tokenStorage } from './tokenStorage';
import type { AuthService } from './interfaces';
import type { UserProfile } from '../types';
import { makeId } from '../utils/format';

// ─── Types shared between implementations ────────────────────────────────────

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    contact: string;
    contactType: string;
    authProvider: string;
    language: string;
  };
}

function toUserProfile(u: AuthResponse['user']): UserProfile {
  return {
    id: u.id,
    fullName: u.fullName,
    contact: u.contact,
    authProvider: (u.authProvider as 'password' | 'google') ?? 'password',
    isDemo: false,
  };
}

// ─── HTTP implementation (real backend) ──────────────────────────────────────

const httpAuthService: AuthService & {
  signInWithGoogleIdToken(idToken: string, rememberMe?: boolean): Promise<UserProfile>;
  refreshSession(): Promise<UserProfile | null>;
  updateLanguage(language: string): Promise<void>;
} = {
  async signIn(contact, password) {
    const res = await api.post<AuthResponse>('/auth/login', {
      contact,
      password,
      rememberMe: true,
    }, { skipAuth: true });
    await tokenStorage.setTokenPair(res.accessToken, res.refreshToken);
    return toUserProfile(res.user);
  },

  async signUp(fullName, contact, password) {
    const res = await api.post<AuthResponse>('/auth/register', {
      fullName,
      contact,
      password,
      rememberMe: true,
    }, { skipAuth: true });
    await tokenStorage.setTokenPair(res.accessToken, res.refreshToken);
    return toUserProfile(res.user);
  },

  async signInWithGoogleIdToken(idToken, rememberMe = true) {
    const res = await api.post<AuthResponse>('/auth/google', { idToken, rememberMe }, { skipAuth: true });
    await tokenStorage.setTokenPair(res.accessToken, res.refreshToken);
    return toUserProfile(res.user);
  },

  async signOut() {
    const refreshToken = await tokenStorage.getRefreshToken();
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {
      // best-effort — clear locally regardless
    }
    await tokenStorage.clearTokens();
  },

  async refreshSession() {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const res = await api.post<AuthResponse>('/auth/refresh', { refreshToken }, { skipAuth: true });
      await tokenStorage.setTokenPair(res.accessToken, res.refreshToken);
      return toUserProfile(res.user);
    } catch {
      await tokenStorage.clearTokens();
      return null;
    }
  },

  async updateLanguage(language: string) {
    await api.patch('/users/me', { language });
  },
};

// ─── Local implementation (no backend, original demo behaviour) ───────────────

const ACCOUNTS_KEY = 'codehills.accounts.v1';

interface StoredAccount {
  id: string;
  fullName: string;
  contact: string;
  passwordHash: string;
}

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

function normalise(contact: string): string {
  return contact.trim().toLowerCase();
}

async function loadAccounts(): Promise<StoredAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredAccount[];
  } catch {
    return [];
  }
}

async function saveAccounts(accounts: StoredAccount[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch { /* best-effort */ }
}

const localAuthService: AuthService = {
  async signIn(contact, password) {
    const key = normalise(contact);
    const accounts = await loadAccounts();
    const account = accounts.find((a) => a.contact === key);
    if (!account) throw new Error('No account found for that email or phone. Please sign up first.');
    const hash = await hashPassword(password);
    if (hash !== account.passwordHash) throw new Error('Incorrect password. Please try again.');
    return { id: account.id, fullName: account.fullName, contact: account.contact, authProvider: 'password', isDemo: false };
  },

  async signUp(fullName, contact, password) {
    const key = normalise(contact);
    const accounts = await loadAccounts();
    if (accounts.some((a) => a.contact === key)) {
      throw new Error('An account with that email or phone already exists. Please log in.');
    }
    const newAccount: StoredAccount = {
      id: makeId('user'),
      fullName: fullName.trim(),
      contact: key,
      passwordHash: await hashPassword(password),
    };
    await saveAccounts([...accounts, newAccount]);
    return { id: newAccount.id, fullName: newAccount.fullName, contact: newAccount.contact, authProvider: 'password' as const, isDemo: false };
  },

  async signOut() { /* local sessions need no revocation */ },
};

// ─── Export ──────────────────────────────────────────────────────────────────

export const authService = config.useMockData ? localAuthService : httpAuthService;

/** Typed access to backend-only methods (only safe to call when !config.useMockData). */
export const httpAuth = httpAuthService;
