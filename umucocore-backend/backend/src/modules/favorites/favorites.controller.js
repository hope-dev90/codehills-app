import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

export const listFavorites = asyncHandler(async (req, res) => {
  const rows = await prisma.userFavorite.findMany({
    where: { userId: req.user.id },
    include: { product: { include: { artisan: true } } },
    orderBy: { createdAt: 'desc' },
  });
  // Re-use the product formatter from products module inline
  const items = rows.map((r) => r.product).filter(Boolean);
  ok(res, { items, total: items.length });
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw notFound('Product not found');

  const existing = await prisma.userFavorite.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });

  if (existing) {
    await prisma.userFavorite.delete({ where: { userId_productId: { userId: req.user.id, productId } } });
    ok(res, { favorited: false, productId }, 'Removed from favorites');
  } else {
    await prisma.userFavorite.create({ data: { userId: req.user.id, productId } });
    ok(res, { favorited: true, productId }, 'Added to favorites');
  }
});

export const getFavoriteIds = asyncHandler(async (req, res) => {
  const rows = await prisma.userFavorite.findMany({
    where: { userId: req.user.id },
    select: { productId: true },
  });
  ok(res, { ids: rows.map((r) => r.productId) });
});
