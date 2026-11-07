import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

export const listBookmarks = asyncHandler(async (req, res) => {
  const rows = await prisma.userBookmark.findMany({
    where: { userId: req.user.id },
    include: { story: true },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, { items: rows.map((r) => r.story).filter(Boolean), total: rows.length });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const story = await prisma.story.findUnique({ where: { id: storyId } });
  if (!story) throw notFound('Story not found');

  const existing = await prisma.userBookmark.findUnique({
    where: { userId_storyId: { userId: req.user.id, storyId } },
  });

  if (existing) {
    await prisma.userBookmark.delete({ where: { userId_storyId: { userId: req.user.id, storyId } } });
    ok(res, { bookmarked: false, storyId }, 'Removed from bookmarks');
  } else {
    await prisma.userBookmark.create({ data: { userId: req.user.id, storyId } });
    ok(res, { bookmarked: true, storyId }, 'Added to bookmarks');
  }
});

export const getBookmarkIds = asyncHandler(async (req, res) => {
  const rows = await prisma.userBookmark.findMany({
    where: { userId: req.user.id },
    select: { storyId: true },
  });
  ok(res, { ids: rows.map((r) => r.storyId) });
});
