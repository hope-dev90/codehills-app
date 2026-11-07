import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

function formatItem(ci) {
  const p = ci.product;
  return {
    productId: p.id,
    name: p.name,
    priceRwf: p.priceRwf,
    imageKey: p.imageKey ?? null,
    imageUrl: p.imageUrl ?? null,
    rewardStoryId: p.rewardStoryId ?? null,
    quantity: ci.quantity,
  };
}

export const getCart = asyncHandler(async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true },
    orderBy: { addedAt: 'asc' },
  });
  ok(res, { items: items.map(formatItem) });
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
  if (!product) throw notFound('Product not found or unavailable');

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });

  let item;
  if (existing) {
    item = await prisma.cartItem.update({
      where: { userId_productId: { userId: req.user.id, productId } },
      data: { quantity: Math.min(99, existing.quantity + quantity) },
      include: { product: true },
    });
  } else {
    item = await prisma.cartItem.create({
      data: { userId: req.user.id, productId, quantity },
      include: { product: true },
    });
  }
  ok(res, formatItem(item), 'Item added to cart');
});

export const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id, productId } });
    return ok(res, { productId, removed: true }, 'Item removed from cart');
  }

  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId: req.user.id, productId } },
    data: { quantity },
    include: { product: true },
  });
  ok(res, formatItem(item), 'Cart updated');
});

export const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id, productId } });
  ok(res, { productId, removed: true }, 'Item removed from cart');
});

export const clearCart = asyncHandler(async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  ok(res, {}, 'Cart cleared');
});
