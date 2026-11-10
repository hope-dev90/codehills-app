import { asyncHandler } from '../../utils/http.js';
import { ok, created } from '../../utils/http.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const deviceInfo = req.headers['user-agent'] ?? null;
  const result = await authService.register({ ...req.body, deviceInfo });
  created(res, result, 'Account created successfully');
});

export const login = asyncHandler(async (req, res) => {
  const deviceInfo = req.headers['user-agent'] ?? null;
  const result = await authService.login({ ...req.body, deviceInfo });
  ok(res, result, 'Logged in successfully');
});

export const googleSignIn = asyncHandler(async (req, res) => {
  const deviceInfo = req.headers['user-agent'] ?? null;
  const result = await authService.googleSignIn({ ...req.body, deviceInfo });
  ok(res, result, 'Google sign-in successful');
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body);
  ok(res, result, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body?.refreshToken ?? null);
  ok(res, {}, 'Logged out successfully');
});

export const me = asyncHandler(async (req, res) => {
  const { prisma } = await import('../../config/database.js');
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    const { notFound } = await import('../../utils/errors.js');
    throw notFound('User not found');
  }
  ok(res, authService.sanitizeUser(user));
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  ok(res, {}, 'Password changed successfully');
});
