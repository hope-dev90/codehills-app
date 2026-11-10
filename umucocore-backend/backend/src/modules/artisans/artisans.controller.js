import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

function format(a) {
  return { id: a.id, name: a.name, location: a.location, bio: a.bio ?? null, imageUrl: a.imageUrl ?? null };
}

export const listArtisans = asyncHandler(async (_req, res) => {
  const items = await prisma.artisan.findMany({ orderBy: { name: 'asc' } });
  ok(res, { items: items.map(format), total: items.length });
});

export const getArtisan = asyncHandler(async (req, res) => {
  const artisan = await prisma.artisan.findUnique({ where: { id: req.params.id } });
  if (!artisan) throw notFound('Artisan not found');
  ok(res, format(artisan));
});
