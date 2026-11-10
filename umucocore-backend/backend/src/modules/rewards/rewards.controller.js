import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';

export const listUnlockedStories = asyncHandler(async (req, res) => {
  const rows = await prisma.userUnlockedStory.findMany({
    where: { userId: req.user.id },
    include: { story: true },
    orderBy: { unlockedAt: 'desc' },
  });
  ok(res, {
    items: rows.map((r) => r.story).filter(Boolean),
    ids: rows.map((r) => r.storyId),
    total: rows.length,
  });
});

export const getUnlockedIds = asyncHandler(async (req, res) => {
  const rows = await prisma.userUnlockedStory.findMany({
    where: { userId: req.user.id },
    select: { storyId: true },
  });
  ok(res, { ids: rows.map((r) => r.storyId) });
});
