/**
 * Order service.
 *
 * When connected to the backend, sends only product IDs + quantities + delivery
 * to the server.  The backend is the price authority — it returns the final
 * totals, snapshotted order lines, and the reward story ID.
 *
 * Falls back to the local demo implementation when no API URL is configured.
 */
import { config } from './config';
import { api } from './apiClient';
import type { OrderService, CreateOrderInput } from './interfaces';
import type { Order } from '../types';
import type { ImageKey } from '../data/images';
import { makeId } from '../utils/format';
import { paymentService } from './payments';
import { pickRewardStory } from './rewards';

// ─── Response shape from the backend ─────────────────────────────────────────

interface ApiOrderLine {
  productId: string;
  name: string;
  priceRwf: number;
  imageKey?: string;
  imageUrl?: string;
  rewardStoryId?: string;
  quantity: number;
}

interface ApiOrder {
  id: string;
  createdAt: string;
  lines: ApiOrderLine[];
  subtotalRwf: number;
  shippingRwf: number;
  totalRwf: number;
  currency: string;
  delivery: { fullName: string; phone: string; address: string; city: string };
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  rewardStoryId: string | null;
  isDemo: boolean;
}

function mapOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    createdAt: o.createdAt,
    lines: o.lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      priceRwf: l.priceRwf,
      image: (l.imageKey ?? 'basket') as ImageKey,
      imageUrl: l.imageUrl,
      rewardStoryId: l.rewardStoryId ?? '',
      quantity: l.quantity,
    })),
    subtotalRwf: o.subtotalRwf,
    shippingRwf: o.shippingRwf,
    totalRwf: o.totalRwf,
    currency: 'RWF',
    delivery: o.delivery,
    status: (o.status ?? 'placed') as Order['status'],
    paymentStatus: (o.paymentStatus ?? 'unpaid') as Order['paymentStatus'],
    paymentMethod: (o.paymentMethod ?? 'cash_on_delivery') as Order['paymentMethod'],
    isDemo: o.isDemo,
    rewardStoryId: o.rewardStoryId,
  };
}

// ─── HTTP implementation ──────────────────────────────────────────────────────

const httpOrderService: OrderService = {
  async createOrder({ lines, delivery }) {
    // Only send IDs + quantities — backend recalculates prices
    const payload = {
      lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      delivery,
      paymentMethod: 'cash_on_delivery',
    };
    const order = await api.post<ApiOrder>('/orders', payload);
    return mapOrder(order);
  },
};

// ─── Local demo implementation ────────────────────────────────────────────────

const localOrderService: OrderService = {
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
      currency: 'RWF',
      delivery,
      status: 'demo_placed',
      paymentStatus: 'demo_no_payment',
      paymentMethod: 'cash_on_delivery',
      isDemo: true,
      rewardStoryId: pickRewardStory(lines, unlockedStoryIds),
    };
    return order;
  },
};

export const orderService: OrderService = config.useMockData
  ? localOrderService
  : httpOrderService;

// ─── Order history (HTTP only) ────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  if (config.useMockData) return [];
  try {
    const res = await api.get<{ items: ApiOrder[]; total: number }>('/orders');
    return res.items.map(mapOrder);
  } catch { return []; }
}

export async function fetchOrder(id: string): Promise<Order | null> {
  if (config.useMockData) return null;
  try {
    return mapOrder(await api.get<ApiOrder>(`/orders/${id}`));
  } catch { return null; }
}
