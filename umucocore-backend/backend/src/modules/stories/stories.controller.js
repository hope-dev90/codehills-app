import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

function formatStory(s) {
  return {
    id: s.id,
    title: s.title,
    subtitle: s.subtitle ?? '',
    category: s.category,
    explorerCategory: s.explorerCategory ?? null,
    era: s.era ?? null,
    location: s.location ?? null,
    latitude: s.latitude ?? null,
    longitude: s.longitude ?? null,
    summary: s.summary,
    contentSummary: s.contentSummary ?? null,
    body: Array.isArray(s.body) ? s.body : JSON.parse(s.body ?? '[]'),
    tags: s.tags,
    gallery: s.gallery,
    imageKey: s.imageKey ?? null,
    imageUrl: s.imageUrl ?? null,
    relatedStoryIds: s.relatedStoryIds,
    xpReward: s.xpReward,
    sourceNote: s.sourceNote ?? null,
    isDemo: s.isDemo,
  };
}

const BASE_WHERE = { isPublished: true };

export const listStories = asyncHandler(async (req, res) => {
  const { category, q, limit = '50', offset = '0' } = req.query;
  const where = {
    ...BASE_WHERE,
    ...(category && category !== 'All' && { category }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    prisma.story.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 100),
      skip: Number(offset),
    }),
    prisma.story.count({ where }),
  ]);
  ok(res, { items: items.map(formatStory), total });
});

export const getStory = asyncHandler(async (req, res) => {
  const story = await prisma.story.findFirst({
    where: { id: req.params.id, ...BASE_WHERE },
  });
  if (!story) throw notFound('Story not found');
  ok(res, formatStory(story));
});
