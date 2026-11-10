import { prisma } from '../../config/database.js';
import { badRequest } from '../../utils/errors.js';
import { generateOpaqueToken } from '../../utils/crypto.js';

const SHIPPING_RWF = 2000;

/**
 * Picks a reward story from the order lines that the user hasn't unlocked yet.
 * Prefers the line's own rewardStoryId; falls back to the first unowned story.
 */
async function pickRewardStory(lines, userId) {
  const unlockedRows = await prisma.userUnlockedStory.findMany({
    where: { userId },
    select: { storyId: true },
  });
  const unlocked = new Set(unlockedRows.map((r) => r.storyId));

  // Try the linked story from each line
  for (const line of lines) {
    if (line.rewardStoryId && !unlocked.has(line.rewardStoryId)) {
      return line.rewardStoryId;
    }
  }
  // Fallback: any published story
  const next = await prisma.story.findFirst({
    where: { isPublished: true, id: { notIn: [...unlocked] } },
    select: { id: true },
    orderBy: { xpReward: 'desc' },
  });
  return next?.id ?? null;
}

export async function createOrder({ userId, lines: inputLines, delivery, paymentMethod }) {
  // 1. Resolve and validate every product from the DB (backend is price authority)
  const productIds = inputLines.map((l) => l.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    const missing = productIds.filter((id) => !products.some((p) => p.id === id));
    throw badRequest(`Products not found or unavailable: ${missing.join(', ')}`);
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // 2. Build order lines with snapshotted prices
  const lines = inputLines.map((l) => {
    const product = productMap.get(l.productId);
    return {
      productId: product.id,
      productName: product.name,
      priceRwf: product.priceRwf,
      quantity: l.quantity,
      imageKey: product.imageKey ?? null,
      imageUrl: product.imageUrl ?? null,
      rewardStoryId: product.rewardStoryId ?? null,
    };
  });

  // 3. Calculate totals server-side
  const subtotalRwf = lines.reduce((sum, l) => sum + l.priceRwf * l.quantity, 0);
  const shippingRwf = SHIPPING_RWF;
  const totalRwf = subtotalRwf + shippingRwf;

  // 4. Generate ID and pick reward story
  const orderId = `ORD-${generateOpaqueToken(8).toUpperCase().slice(0, 12)}`;
  const rewardStoryId = userId ? await pickRewardStory(lines, userId) : null;

  // 5. Create order + lines + unlock story in one transaction
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        id: orderId,
        userId: userId ?? null,
        subtotalRwf,
        shippingRwf,
        totalRwf,
        deliveryFullName: delivery.fullName.trim(),
        deliveryPhone: delivery.phone.trim(),
        deliveryAddress: delivery.address.trim(),
        deliveryCity: delivery.city.trim(),
        status: 'placed',
        paymentStatus: 'unpaid',
        paymentMethod: paymentMethod ?? 'cash_on_delivery',
        rewardStoryId,
        isDemo: false,
        lines: {
          create: lines,
        },
      },
      include: { lines: true },
    });

    // Unlock the reward story for the user
    if (userId && rewardStoryId) {
      await tx.userUnlockedStory.upsert({
        where: { userId_storyId: { userId, storyId: rewardStoryId } },
        update: {},
        create: { userId, storyId: rewardStoryId, orderId: created.id },
      });
    }

    // Clear server-side cart
    if (userId) {
      await tx.cartItem.deleteMany({ where: { userId } });
    }

    return created;
  });

  return formatOrder(order);
}

export function formatOrder(o) {
  return {
    id: o.id,
    createdAt: o.createdAt,
    lines: (o.lines ?? []).map((l) => ({
      productId: l.productId,
      name: l.productName,
      priceRwf: l.priceRwf,
      imageKey: l.imageKey ?? null,
      imageUrl: l.imageUrl ?? null,
      rewardStoryId: l.rewardStoryId ?? null,
      quantity: l.quantity,
    })),
    subtotalRwf: o.subtotalRwf,
    shippingRwf: o.shippingRwf,
    totalRwf: o.totalRwf,
    currency: o.currency,
    delivery: {
      fullName: o.deliveryFullName,
      phone: o.deliveryPhone,
      address: o.deliveryAddress,
      city: o.deliveryCity,
    },
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    rewardStoryId: o.rewardStoryId ?? null,
    isDemo: o.isDemo,
  };
}
