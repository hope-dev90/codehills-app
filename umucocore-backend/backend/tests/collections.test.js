import './helpers/env.js';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { mockPrisma, resetMocks } from './helpers/mockPrisma.js';
import { bearerToken } from './helpers/tokens.js';

const { default: app } = await import('./helpers/app.js');

// ─── Fixtures ────────────────────────────────────────────────────────────────

const USER_ID = 'user-1';
const AUTH = bearerToken(USER_ID);

const PRODUCT = {
  id: 'prod-1',
  name: 'Agaseke Basket',
  slug: 'agaseke-basket',
  shortDescription: 'Handwoven basket',
  description: 'Full description',
  category: 'Handicrafts',
  categoryId: 'cat-1',
  priceRwf: 15000,
  currency: 'RWF',
  craftsmanship: 'Hand-woven',
  tags: ['basket'],
  imageKey: null,
  imageUrl: null,
  gallery: [],
  artisanId: null,
  artisan: null,
  sellerName: 'Marie',
  rating: null,
  reviewCount: 0,
  rewardStoryId: null,
  isActive: true,
  isDemo: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const STORY = {
  id: 'story-1',
  title: 'The Hills',
  subtitle: '',
  category: 'History',
  explorerCategory: null,
  era: null,
  location: null,
  latitude: null,
  longitude: null,
  summary: 'Summary text',
  contentSummary: null,
  body: ['Para one'],
  tags: [],
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

// ─── Favorites ────────────────────────────────────────────────────────────────

describe('GET /api/favorites — requires auth', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/favorites');
    assert.equal(res.status, 401);
  });

  it('200 — returns favorited products', async () => {
    mockPrisma.userFavorite.findMany.mock.mockImplementation(async () => [
      { product: PRODUCT, userId: USER_ID, productId: 'prod-1', createdAt: new Date() },
    ]);

    const res = await request(app).get('/api/favorites').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'prod-1');
  });

  it('200 — empty favorites list', async () => {
    mockPrisma.userFavorite.findMany.mock.mockImplementation(async () => []);

    const res = await request(app).get('/api/favorites').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 0);
    assert.deepEqual(res.body.data.items, []);
  });
});

describe('GET /api/favorites/ids', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/favorites/ids');
    assert.equal(res.status, 401);
  });

  it('200 — returns array of productIds', async () => {
    mockPrisma.userFavorite.findMany.mock.mockImplementation(async () => [
      { productId: 'prod-1' },
      { productId: 'prod-2' },
    ]);

    const res = await request(app).get('/api/favorites/ids').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.ids, ['prod-1', 'prod-2']);
  });
});

describe('POST /api/favorites/:productId/toggle', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).post('/api/favorites/prod-1/toggle');
    assert.equal(res.status, 401);
  });

  it('200 — adds to favorites when not yet favorited', async () => {
    mockPrisma.product.findUnique.mock.mockImplementation(async () => PRODUCT);
    mockPrisma.userFavorite.findUnique.mock.mockImplementation(async () => null);
    mockPrisma.userFavorite.create.mock.mockImplementation(async () => ({
      userId: USER_ID,
      productId: 'prod-1',
    }));

    const res = await request(app)
      .post('/api/favorites/prod-1/toggle')
      .set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.favorited, true);
    assert.equal(res.body.data.productId, 'prod-1');
  });

  it('200 — removes from favorites when already favorited', async () => {
    mockPrisma.product.findUnique.mock.mockImplementation(async () => PRODUCT);
    mockPrisma.userFavorite.findUnique.mock.mockImplementation(async () => ({
      userId: USER_ID,
      productId: 'prod-1',
    }));
    mockPrisma.userFavorite.delete.mock.mockImplementation(async () => ({}));

    const res = await request(app)
      .post('/api/favorites/prod-1/toggle')
      .set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.favorited, false);
  });

  it('404 — product does not exist', async () => {
    mockPrisma.product.findUnique.mock.mockImplementation(async () => null);

    const res = await request(app)
      .post('/api/favorites/ghost/toggle')
      .set('Authorization', AUTH);

    assert.equal(res.status, 404);
  });
});

// ─── Bookmarks ────────────────────────────────────────────────────────────────

describe('GET /api/bookmarks', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/bookmarks');
    assert.equal(res.status, 401);
  });

  it('200 — returns bookmarked stories', async () => {
    mockPrisma.userBookmark.findMany.mock.mockImplementation(async () => [
      { story: STORY, userId: USER_ID, storyId: 'story-1', createdAt: new Date() },
    ]);

    const res = await request(app).get('/api/bookmarks').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'story-1');
  });
});

describe('GET /api/bookmarks/ids', () => {
  beforeEach(() => resetMocks());

  it('200 — returns array of storyIds', async () => {
    mockPrisma.userBookmark.findMany.mock.mockImplementation(async () => [
      { storyId: 'story-1' },
      { storyId: 'story-2' },
    ]);

    const res = await request(app).get('/api/bookmarks/ids').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.ids, ['story-1', 'story-2']);
  });
});

describe('POST /api/bookmarks/:storyId/toggle', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).post('/api/bookmarks/story-1/toggle');
    assert.equal(res.status, 401);
  });

  it('200 — bookmarks a story', async () => {
    mockPrisma.story.findUnique.mock.mockImplementation(async () => STORY);
    mockPrisma.userBookmark.findUnique.mock.mockImplementation(async () => null);
    mockPrisma.userBookmark.create.mock.mockImplementation(async () => ({
      userId: USER_ID,
      storyId: 'story-1',
    }));

    const res = await request(app)
      .post('/api/bookmarks/story-1/toggle')
      .set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.bookmarked, true);
  });

  it('200 — unbookmarks a story', async () => {
    mockPrisma.story.findUnique.mock.mockImplementation(async () => STORY);
    mockPrisma.userBookmark.findUnique.mock.mockImplementation(async () => ({
      userId: USER_ID,
      storyId: 'story-1',
    }));
    mockPrisma.userBookmark.delete.mock.mockImplementation(async () => ({}));

    const res = await request(app)
      .post('/api/bookmarks/story-1/toggle')
      .set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.bookmarked, false);
  });

  it('404 — story does not exist', async () => {
    mockPrisma.story.findUnique.mock.mockImplementation(async () => null);

    const res = await request(app)
      .post('/api/bookmarks/ghost/toggle')
      .set('Authorization', AUTH);

    assert.equal(res.status, 404);
  });
});

// ─── Rewards (unlocked stories) ───────────────────────────────────────────────

describe('GET /api/rewards', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/rewards');
    assert.equal(res.status, 401);
  });

  it('200 — returns unlocked stories', async () => {
    mockPrisma.userUnlockedStory.findMany.mock.mockImplementation(async () => [
      { story: STORY, userId: USER_ID, storyId: 'story-1' },
    ]);

    const res = await request(app).get('/api/rewards').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'story-1');
  });

  it('200 — empty when no stories unlocked', async () => {
    mockPrisma.userUnlockedStory.findMany.mock.mockImplementation(async () => []);

    const res = await request(app).get('/api/rewards').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 0);
  });
});

describe('GET /api/rewards/ids', () => {
  beforeEach(() => resetMocks());

  it('200 — returns array of storyIds', async () => {
    mockPrisma.userUnlockedStory.findMany.mock.mockImplementation(async () => [
      { storyId: 'story-1' },
    ]);

    const res = await request(app).get('/api/rewards/ids').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.ids, ['story-1']);
  });
});
