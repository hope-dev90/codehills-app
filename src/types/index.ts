import type { ImageKey } from '../data/images';

export type StoryCategory = 'Culture' | 'Traditions' | 'Heritage' | 'Crafts' | 'Places' | 'Food';

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
  /** Remote image from the future backend; takes priority over `image` when present. */
  imageUrl?: string;
  gallery: ImageKey[];
  /** True while the content is sample text and not verified heritage material. */
  isDemo: boolean;
  /** Where the verified version of this story will come from. */
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
  priceRwf: number;
  category: ProductCategory;
  image: ImageKey;
  imageUrl?: string;
  description: string;
  craftsmanship: string;
  tags: string[];
  artisan: Artisan;
  /** Story unlocked when this product is part of a (demo) order. */
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
  /** Approximate coordinates, for map placement only. */
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
  /** Free-form label. Sample events never carry a made-up calendar date. */
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

export interface Order {
  id: string;
  createdAt: string;
  lines: CartItem[];
  subtotalRwf: number;
  shippingRwf: number;
  totalRwf: number;
  delivery: DeliveryDetails;
  /** Always a demo order until a real payment/order backend is connected. */
  status: 'demo_placed';
  paymentStatus: 'demo_no_payment';
  isDemo: true;
  rewardStoryId: string | null;
}

export interface BusinessProduct {
  id: string;
  name: string;
  priceRwf: number;
}

export interface BusinessProfile {
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
  /** Always true for now: there is no real authentication backend. */
  isDemo: true;
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
