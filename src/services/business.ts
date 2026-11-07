/**
 * Business tools service — profile, products, orders, AI plan.
 *
 * Falls back gracefully to the local AppData when useMockData is true.
 */
import { config } from './config';
import { api } from './apiClient';
import type { BusinessProfile, BusinessProduct, DemoOrder } from '../types';

// ─── Response shapes ──────────────────────────────────────────────────────────

interface ApiBusinessProduct { id: string; name: string; priceRwf: number; isActive: boolean }
interface ApiBusiness {
  id: string; userId: string; name: string; category: string; description: string;
  imageUrl?: string; createdAt: string; updatedAt: string;
  products: ApiBusinessProduct[];
}
interface ApiBusinessOrder {
  id: string; customerName: string; itemDescription: string; totalRwf: number;
  status: 'New' | 'Preparing' | 'Delivered'; createdAt: string;
}

function mapBusiness(b: ApiBusiness): BusinessProfile {
  return {
    id: b.id,
    name: b.name,
    category: b.category,
    description: b.description,
    imageUri: b.imageUrl ?? undefined,
    createdAt: b.createdAt,
    products: b.products.map((p) => ({ id: p.id, name: p.name, priceRwf: p.priceRwf })),
  };
}

function mapBusinessOrder(o: ApiBusinessOrder): DemoOrder {
  return {
    id: o.id,
    customer: o.customerName,
    item: o.itemDescription,
    totalRwf: o.totalRwf,
    status: o.status,
  };
}

// ─── Business profile ─────────────────────────────────────────────────────────

export async function fetchBusiness(): Promise<BusinessProfile | null> {
  if (config.useMockData) return null;
  try {
    return mapBusiness(await api.get<ApiBusiness>('/business'));
  } catch (e: unknown) {
    // 404 = no business yet — that's fine
    if ((e as { status?: number })?.status === 404) return null;
    throw e;
  }
}

export async function saveBusiness(
  input: Pick<BusinessProfile, 'name' | 'category' | 'description' | 'imageUri'>,
): Promise<BusinessProfile> {
  const body = { name: input.name, category: input.category, description: input.description, imageUrl: input.imageUri ?? null };
  return mapBusiness(await api.put<ApiBusiness>('/business', body));
}

// ─── Business products ────────────────────────────────────────────────────────

export async function addBusinessProduct(name: string, priceRwf: number): Promise<BusinessProduct> {
  if (config.useMockData) throw new Error('Not connected to backend');
  const p = await api.post<ApiBusinessProduct>('/business/products', { name, priceRwf });
  return { id: p.id, name: p.name, priceRwf: p.priceRwf };
}

export async function removeBusinessProduct(id: string): Promise<void> {
  if (config.useMockData) return;
  await api.delete(`/business/products/${id}`);
}

// ─── Business orders ──────────────────────────────────────────────────────────

export async function fetchBusinessOrders(): Promise<{
  items: DemoOrder[];
  stats: { total: number; earningsRwf: number; newCount: number };
}> {
  if (config.useMockData) {
    const { demoBusinessOrders } = await import('../data/business');
    return {
      items: demoBusinessOrders,
      stats: { total: demoBusinessOrders.length, earningsRwf: 0, newCount: 1 },
    };
  }
  const res = await api.get<{
    items: ApiBusinessOrder[];
    stats: { total: number; earningsRwf: number; newCount: number };
  }>('/business/orders');
  return { items: res.items.map(mapBusinessOrder), stats: res.stats };
}

export async function updateBusinessOrderStatus(
  id: string,
  status: 'New' | 'Preparing' | 'Delivered',
): Promise<void> {
  if (config.useMockData) return;
  await api.patch(`/business/orders/${id}`, { status });
}

// ─── Business plan (AI) ───────────────────────────────────────────────────────

export async function fetchBusinessPlan(): Promise<string | null> {
  if (config.useMockData) return null;
  try {
    const res = await api.get<{ plan: { summary: string }; cached: boolean }>('/business/plan');
    return res.plan?.summary ?? null;
  } catch { return null; }
}

export async function regenerateBusinessPlan(): Promise<string | null> {
  if (config.useMockData) return null;
  try {
    const res = await api.post<{ plan: { summary: string }; cached: boolean }>('/business/plan/regen', {});
    return res.plan?.summary ?? null;
  } catch { return null; }
}
