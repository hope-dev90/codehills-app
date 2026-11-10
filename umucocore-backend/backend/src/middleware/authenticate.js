import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../utils/errors.js';

function extractToken(req) {
  const h = req.headers.authorization;
  return h && h.startsWith('Bearer ') ? h.slice(7) : null;
}

function verify(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
}

/** Requires a valid access token. Sets req.user = { id, role }. */
export function authenticate(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next(unauthorized());
  try {
    const p = verify(token);
    req.user = { id: p.sub, role: p.role ?? 'user' };
    next();
  } catch {
    next(unauthorized('Invalid or expired token', 'INVALID_TOKEN'));
  }
}

/** Attaches req.user when a valid token is present; never rejects. */
export function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      const p = verify(token);
      req.user = { id: p.sub, role: p.role ?? 'user' };
    } catch {
      /* treat as guest */
    }
  }
  next();
}
