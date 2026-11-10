import { prisma } from '../../config/database.js';
import { asyncHandler, ok } from '../../utils/http.js';
import { badRequest, notFound } from '../../utils/errors.js';

export const ORDER_STATUSES = ['placed', 'preparing', 'shipped', 'delivered', 'cancelled'];
export const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed'];
export const USER_ROLES = ['user', 'admin'];

/** Shared paging parser for every admin list endpoint. */
export function pagination(query, defaultSize = 20) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || defaultSize));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function formatAdminUser(u, orderCount = 0) {
  return {
    id: u.id,
    fullName: u.fullName,
    contact: u.contact,
    contactType: u.contactType,
    role: u.role,
    authProvider: u.authProvider,
    language: u.language,
    isActive: u.isActive,
    createdAt: u.createdAt,
    orderCount,
  };
}

export function formatAdminOrder(o) {
  const lines = o.lines ?? [];
  return {
    id: o.id,
    createdAt: o.createdAt,
    customerName: o.deliveryFullName,
    customerContact: o.deliveryPhone,
    deliveryCity: o.deliveryCity,
    totalRwf: o.totalRwf,
    currency: o.currency,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    lines: lines.map((l) => ({
      productName: l.productName,
      quantity: l.quantity,
      priceRwf: l.priceRwf,
    })),
  };
}

// ─── Overview ─────────────────────────────────────────────────

export const getStats = asyncHandler(async (_req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    usersTotal,
    usersActive,
    usersNewThisWeek,
    usersGoogle,
    ordersTotal,
    revenue,
    ordersByStatus,
    ordersByPayment,
    stories,
    destinations,
    events,
    products,
    artisans,
    businesses,
    learning,
    recentUsers,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { authProvider: 'google' } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalRwf: true }, where: { status: { not: 'cancelled' } } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.groupBy({ by: ['paymentStatus'], _count: { _all: true } }),
    prisma.story.count(),
    prisma.destination.count(),
    prisma.event.count(),
    prisma.product.count(),
    prisma.artisan.count(),
    prisma.business.count(),
    prisma.learningResource.count(),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { lines: true },
    }),
  ]);

  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  for (const row of ordersByStatus) byStatus[row.status] = row._count._all;

  const byPayment = Object.fromEntries(PAYMENT_STATUSES.map((s) => [s, 0]));
  for (const row of ordersByPayment) byPayment[row.paymentStatus] = row._count._all;

  ok(res, {
    users: {
      total: usersTotal,
      active: usersActive,
      newThisWeek: usersNewThisWeek,
      googleAccounts: usersGoogle,
    },
    orders: {
      total: ordersTotal,
      revenueRwf: revenue._sum.totalRwf ?? 0,
      byStatus,
      byPayment,
    },
    content: {
      stories,
      destinations,
      events,
      products,
      artisans,
      businesses,
      learning,
    },
    recentUsers: recentUsers.map((u) => formatAdminUser(u)),
    recentOrders: recentOrders.map((o) => formatAdminOrder(o)),
  });
});

// ─── Users ────────────────────────────────────────────────────

export const listUsers = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = pagination(req.query);
  const { q, role, active } = req.query;

  const where = {
    ...(USER_ROLES.includes(role) && { role }),
    ...(active === 'true' && { isActive: true }),
    ...(active === 'false' && { isActive: false }),
    ...(q && {
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { contact: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { _count: { select: { orders: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  ok(res, {
    items: items.map((u) => formatAdminUser(u, u._count.orders)),
    total,
    page,
    pageSize,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;

  if (role !== undefined && !USER_ROLES.includes(role)) {
    throw badRequest('Role must be "user" or "admin"', 'INVALID_ROLE');
  }
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw badRequest('isActive must be a boolean', 'INVALID_IS_ACTIVE');
  }
  if (role === undefined && isActive === undefined) {
    throw badRequest('Nothing to update', 'NOTHING_TO_UPDATE');
  }

  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFound('User not found');

  if (existing.id === req.user.id && isActive === false) {
    throw badRequest('You cannot deactivate your own account', 'SELF_DEACTIVATE');
  }
  if (existing.id === req.user.id && role === 'user') {
    throw badRequest('You cannot remove your own admin access', 'SELF_DEMOTE');
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(isActive !== undefined && { isActive }),
      ...(role !== undefined && { role }),
    },
    include: { _count: { select: { orders: true } } },
  });

  // A role change must not stay usable through already-issued refresh tokens.
  if (role !== undefined) {
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  ok(res, formatAdminUser(user, user._count.orders), 'User updated');
});

// ─── Orders ───────────────────────────────────────────────────

export const listOrders = asyncHandler(async (req, res) => {
  const { page, pageSize, skip, take } = pagination(req.query);
  const { status, paymentStatus, q } = req.query;

  const where = {
    ...(ORDER_STATUSES.includes(status) && { status }),
    ...(PAYMENT_STATUSES.includes(paymentStatus) && { paymentStatus }),
    ...(q && {
      OR: [
        { id: { contains: q } },
        { deliveryFullName: { contains: q, mode: 'insensitive' } },
        { deliveryPhone: { contains: q } },
        { deliveryCity: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { lines: true },
    }),
    prisma.order.count({ where }),
  ]);

  ok(res, { items: items.map(formatAdminOrder), total, page, pageSize });
});

export const updateOrder = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;

  if (status !== undefined && !ORDER_STATUSES.includes(status)) {
    throw badRequest(`Status must be one of: ${ORDER_STATUSES.join(', ')}`, 'INVALID_STATUS');
  }
  if (paymentStatus !== undefined && !PAYMENT_STATUSES.includes(paymentStatus)) {
    throw badRequest(`Payment status must be one of: ${PAYMENT_STATUSES.join(', ')}`, 'INVALID_PAYMENT_STATUS');
  }
  if (status === undefined && paymentStatus === undefined) {
    throw badRequest('Nothing to update', 'NOTHING_TO_UPDATE');
  }

  const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existing) throw notFound('Order not found');

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(paymentStatus !== undefined && { paymentStatus }),
    },
    include: { lines: true },
  });

  ok(res, formatAdminOrder(order), 'Order updated');
});
