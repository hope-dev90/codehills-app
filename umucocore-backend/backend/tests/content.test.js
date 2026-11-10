import './helpers/env.js';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { mockPrisma, resetMocks } from './helpers/mockPrisma.js';
import { bearerToken } from './helpers/tokens.js';

const { default: app } = await import('./helpers/app.js');

// ─── Fixtures ────────────────────────────────────────────────────────────────

const STORY = {
  id: 'story-1',
  title: 'The Hills of Rwanda',
  subtitle: 'A journey',
  category: 'History',
  explorerCategory: null,
  era: '1800s',
  location: 'Kigali',
  latitude: -1.9441,
  longitude: 30.0619,
  summary: 'A short summary',
  contentSummary: null,
  body: ['Paragraph one', 'Paragraph two'],
  tags: ['history', 'culture'],
  gallery: [],
  imageKey: null,
  imageUrl: null,
  relatedStoryIds: [],
  xpReward: 50,
  sourceNote: null,
  isDemo: false,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const DESTINATION = {
  id: 'dest-1',
  name: 'Volcanoes National Park',
  category: 'Nature',
  summary: 'Stunning gorilla habitat',
  description: 'A detailed description',
  latitude: -1.47,
  longitude: 29.56,
  imageKey: null,
  imageUrl: null,
  isDemo: false,
  isPublished: true,
  createdAt: new Date(),
};

const EVENT = {
  id: 'evt-1',
  title: 'Kwita Izina',
  category: 'Culture',
  location: 'Musanze',
  dateLabel: 'September 2026',
  startsAt: new Date('2026-09-01'),
  endsAt: new Date('2026-09-02'),
  summary: 'Annual gorilla naming ceremony',
  description: 'Full description here',
  imageKey: null,
  imageUrl: null,
  isDemo: false,
  isPublished: true,
  createdAt: new Date(),
};

const ARTISAN = {
  id: 'art-1',
  name: 'Marie Mukamana',
  location: 'Kigali',
  bio: 'Expert weaver',
  imageUrl: null,
  createdAt: new Date(),
};

const PRODUCT = {
  id: 'prod-1',
  name: 'Agaseke Basket',
  slug: 'agaseke-basket',
  shortDescription: 'Handwoven Rwandan basket',
  description: 'A beautiful basket',
  category: 'Handicrafts',
  categoryId: 'cat-1',
  priceRwf: 15000,
  currency: 'RWF',
  craftsmanship: 'Hand-woven',
  tags: ['basket', 'handicraft'],
  imageKey: null,
  imageUrl: null,
  gallery: [],
  artisanId: 'art-1',
  artisan: { name: 'Marie Mukamana', location: 'Kigali' },
  sellerName: 'Marie Mukamana',
  rating: 4.8,
  reviewCount: 12,
  rewardStoryId: null,
  isActive: true,
  isDemo: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ─── Health ───────────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('200 — returns status up', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'up');
    assert.ok(res.body.data.time);
  });
});

describe('GET /api/nonexistent', () => {
  it('404 — unknown route returns ROUTE_NOT_FOUND', async () => {
    const res = await request(app).get('/api/nonexistent');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'ROUTE_NOT_FOUND');
  });
});

// ─── Stories ─────────────────────────────────────────────────────────────────

