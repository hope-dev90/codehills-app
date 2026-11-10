import { prisma } from '../../config/database.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

function format(b) {
  return {
    id: b.id,
    userId: b.userId,
    name: b.name,
    category: b.category,
    description: b.description,
    imageUrl: b.imageUrl ?? null,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    products: (b.products ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      priceRwf: p.priceRwf,
      isActive: p.isActive,
    })),
  };
}

export const getBusiness = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
    include: { products: { where: { isActive: true }, orderBy: { createdAt: 'asc' } } },
  });
  if (!business) throw notFound('No business found for this account');
  ok(res, format(business));
});

export const saveBusiness = asyncHandler(async (req, res) => {
  const { name, category, description, imageUrl } = req.body;
  const existing = await prisma.business.findUnique({ where: { userId: req.user.id } });

  if (existing) {
    const updated = await prisma.business.update({
      where: { userId: req.user.id },
      data: { name, category, description, imageUrl: imageUrl ?? existing.imageUrl },
      include: { products: { where: { isActive: true } } },
    });
    return ok(res, format(updated), 'Business updated');
  }

  const newBiz = await prisma.business.create({
    data: { userId: req.user.id, name, category, description, imageUrl: imageUrl ?? null },
    include: { products: true },
  });
  created(res, format(newBiz), 'Business created');
});

export const deleteBusiness = asyncHandler(async (req, res) => {
  const existing = await prisma.business.findUnique({ where: { userId: req.user.id } });
  if (!existing) throw notFound('No business found');
  await prisma.business.delete({ where: { userId: req.user.id } });
  ok(res, {}, 'Business deleted');
});
