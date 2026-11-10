import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { verifyGoogleIdToken } from '../../config/google.js';
import { normalizeContact, generateOpaqueToken, sha256 } from '../../utils/crypto.js';
import { badRequest, unauthorized, conflict, notFound } from '../../utils/errors.js';

const BCRYPT_ROUNDS = 12;

// ─── Token helpers ────────────────────────────────────────────

function issueAccessToken(userId, role = 'user') {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

async function issueRefreshToken(userId, rememberMe, deviceInfo = null) {
  const raw = generateOpaqueToken();
  const tokenHash = sha256(raw);
  const ttlDays = rememberMe
    ? env.REFRESH_TOKEN_TTL_DAYS_REMEMBER
    : env.REFRESH_TOKEN_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, deviceInfo, expiresAt },
  });
  return raw; // return opaque token, not hash
}

export function buildTokenPair(user, rawRefreshToken) {
  return {
    accessToken: issueAccessToken(user.id, user.role),
    refreshToken: rawRefreshToken,
    user: sanitizeUser(user),
  };
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    contact: user.contact,
    contactType: user.contactType,
    authProvider: user.authProvider,
    language: user.language,
    role: user.role,
  };
}

// ─── Auth operations ──────────────────────────────────────────

export async function register({ fullName, contact: rawContact, password, rememberMe, deviceInfo }) {
  const normalized = normalizeContact(rawContact);
  if (!normalized) throw badRequest('Invalid email or phone number', 'INVALID_CONTACT');

  const existing = await prisma.user.findUnique({ where: { contact: normalized.contact } });
  if (existing) throw conflict('An account with that email or phone already exists');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      contact: normalized.contact,
      contactType: normalized.contactType,
      passwordHash,
      authProvider: 'password',
      rememberMe: Boolean(rememberMe),
    },
  });

  const rawRefresh = await issueRefreshToken(user.id, rememberMe, deviceInfo);
  return buildTokenPair(user, rawRefresh);
}

export async function login({ contact: rawContact, password, rememberMe, deviceInfo }) {
  const normalized = normalizeContact(rawContact);
  if (!normalized) throw badRequest('Invalid email or phone number', 'INVALID_CONTACT');

  const user = await prisma.user.findUnique({ where: { contact: normalized.contact } });
  if (!user || !user.passwordHash) throw unauthorized('No account found for that email or phone');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw unauthorized('Incorrect password');

  // Update rememberMe preference
  if (user.rememberMe !== Boolean(rememberMe)) {
    await prisma.user.update({ where: { id: user.id }, data: { rememberMe: Boolean(rememberMe) } });
  }

  const rawRefresh = await issueRefreshToken(user.id, rememberMe, deviceInfo);
  return buildTokenPair(user, rawRefresh);
}

export async function googleSignIn({ idToken, rememberMe, deviceInfo }) {
  const googleProfile = await verifyGoogleIdToken(idToken);

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: googleProfile.googleId }, { contact: googleProfile.email ?? '' }] },
  });

  if (user) {
    // Link google ID if not yet linked
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleProfile.googleId, googleEmail: googleProfile.email },
      });
    }
  } else {
    // Create new account via Google
    if (!googleProfile.email) throw badRequest('Google account has no verified email');
    user = await prisma.user.create({
      data: {
        fullName: googleProfile.name ?? 'Google User',
        contact: googleProfile.email,
        contactType: 'email',
        authProvider: 'google',
        googleId: googleProfile.googleId,
        googleEmail: googleProfile.email,
        rememberMe: Boolean(rememberMe),
      },
    });
  }

  const rawRefresh = await issueRefreshToken(user.id, rememberMe, deviceInfo);
  return buildTokenPair(user, rawRefresh);
}

export async function refresh({ refreshToken: rawToken }) {
  const tokenHash = sha256(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw unauthorized('Refresh token is invalid or expired', 'INVALID_REFRESH_TOKEN');
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) throw unauthorized('Account not found or inactive');

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const rawNew = await issueRefreshToken(user.id, user.rememberMe, stored.deviceInfo);

  return buildTokenPair(user, rawNew);
}

export async function logout(rawToken) {
  if (!rawToken) return;
  const tokenHash = sha256(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  }).catch(() => {/* ignore if already revoked */});
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');
  if (!user.passwordHash) throw badRequest('Password change not supported for social accounts');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw unauthorized('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Revoke all refresh tokens on password change
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
