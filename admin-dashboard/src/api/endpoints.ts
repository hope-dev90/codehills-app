// One function per backend endpoint, typed against src/api/types.ts.

import { request } from './client';
import type {
  LoginResponse,
  OrderRow,
  OrderStatus,
  Paginated,
  PaymentStatus,
  Role,
  Stats,
  UserRow,
} from './types';

type QueryValue = string | number | boolean | undefined | null;

function qs(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, QueryValue][]) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const str = search.toString();
  return str ? `?${str}` : '';
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login(body: { contact: string; password: string; rememberMe: boolean }): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', { method: 'POST', body, skipAuth: true });
  },
  logout(refreshToken: string): Promise<void> {
    return request<void>('/auth/logout', { method: 'POST', body: { refreshToken } });
  },
};

// ─── Overview ────────────────────────────────────────────────────────────────

export const statsApi = {
  get(): Promise<Stats> {
    return request<Stats>('/admin/stats');
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────

export interface UsersListParams {
  q?: string;
  page?: number;
  pageSize?: number;
  role?: string;
  active?: string;
}

export const usersApi = {
  list(params: UsersListParams): Promise<Paginated<UserRow>> {
    return request<Paginated<UserRow>>(`/admin/users${qs(params)}`);
  },
  update(id: string, body: { isActive?: boolean; role?: Role }): Promise<UserRow> {
    return request<UserRow>(`/admin/users/${id}`, { method: 'PATCH', body });
  },
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrdersListParams {
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export const ordersApi = {
  list(params: OrdersListParams): Promise<Paginated<OrderRow>> {
    return request<Paginated<OrderRow>>(`/admin/orders${qs(params)}`);
  },
  update(
    id: string,
    body: { status?: OrderStatus; paymentStatus?: PaymentStatus },
  ): Promise<OrderRow> {
    return request<OrderRow>(`/admin/orders/${id}`, { method: 'PATCH', body });
  },
};

// ─── Content collections (identical shape across all 7) ──────────────────────

export interface CollectionListParams {
  q?: string;
  page?: number;
  pageSize?: number;
  published?: string;
}

export const collectionsApi = {
  list<T>(collection: string, params: CollectionListParams): Promise<Paginated<T>> {
    return request<Paginated<T>>(`/admin/${collection}${qs(params)}`);
  },
  create<T>(collection: string, body: Record<string, unknown>): Promise<T> {
    return request<T>(`/admin/${collection}`, { method: 'POST', body });
  },
  update<T>(collection: string, id: string, body: Record<string, unknown>): Promise<T> {
    return request<T>(`/admin/${collection}/${id}`, { method: 'PATCH', body });
  },
  remove(collection: string, id: string): Promise<{ id: string }> {
    return request<{ id: string }>(`/admin/${collection}/${id}`, { method: 'DELETE' });
  },
};
