import { OAuth2Client } from 'google-auth-library';
import { env } from './env.js';
import { AppError } from '../utils/errors.js';

const clientIds = (env.GOOGLE_CLIENT_ID ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const client = clientIds.length ? new OAuth2Client(clientIds[0]) : null;

/**
 * Verifies a Google ID token server-side. Returns { googleId, email, emailVerified, name, picture }.
 * Google's access/refresh tokens are never requested or stored.
 */
export async function verifyGoogleIdToken(idToken) {
  if (!client) {
    throw new AppError(503, 'GOOGLE_NOT_CONFIGURED', 'Google sign-in is not configured');
  }

  let ticket;
  try {
    // The ID token's audience is the client ID of the platform that signed in
    // (Android vs Web), so every configured client ID is accepted.
    ticket = await client.verifyIdToken({ idToken, audience: clientIds });
  } catch {
    throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google token is invalid or expired');
  }

  const p = ticket.getPayload();
  if (!p?.sub) {
    throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google token is invalid or expired');
  }

  return {
    googleId: p.sub,
    email: p.email?.toLowerCase() ?? null,
    emailVerified: p.email_verified === true,
    name: p.name ?? null,
    picture: p.picture ?? null,
  };
}
