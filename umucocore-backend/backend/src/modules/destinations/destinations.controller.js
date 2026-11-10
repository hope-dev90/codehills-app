import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

function format(d) {
  return {
    id: d.id,
    name: d.name,
    category: d.category,
    summary: d.summary,
    description: d.description,
    latitude: d.latitude,
    longitude: d.longitude,
    imageKey: d.imageKey ?? null,
    imageUrl: d.imageUrl ?? null,
    isDemo: d.isDemo,
  };
}

export const listDestinations = asyncHandler(async (req, res) => {
  const { category, q } = req.query;
  const where = {
    isPublished: true,
    ...(category && category !== 'All' && { category }),
    ...(q && { OR: [{ name: { contains: q, mode: 'insensitive' } }, { summary: { contains: q, mode: 'insensitive' } }] }),
  };
  const items = await prisma.destination.findMany({ where, orderBy: { name: 'asc' } });
  ok(res, { items: items.map(format), total: items.length });
});

export const getDestination = asyncHandler(async (req, res) => {
  const dest = await prisma.destination.findFirst({ where: { id: req.params.id, isPublished: true } });
  if (!dest) throw notFound('Destination not found');
  ok(res, format(dest));
});
