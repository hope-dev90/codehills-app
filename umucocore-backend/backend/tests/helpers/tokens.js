/**
 * JWT helpers for tests.
 * Must be imported AFTER helpers/env.js so JWT_ACCESS_SECRET is set.
 */
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_ACCESS_SECRET;

/** Issue a signed access token for test users. */
export function makeAccessToken(userId = 'user-1', role = 'user') {
  return jwt.sign({ sub: userId, role }, SECRET, { algorithm: 'HS256', expiresIn: '1h' });
}

/** Convenience: Authorization header value. */
export function bearerToken(userId = 'user-1', role = 'user') {
  return `Bearer ${makeAccessToken(userId, role)}`;
}