describe('GET /api/stories', () => {
  beforeEach(() => resetMocks());

  it('200 — lists published stories', async () => {
    mockPrisma.story.findMany.mock.mockImplementation(async () => [STORY]);
    mockPrisma.story.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/stories');

    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items.length, 1);
    assert.equal(res.body.data.items[0].id, 'story-1');
  });

  it('200 — empty list when no stories exist', async () => {
    mockPrisma.story.findMany.mock.mockImplementation(async () => []);
    mockPrisma.story.count.mock.mockImplementation(async () => 0);

    const res = await request(app).get('/api/stories');

    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 0);
    assert.deepEqual(res.body.data.items, []);
  });

  it('200 — accepts category filter', async () => {
    mockPrisma.story.findMany.mock.mockImplementation(async () => [STORY]);
    mockPrisma.story.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/stories?category=History');

    assert.equal(res.status, 200);
    // Verify the query arg was forwarded (findMany was called)
    assert.equal(mockPrisma.story.findMany.mock.calls.length, 1);
    const whereArg = mockPrisma.story.findMany.mock.calls[0].arguments[0].where;
    assert.equal(whereArg.category, 'History');
  });

  it('200 — accepts search query', async () => {
    mockPrisma.story.findMany.mock.mockImplementation(async () => [STORY]);
    mockPrisma.story.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/stories?q=hills');
    assert.equal(res.status, 200);
    const whereArg = mockPrisma.story.findMany.mock.calls[0].arguments[0].where;
    assert.ok(whereArg.OR, 'should build OR clause for search');
  });

  it('200 — works for an authenticated user (optionalAuth)', async () => {
    mockPrisma.story.findMany.mock.mockImplementation(async () => [STORY]);
    mockPrisma.story.count.mock.mockImplementation(async () => 1);

    const res = await request(app)
      .get('/api/stories')
      .set('Authorization', bearerToken('user-1'));

    assert.equal(res.status, 200);
  });
});

describe('GET /api/stories/:id', () => {
  beforeEach(() => resetMocks());

  it('200 — returns a single story', async () => {
    mockPrisma.story.findFirst.mock.mockImplementation(async () => STORY);

    const res = await request(app).get('/api/stories/story-1');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'story-1');
    assert.equal(res.body.data.title, 'The Hills of Rwanda');
  });

  it('404 — unknown story id', async () => {
    mockPrisma.story.findFirst.mock.mockImplementation(async () => null);

    const res = await request(app).get('/api/stories/nonexistent');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

// ─── Destinations ─────────────────────────────────────────────────────────────

describe('GET /api/destinations', () => {
  beforeEach(() => resetMocks());

  it('200 — lists destinations', async () => {
    mockPrisma.destination.findMany.mock.mockImplementation(async () => [DESTINATION]);
    mockPrisma.destination.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/destinations');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'dest-1');
  });

  it('200 — accepts category filter', async () => {
    mockPrisma.destination.findMany.mock.mockImplementation(async () => [DESTINATION]);
    mockPrisma.destination.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/destinations?category=Nature');
    assert.equal(res.status, 200);
    const whereArg = mockPrisma.destination.findMany.mock.calls[0].arguments[0].where;
    assert.equal(whereArg.category, 'Nature');
  });
});

describe('GET /api/destinations/:id', () => {
  beforeEach(() => resetMocks());

  it('200 — returns a destination', async () => {
    mockPrisma.destination.findFirst.mock.mockImplementation(async () => DESTINATION);

    const res = await request(app).get('/api/destinations/dest-1');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'dest-1');
  });

  it('404 — unknown destination', async () => {
    mockPrisma.destination.findFirst.mock.mockImplementation(async () => null);

    const res = await request(app).get('/api/destinations/nope');
    assert.equal(res.status, 404);
  });
});

// ─── Events ───────────────────────────────────────────────────────────────────

describe('GET /api/events', () => {
  beforeEach(() => resetMocks());

  it('200 — lists events', async () => {
    mockPrisma.event.findMany.mock.mockImplementation(async () => [EVENT]);
    mockPrisma.event.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/events');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'evt-1');
  });

  it('200 — category filter forwarded', async () => {
    mockPrisma.event.findMany.mock.mockImplementation(async () => [EVENT]);
    mockPrisma.event.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/events?category=Culture');
    assert.equal(res.status, 200);
    const whereArg = mockPrisma.event.findMany.mock.calls[0].arguments[0].where;
    assert.equal(whereArg.category, 'Culture');
  });
});

describe('GET /api/events/:id', () => {
  beforeEach(() => resetMocks());

  it('200 — returns a single event', async () => {
    mockPrisma.event.findFirst.mock.mockImplementation(async () => EVENT);

    const res = await request(app).get('/api/events/evt-1');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'evt-1');
  });

  it('404 — unknown event', async () => {
    mockPrisma.event.findFirst.mock.mockImplementation(async () => null);

    const res = await request(app).get('/api/events/unknown');
    assert.equal(res.status, 404);
  });
});

// ─── Artisans ─────────────────────────────────────────────────────────────────

describe('GET /api/artisans', () => {
  beforeEach(() => resetMocks());

  it('200 — lists artisans', async () => {
    mockPrisma.artisan.findMany.mock.mockImplementation(async () => [ARTISAN]);
    mockPrisma.artisan.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/artisans');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'art-1');
  });
});

describe('GET /api/artisans/:id', () => {
  beforeEach(() => resetMocks());

  it('200 — returns a single artisan', async () => {
    // artisan controller uses findUnique (not findFirst)
    mockPrisma.artisan.findUnique.mock.mockImplementation(async () => ARTISAN);

    const res = await request(app).get('/api/artisans/art-1');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'art-1');
    assert.equal(res.body.data.name, 'Marie Mukamana');
  });

  it('404 — unknown artisan', async () => {
    mockPrisma.artisan.findUnique.mock.mockImplementation(async () => null);

    const res = await request(app).get('/api/artisans/ghost');
    assert.equal(res.status, 404);
  });
});

