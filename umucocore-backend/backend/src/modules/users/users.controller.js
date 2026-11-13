import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';
import { sanitizeUser } from '../auth/auth.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw notFound('User not found');
  ok(res, sanitizeUser(user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, language, rememberMe } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(fullName    !== undefined && { fullName: fullName.trim() }),
      ...(language    !== undefined && { language }),
      ...(rememberMe  !== undefined && { rememberMe }),
    },
  });
  ok(res, sanitizeUser(user), 'Profile updated');
});

/**
 * Permanently deletes the signed-in user. Orders are removed explicitly because
 * they hold delivery details and are not cascaded from the user; everything
 * else (tokens, collections, cart, business) cascades in the schema.
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');

  await prisma.$transaction(async (tx) => {
    await tx.userUnlockedStory.deleteMany({ where: { userId } });
    await tx.order.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
  ok(res, {}, 'Account deleted');
});
