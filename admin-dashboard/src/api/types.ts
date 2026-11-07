// Shared API types for the CodeHills / UmucoCore admin dashboard.
// Mirrors the frozen REST contract exactly.

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export type Role = 'user' | 'admin';

export type OrderStatus = 'placed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed';

export const ORDER_STATUSES: OrderStatus[] = [
  'placed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
];

export const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'pending', 'paid', 'failed'];

export interface AdminUser {
  id: string;
  fullName: string;
  contact: string;
  contactType: string;
  authProvider: string;
  language: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

// ─── Overview ────────────────────────────────────────────────────────────────

export interface RecentUser {
  id: string;
  fullName: string;
  contact: string;
  role: string;
  authProvider: string;
  isActive: boolean;
  createdAt: string;
}

export interface RecentOrder {
  id: string;
  createdAt: string;
  customerName: string;
  totalRwf: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
}

export interface Stats {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
    googleAccounts: number;
  };
  orders: {
    total: number;
    revenueRwf: number;
    byStatus: Record<OrderStatus, number>;
    byPayment: Record<PaymentStatus, number>;
  };
  content: {
    stories: number;
    destinations: number;
    events: number;
    products: number;
    artisans: number;
    businesses: number;
    learning: number;
  };
  recentUsers: RecentUser[];
  recentOrders: RecentOrder[];
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  fullName: string;
  contact: string;
  contactType: string;
  role: Role;
  authProvider: string;
  language: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderLine {
  productName: string;
  quantity: number;
  priceRwf: number;
}

export interface OrderRow {
  id: string;
  createdAt: string;
  customerName: string;
  customerContact: string;
  deliveryCity: string;
  totalRwf: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  itemCount: number;
  lines: OrderLine[];
}

// ─── Content collections ─────────────────────────────────────────────────────

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  summary: string;
  body: string[];
  tags: string[];
  imageKey: string;
  imageUrl: string;
  xpReward: number;
  isPublished: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DestinationCategory = 'Nature' | 'Lakes' | 'Culture' | 'City';

export interface Destination {
  id: string;
  name: string;
  category: DestinationCategory;
  summary: string;
  description: string;
  latitude: number;
  longitude: number;
  imageKey: string;
  imageUrl: string;
  isPublished: boolean;
  isDemo: boolean;
  createdAt: string;
}

export type EventCategory = 'Festival' | 'Coffee' | 'Culture';

export interface CustEvent {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  dateLabel: string;
  summary: string;
  description: string;
  imageKey: string;
  imageUrl: string;
  isPublished: boolean;
  isDemo: boolean;
  createdAt: string;
}

export type ProductCategory = 'Handicrafts' | 'Food & Drinks' | 'Art';

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  categoryId: string;
  priceRwf: number;
  craftsmanship: string;
  sellerName: string;
  imageKey: string;
  imageUrl: string;
  tags: string[];
  artisanId: string | null;
  isActive: boolean;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Artisan {
  id: string;
  name: string;
  location: string;
  bio: string;
  imageUrl: string;
  productCount: number;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  ownerName: string;
  ownerContact: string;
  createdAt: string;
  updatedAt: string;
  productCount: number;
  orderCount: number;
}

export interface LearningResource {
  id: string;
  title: string;
  summary: string;
  body: string[];
  sortOrder: number;
  isPublished: boolean;
  isDemo: boolean;
  createdAt: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
