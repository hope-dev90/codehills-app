/**
 * useGoogleSignIn
 *
 * Uses expo-auth-session's Google ID-token flow (non-deprecated path).
 *
 * HOW TO SET UP GOOGLE OAUTH
 * ──────────────────────────
 * Go to console.cloud.google.com → APIs & Services → Credentials → Create Credential
 *
 * Create THREE separate OAuth 2.0 clients:
 *
 *  1. Type: Android
 *     Package name:      com.example.codehills
 *     SHA-1 fingerprint: run `cd android && ./gradlew signingReport` (debug SHA-1)
 *     → copy the client ID into EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID
 *
 *  2. Type: iOS
 *     Bundle ID: com.example.codehills
 *     → copy the client ID into EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS
 *
 *  3. Type: Web application
 *     Authorized redirect URIs: add EXACTLY this URI (no trailing slash):
 *       https://auth.expo.io/@hope120/codehills
 *     Authorized JavaScript origins: leave EMPTY (do not fill this in)
 *     → copy the client ID into EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB
 *
 * NOTE: Google Console may show a warning about the @-sign in the redirect URI
 * but it will still save and work. If it refuses entirely, use the standalone
 * AuthSession approach below and register `com.example.codehills:/` instead.
 *
 * EXPO GO (development):  only the WEB client ID is used.
 * DEV / PROD BUILDS:      iOS/Android client IDs are used on their respective platforms.
 */
import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import type { UserProfile } from '../types';
import { makeId } from '../utils/format';
import { config } from './config';
import { httpAuth } from './auth';

WebBrowser.maybeCompleteAuthSession();

const IOS_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS      || '';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID  || '';
const WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB      || '';

/** True when at least one real client ID has been configured in .env. */
export const isGoogleConfigured = !!(IOS_CLIENT_ID || ANDROID_CLIENT_ID || WEB_CLIENT_ID);

/**
 * Placeholder passed when no real ID is configured so the hook never throws
 * "Client Id property must be defined" at render time.
 */
const PLACEHOLDER = 'not-configured';

interface GoogleUserInfo {
  sub: string;
  name?: string;
  email?: string;
}

async function fetchGoogleUser(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google userinfo ${res.status}`);
  return res.json() as Promise<GoogleUserInfo>;
}

function toUserProfile(info: GoogleUserInfo): UserProfile {
  return {
    id:           info.sub || makeId('google-user'),
    fullName:     info.name  ?? 'Google User',
    contact:      info.email ?? '',
    authProvider: 'google',
    isDemo:       false,
  };
}

export function useGoogleSignIn(
  onSuccess: (user: UserProfile) => void,
  onError:   (message: string)  => void,
): { prompt: () => void; loading: boolean } {
  /**
   * useIdTokenAuthRequest is the non-deprecated replacement for useAuthRequest.
   * It returns an ID token directly — no extra userinfo fetch needed when a
   * backend is available to verify it.
   *
   * The second argument (redirectUriOptions) is left empty so expo-auth-session
   * auto-selects the correct redirect URI for each platform:
   *   - Expo Go  →  uses the auth.expo.io proxy (web client ID)
   *   - Dev/prod build on Android  →  uses the Android client ID + native scheme
   *   - Dev/prod build on iOS      →  uses the iOS client ID + native scheme
   */
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId:     IOS_CLIENT_ID     || PLACEHOLDER,
    androidClientId: ANDROID_CLIENT_ID || PLACEHOLDER,
    webClientId:     WEB_CLIENT_ID     || PLACEHOLDER,
  });

  useEffect(() => {
    if (!isGoogleConfigured || !response) return;

    if (response.type === 'success') {
      const idToken     = response.params?.id_token;
      const accessToken = response.authentication?.accessToken;

      // Backend path: exchange the ID token server-side (most secure).
      if (!config.useMockData && idToken) {
        httpAuth
          .signInWithGoogleIdToken(idToken)
          .then((user) => onSuccess(user))
          .catch(() => onError('Google sign-in failed on the server. Please try again.'));
        return;
      }

      // Fallback: fetch the user profile directly with the access token.
      if (accessToken) {
        fetchGoogleUser(accessToken)
          .then((info) => onSuccess(toUserProfile(info)))
          .catch(() => onError('Signed in with Google but could not fetch your profile. Please try again.'));
        return;
      }

      // ID token only (no access token) — decode the sub/email from the JWT payload.
      if (idToken) {
        try {
          // Decode the JWT payload without Node's Buffer (not available in RN).
          const base64 = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const json   = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
              .join(''),
          );
          const payload = JSON.parse(json) as { sub?: string; name?: string; email?: string };
          onSuccess(toUserProfile({ sub: payload.sub ?? '', name: payload.name, email: payload.email }));
        } catch {
          onError('Google sign-in succeeded but the token could not be decoded.');
        }
        return;
      }

      onError('Google sign-in succeeded but no usable token was returned.');
    } else if (response.type === 'error') {
      onError(response.error?.message ?? 'Google sign-in failed.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return {
    prompt: () => {
      if (!isGoogleConfigured) {
        onError('Google sign-in is not set up yet. Add your OAuth client IDs to .env and restart the dev server.');
        return;
      }
      promptAsync();
    },
    loading: isGoogleConfigured && !request,
  };
}
