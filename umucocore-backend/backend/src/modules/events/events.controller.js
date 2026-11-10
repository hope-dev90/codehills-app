import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

function format(e) {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    location: e.location,
    dateLabel: e.dateLabel,
    startsAt: e.startsAt ?? null,
    endsAt: e.endsAt ?? null,
    summary: e.summary,
    description: e.description,
    imageKey: e.imageKey ?? null,
    imageUrl: e.imageUrl ?? null,
    isDemo: e.isDemo,
  };
}

export const listEvents = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const where = {
    isPublished: true,
    ...(category && category !== 'All' && { category }),
  };
  const items = await prisma.event.findMany({ where, orderBy: { createdAt: 'desc' } });
  ok(res, { items: items.map(format), total: items.length });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.findFirst({ where: { id: req.params.id, isPublished: true } });
  if (!event) throw notFound('Event not found');
  ok(res, format(event));
});
