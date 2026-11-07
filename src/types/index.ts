import type { ImageKey } from '../data/images';

export type StoryCategory = string;

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  category: StoryCategory;
  summary: string;
  /** Paragraphs of the narrative. */
  body: string[];
  tags: string[];
  image: ImageKey;
  imageUrl?: string;
  gallery: ImageKey[];
  relatedStoryIds: string[];
  location?: string;
  explorerCategory?: string;
  /** True while the content is sample text and not verified heritage material. */
  isDemo: boolean;
  sourceNote?: string;
}

export type ProductCategory = 'Handicrafts' | 'Food & Drinks' | 'Art';

export interface Artisan {
  name: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  categoryId: string;
  priceRwf: number;
  currency: 'RWF';
  image: ImageKey;
  imageUrl?: string;
  gallery: ImageKey[];
  craftsmanship: string;
  tags: string[];
  artisan: Artisan;
  sellerName: string;
  isActive: boolean;
  /** Story unlocked when this product is part of a confirmed order. */
  rewardStoryId: string;
  isDemo: boolean;
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
  image: ImageKey;
  imageUrl?: string;
  isDemo: boolean;
}

export type EventCategory = 'Festival' | 'Coffee' | 'Culture';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  location: string;
  dateLabel: string;
  summary: string;
  description: string;
  image: ImageKey;
  imageUrl?: string;
  isDemo: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  priceRwf: number;
  image: ImageKey;
  imageUrl?: string;
  rewardStoryId: string;
  quantity: number;
}

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

export type PaymentMethod = 'cash_on_delivery' | 'mtn_momo' | 'airtel_money' | 'card';

export type OrderFulfillmentStatus = 'placed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderPaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'sandbox_unpaid'
  | 'demo_no_payment';

export interface Order {
  id: string;
  createdAt: string;
  lines: CartItem[];
  subtotalRwf: number;
  shippingRwf: number;
  totalRwf: number;
  currency: 'RWF';
  delivery: DeliveryDetails;
  status: OrderFulfillmentStatus | 'demo_placed';
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  isDemo: boolean;
  rewardStoryId: string | null;
}

export interface BusinessProduct {
  id: string;
  name: string;
  priceRwf: number;
}

export interface BusinessProfile {
  id?: string;
  name: string;
  category: string;
  description: string;
  imageUri?: string;
  createdAt: string;
  products: BusinessProduct[];
}

export interface DemoOrder {
  id: string;
  customer: string;
  item: string;
  totalRwf: number;
  status: 'New' | 'Preparing' | 'Delivered';
}

export interface LearningResource {
  id: string;
  title: string;
  summary: string;
  body: string[];
  isDemo: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  contact: string;
  authProvider: 'password' | 'google';
  isDemo: boolean;
}

export type LanguageCode = 'en' | 'rw' | 'fr';

export interface Preferences {
  language: LanguageCode;
  rememberMe: boolean;
}

export interface AppData {
  user: UserProfile | null;
  preferences: Preferences;
  rememberedContact: string;
  cart: CartItem[];
  favorites: string[];
  bookmarks: string[];
  savedPlaces: string[];
  orders: Order[];
  unlockedStories: string[];
  business: BusinessProfile | null;
}