// ─── Products ─────────────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  beforeEach(() => resetMocks());

  it('200 — lists active products', async () => {
    mockPrisma.product.findMany.mock.mockImplementation(async () => [PRODUCT]);
    mockPrisma.product.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/products');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'prod-1');
  });

  it('200 — maps "Food & Drinks" to DB enum FoodAndDrinks in where clause', async () => {
    mockPrisma.product.findMany.mock.mockImplementation(async () => []);
    mockPrisma.product.count.mock.mockImplementation(async () => 0);

    const res = await request(app).get('/api/products?category=Food+%26+Drinks');
    assert.equal(res.status, 200);
    const whereArg = mockPrisma.product.findMany.mock.calls[0].arguments[0].where;
    assert.equal(whereArg.category, 'FoodAndDrinks');
  });

  it('200 — accepts search query', async () => {
    mockPrisma.product.findMany.mock.mockImplementation(async () => [PRODUCT]);
    mockPrisma.product.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/products?q=basket');
    assert.equal(res.status, 200);
    const whereArg = mockPrisma.product.findMany.mock.calls[0].arguments[0].where;
    assert.ok(whereArg.OR);
  });

  it('200 — response category uses display string "Handicrafts" not enum', async () => {
    mockPrisma.product.findMany.mock.mockImplementation(async () => [PRODUCT]);
    mockPrisma.product.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/products');
    assert.equal(res.body.data.items[0].category, 'Handicrafts');
  });

  it('200 — response category "FoodAndDrinks" is mapped to "Food & Drinks"', async () => {
    const foodProduct = { ...PRODUCT, id: 'prod-2', category: 'FoodAndDrinks' };
    mockPrisma.product.findMany.mock.mockImplementation(async () => [foodProduct]);
    mockPrisma.product.count.mock.mockImplementation(async () => 1);

    const res = await request(app).get('/api/products');
    assert.equal(res.body.data.items[0].category, 'Food & Drinks');
  });
});

describe('GET /api/products/:id', () => {
  beforeEach(() => resetMocks());

  it('200 — returns a single product', async () => {
    mockPrisma.product.findFirst.mock.mockImplementation(async () => PRODUCT);

    const res = await request(app).get('/api/products/prod-1');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'prod-1');
    assert.equal(res.body.data.priceRwf, 15000);
  });

  it('404 — unknown or inactive product', async () => {
    mockPrisma.product.findFirst.mock.mockImplementation(async () => null);

    const res = await request(app).get('/api/products/ghost');
    assert.equal(res.status, 404);
  });
});
