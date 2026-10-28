import type { OrderService } from './interfaces';
import type { Order } from '../types';
import { makeId } from '../utils/format';
import { paymentService } from './payments';
import { pickRewardStory } from './rewards';

/**
 * DEMO order service: builds the order locally. The result is flagged `isDemo` and
 * `paymentStatus: 'demo_no_payment'`. Replace with the real orders API (TODO(backend)).
 */
export const orderService: OrderService = {
  async createOrder({ lines, delivery, shippingRwf, unlockedStoryIds }) {
    const subtotalRwf = lines.reduce((sum, l) => sum + l.priceRwf * l.quantity, 0);
    const id = makeId('ORD');
    await paymentService.pay(subtotalRwf + shippingRwf, id);
    const order: Order = {
      id,
      createdAt: new Date().toISOString(),
      lines,
      subtotalRwf,
      shippingRwf,
      totalRwf: subtotalRwf + shippingRwf,
      delivery,
      status: 'demo_placed',
      paymentStatus: 'demo_no_payment',
      isDemo: true,
      rewardStoryId: pickRewardStory(lines, unlockedStoryIds),
    };
    return order;
  },
};
