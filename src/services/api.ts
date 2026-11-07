/**
 * Content service — stories, products, destinations, events, learning resources.
 *
 * Switches between the local mock data and the UmucoCore backend
 * based on config.useMockData (driven by EXPO_PUBLIC_API_URL).
 *
 * The HTTP implementation maps backend responses onto the exact TypeScript
 * types the app already uses so no screen needs to change.
 */
import { config } from './config';
import { api } from './apiClient';
import { mockStories }          from '../data/stories';
import { mockProducts }         from '../data/products';
import { mockDestinations }     from '../data/destinations';
import { mockEvents }           from '../data/events';
import { mockLearningResources } from '../data/business';
import type { ContentService }  from './interfaces';
import type { Story, Product, Destination, EventItem, LearningResource } from '../types';
import type { ImageKey } from '../data/images';

// ─── Response types from the backend ─────────────────────────────────────────

interface ListResponse<T> { items: T[]; total: number }

interface ApiStory {
  id: string; title: string; subtitle?: string; category: string;
  explorerCategory?: string; era?: string; location?: string;
  latitude?: number; longitude?: number; summary: string;
  contentSummary?: string; body: string[]; tags: string[]; gallery: string[];
  imageKey?: string; imageUrl?: string; relatedStoryIds: string[];
  xpReward: number; sourceNote?: string; isDemo: boolean;
}

interface ApiProduct {
  id: string; name: string; slug: string; shortDescription: string;
  description: string; category: string; categoryId: string; priceRwf: number;
  currency: string; craftsmanship: string; tags: string[]; imageKey?: string;
  imageUrl?: string; gallery: string[];
  artisan: { name: string; location: string };
  sellerName: string; rating?: number; reviewCount: number;
  rewardStoryId?: string; isActive: boolean; isDemo: boolean;
}

interface ApiDestination {
  id: string; name: string; category: string; summary: string; description: string;
  latitude: number; longitude: number; imageKey?: string; imageUrl?: string; isDemo: boolean;
}

interface ApiEvent {
  id: string; title: string; category: string; location: string; dateLabel: string;
  startsAt?: string; endsAt?: string; summary: string; description: string;
  imageKey?: string; imageUrl?: string; isDemo: boolean;
}

interface ApiLearning {
  id: string; title: string; summary: string; body: string[]; isDemo: boolean;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapStory(s: ApiStory): Story {
  return {
    id: s.id,
    title: s.title,
    subtitle: s.subtitle ?? '',
    category: s.category,
    summary: s.summary,
    body: Array.isArray(s.body) ? s.body : [],
    tags: s.tags,
    image: (s.imageKey ?? 'hills') as ImageKey,
    imageUrl: s.imageUrl,
    gallery: (s.gallery ?? []) as ImageKey[],
    relatedStoryIds: s.relatedStoryIds ?? [],
    location: s.location,
    explorerCategory: s.explorerCategory,
    isDemo: s.isDemo,
    sourceNote: s.sourceNote,
  };
}

function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    category: p.category as Product['category'],
    categoryId: p.categoryId,
    priceRwf: p.priceRwf,
    currency: 'RWF',
    image: (p.imageKey ?? 'basket') as ImageKey,
    imageUrl: p.imageUrl,
    gallery: (p.gallery ?? []) as ImageKey[],
    craftsmanship: p.craftsmanship,
    tags: p.tags,
    artisan: p.artisan,
    sellerName: p.sellerName,
    isActive: p.isActive,
    rewardStoryId: p.rewardStoryId ?? '',
    isDemo: p.isDemo,
  };
}

function mapDestination(d: ApiDestination): Destination {
  return {
    id: d.id,
    name: d.name,
    category: d.category as Destination['category'],
    summary: d.summary,
    description: d.description,
    latitude: d.latitude,
    longitude: d.longitude,
    image: (d.imageKey ?? 'hills') as ImageKey,
    imageUrl: d.imageUrl,
    isDemo: d.isDemo,
  };
}

function mapEvent(e: ApiEvent): EventItem {
  return {
    id: e.id,
    title: e.title,
    category: e.category as EventItem['category'],
    location: e.location,
    dateLabel: e.dateLabel,
    summary: e.summary,
    description: e.description,
    image: (e.imageKey ?? 'festival') as ImageKey,
    imageUrl: e.imageUrl,
    isDemo: e.isDemo,
  };
}

function mapLearning(r: ApiLearning): LearningResource {
  return {
    id: r.id,
    title: r.title,
    summary: r.summary,
    body: Array.isArray(r.body) ? r.body : [],
    isDemo: r.isDemo,
  };
}

// ─── Mock implementation ──────────────────────────────────────────────────────

const mockContentService: ContentService = {
  getStories:         async () => mockStories,
  getProducts:        async () => mockProducts,
  getDestinations:    async () => mockDestinations,
  getEvents:          async () => mockEvents,
  getLearningResources: async () => mockLearningResources,
};

// ─── HTTP implementation ──────────────────────────────────────────────────────

const httpContentService: ContentService = {
  async getStories() {
    const res = await api.get<ListResponse<ApiStory>>('/stories?limit=100');
    return res.items.map(mapStory);
  },

  async getProducts() {
    const res = await api.get<ListResponse<ApiProduct>>('/products?limit=100');
    return res.items.map(mapProduct);
  },

  async getDestinations() {
    const res = await api.get<ListResponse<ApiDestination>>('/destinations?limit=100');
    return res.items.map(mapDestination);
  },

  async getEvents() {
    const res = await api.get<ListResponse<ApiEvent>>('/events?limit=100');
    return res.items.map(mapEvent);
  },

  async getLearningResources() {
    const res = await api.get<ListResponse<ApiLearning>>('/learning');
    return res.items.map(mapLearning);
  },
};

export const contentService: ContentService = config.useMockData
  ? mockContentService
  : httpContentService;

// ─── Individual item fetchers (used by detail screens) ───────────────────────

export async function fetchStory(id: string): Promise<Story | null> {
  if (config.useMockData) {
    const { getStoryById } = await import('../data/stories');
    return getStoryById(id) ?? null;
  }
  try {
    return mapStory(await api.get<ApiStory>(`/stories/${id}`));
  } catch { return null; }
}

export async function fetchProduct(id: string): Promise<Product | null> {
  if (config.useMockData) {
    const { getProductById } = await import('../data/products');
    return getProductById(id) ?? null;
  }
  try {
    return mapProduct(await api.get<ApiProduct>(`/products/${id}`));
  } catch { return null; }
}

export async function fetchDestination(id: string): Promise<Destination | null> {
  if (config.useMockData) {
    const { getDestinationById } = await import('../data/destinations');
    return getDestinationById(id) ?? null;
  }
  try {
    return mapDestination(await api.get<ApiDestination>(`/destinations/${id}`));
  } catch { return null; }
}

export async function fetchEvent(id: string): Promise<EventItem | null> {
  if (config.useMockData) {
    const { getEventById } = await import('../data/events');
    return getEventById(id) ?? null;
  }
  try {
    return mapEvent(await api.get<ApiEvent>(`/events/${id}`));
  } catch { return null; }
}

export async function fetchLearningResource(id: string): Promise<LearningResource | null> {
  if (config.useMockData) {
    const { mockLearningResources } = await import('../data/business');
    return mockLearningResources.find((r) => r.id === id) ?? null;
  }
  try {
    return mapLearning(await api.get<ApiLearning>(`/learning/${id}`));
  } catch { return null; }
}
