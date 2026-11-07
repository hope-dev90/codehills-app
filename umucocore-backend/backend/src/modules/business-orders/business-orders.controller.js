import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';

async function getBusiness(userId) {
  const biz = await prisma.business.findUnique({ where: { userId } });
  if (!biz) throw notFound('You must create a business first');
  return biz;
}

function format(o) {
  return {
    id: o.id,
    customerName: o.customerName,
    itemDescription: o.itemDescription,
    totalRwf: o.totalRwf,
    status: o.status,
    createdAt: o.createdAt,
  };
}

export const listOrders = asyncHandler(async (req, res) => {
  const biz = await getBusiness(req.user.id);
  const orders = await prisma.businessOrder.findMany({
    where: { businessId: biz.id },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    total: orders.length,
    earningsRwf: orders
      .filter((o) => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalRwf, 0),
    newCount: orders.filter((o) => o.status === 'New').length,
  };

  ok(res, { items: orders.map(format), stats });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const biz = await getBusiness(req.user.id);
  const existing = await prisma.businessOrder.findFirst({
    where: { id: req.params.id, businessId: biz.id },
  });
  if (!existing) throw notFound('Order not found');

  const updated = await prisma.businessOrder.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  ok(res, format(updated), 'Order status updated');
});
