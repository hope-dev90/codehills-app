import { prisma } from '../../config/database.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { notFound, forbidden } from '../../utils/errors.js';

async function getBusiness(userId) {
  const biz = await prisma.business.findUnique({ where: { userId } });
  if (!biz) throw notFound('You must create a business first');
  return biz;
}

function format(p) {
  return { id: p.id, name: p.name, priceRwf: p.priceRwf, isActive: p.isActive };
}

export const listProducts = asyncHandler(async (req, res) => {
  const biz = await getBusiness(req.user.id);
  const products = await prisma.businessProduct.findMany({
    where: { businessId: biz.id },
    orderBy: { createdAt: 'asc' },
  });
  ok(res, { items: products.map(format), total: products.length });
});

export const addProduct = asyncHandler(async (req, res) => {
  const biz = await getBusiness(req.user.id);
  const product = await prisma.businessProduct.create({
    data: { businessId: biz.id, name: req.body.name.trim(), priceRwf: req.body.priceRwf },
  });
  created(res, format(product), 'Product added');
});

export const updateProduct = asyncHandler(async (req, res) => {
  const biz = await getBusiness(req.user.id);
  const existing = await prisma.businessProduct.findFirst({
    where: { id: req.params.id, businessId: biz.id },
  });
  if (!existing) throw notFound('Product not found');

  const updated = await prisma.businessProduct.update({
    where: { id: req.params.id },
    data: {
      ...(req.body.name     !== undefined && { name: req.body.name.trim() }),
      ...(req.body.priceRwf !== undefined && { priceRwf: req.body.priceRwf }),
      ...(req.body.isActive !== undefined && { isActive: req.body.isActive }),
    },
  });
  ok(res, format(updated), 'Product updated');
});

export const removeProduct = asyncHandler(async (req, res) => {
  const biz = await getBusiness(req.user.id);
  const existing = await prisma.businessProduct.findFirst({
    where: { id: req.params.id, businessId: biz.id },
  });
  if (!existing) throw notFound('Product not found');
  await prisma.businessProduct.delete({ where: { id: req.params.id } });
  ok(res, { id: req.params.id }, 'Product removed');
});
