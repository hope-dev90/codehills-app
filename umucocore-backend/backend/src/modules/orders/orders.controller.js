import { prisma } from '../../config/database.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';
import { createOrder, formatOrder } from './orders.service.js';

export const placeOrder = asyncHandler(async (req, res) => {
  const order = await createOrder({
    userId: req.user?.id ?? null,
    lines: req.body.lines,
    delivery: req.body.delivery,
    paymentMethod: req.body.paymentMethod,
  });
  created(res, order, 'Order placed successfully');
});

export const listOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { lines: true },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, { items: orders.map(formatOrder), total: orders.length });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { lines: true },
  });
  if (!order) throw notFound('Order not found');
  ok(res, formatOrder(order));
});
