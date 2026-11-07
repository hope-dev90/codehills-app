import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

function format(r) {
  return {
    id: r.id,
    title: r.title,
    summary: r.summary,
    body: Array.isArray(r.body) ? r.body : JSON.parse(r.body ?? '[]'),
    isDemo: r.isDemo,
  };
}

export const listResources = asyncHandler(async (_req, res) => {
  const items = await prisma.learningResource.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  });
  ok(res, { items: items.map(format), total: items.length });
});

export const getResource = asyncHandler(async (req, res) => {
  const resource = await prisma.learningResource.findFirst({
    where: { id: req.params.id, isPublished: true },
  });
  if (!resource) throw notFound('Learning resource not found');
  ok(res, format(resource));
});
