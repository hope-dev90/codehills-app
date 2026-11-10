import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

// Map DB enum back to the display strings the mobile app expects
const CATEGORY_DISPLAY = {
  Handicrafts: 'Handicrafts',
  FoodAndDrinks: 'Food & Drinks',
  Art: 'Art',
};

function format(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    category: CATEGORY_DISPLAY[p.category] ?? p.category,
    categoryId: p.categoryId,
    priceRwf: p.priceRwf,
    currency: p.currency,
    craftsmanship: p.craftsmanship,
    tags: p.tags,
    imageKey: p.imageKey ?? null,
    imageUrl: p.imageUrl ?? null,
    gallery: p.gallery,
    artisan: p.artisan
      ? { name: p.artisan.name, location: p.artisan.location }
      : { name: p.sellerName, location: '' },
    sellerName: p.sellerName,
    rating: p.rating ?? null,
    reviewCount: p.reviewCount,
    rewardStoryId: p.rewardStoryId ?? null,
    isActive: p.isActive,
    isDemo: p.isDemo,
  };
}

export const listProducts = asyncHandler(async (req, res) => {
  const { category, q, limit = '50', offset = '0' } = req.query;

  // Map display category to DB enum
  const DB_CATEGORY = { 'Handicrafts': 'Handicrafts', 'Food & Drinks': 'FoodAndDrinks', 'Art': 'Art' };

  const where = {
    isActive: true,
    ...(category && category !== 'All' && { category: DB_CATEGORY[category] ?? category }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { artisan: true },
      orderBy: { createdAt: 'asc' },
      take: Math.min(Number(limit), 100),
      skip: Number(offset),
    }),
    prisma.product.count({ where }),
  ]);
  ok(res, { items: items.map(format), total });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id, isActive: true },
    include: { artisan: true },
  });
  if (!product) throw notFound('Product not found');
  ok(res, format(product));
});
