import './helpers/env.js';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { mockPrisma, resetMocks } from './helpers/mockPrisma.js';
import { bearerToken } from './helpers/tokens.js';

const { default: app } = await import('./helpers/app.js');

// ─── Fixtures ────────────────────────────────────────────────────────────────

const USER_ID = 'user-1';
const AUTH    = bearerToken(USER_ID);

const BIZ_ID = 'biz-1';

const BUSINESS = {
  id: BIZ_ID,
  userId: USER_ID,
  name: 'Umucocore Crafts',
  category: 'Handicrafts',
  description: 'Authentic Rwandan handicrafts made with love.',
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  products: [],
};

const BIZ_PRODUCT = {
  id: 'bp-1',
  businessId: BIZ_ID,
  name: 'Woven Bag',
  priceRwf: 8000,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const BIZ_ORDER = {
  id: 'bo-1',
  businessId: BIZ_ID,
  customerName: 'Alice',
  itemDescription: 'Woven Bag x2',
  totalRwf: 16000,
  status: 'New',
  createdAt: new Date(),
};

// ─── Business CRUD ────────────────────────────────────────────────────────────

describe('GET /api/business', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/business');
    assert.equal(res.status, 401);
  });

  it('200 — returns the user business', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);

    const res = await request(app).get('/api/business').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, BIZ_ID);
    assert.equal(res.body.data.name, 'Umucocore Crafts');
  });

  it('404 — no business for this user', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => null);

    const res = await request(app).get('/api/business').set('Authorization', AUTH);
    assert.equal(res.status, 404);
  });
});

describe('PUT /api/business', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).put('/api/business').send({
      name: 'My Biz',
      category: 'Handicrafts',
      description: 'Valid description text here',
    });
    assert.equal(res.status, 401);
  });

  it('201 — creates business when none exists', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => null);
    mockPrisma.business.create.mock.mockImplementation(async () => BUSINESS);

    const res = await request(app)
      .put('/api/business')
      .set('Authorization', AUTH)
      .send({
        name: 'Umucocore Crafts',
        category: 'Handicrafts',
        description: 'Authentic Rwandan handicrafts made with love.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Umucocore Crafts');
  });

  it('200 — updates existing business', async () => {
    const updated = { ...BUSINESS, name: 'Updated Name' };
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.business.update.mock.mockImplementation(async () => updated);

    const res = await request(app)
      .put('/api/business')
      .set('Authorization', AUTH)
      .send({
        name: 'Updated Name',
        category: 'Handicrafts',
        description: 'Authentic Rwandan handicrafts made with love.',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, 'Updated Name');
  });

  it('422 — description too short', async () => {
    const res = await request(app)
      .put('/api/business')
      .set('Authorization', AUTH)
      .send({ name: 'My Biz', category: 'Handicrafts', description: 'Short' });

    assert.equal(res.status, 422);
  });

  it('422 — invalid category', async () => {
    const res = await request(app)
      .put('/api/business')
      .set('Authorization', AUTH)
      .send({
        name: 'My Biz',
        category: 'InvalidCat',
        description: 'Authentic Rwandan handicrafts made with love.',
      });

    assert.equal(res.status, 422);
  });
});

describe('DELETE /api/business', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).delete('/api/business');
    assert.equal(res.status, 401);
  });

  it('200 — deletes the business', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.business.delete.mock.mockImplementation(async () => ({}));

    const res = await request(app).delete('/api/business').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('404 — no business to delete', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => null);

    const res = await request(app).delete('/api/business').set('Authorization', AUTH);
    assert.equal(res.status, 404);
  });
});

// ─── Business Products ────────────────────────────────────────────────────────

describe('GET /api/business/products', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/business/products');
    assert.equal(res.status, 401);
  });

  it('200 — returns business products', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessProduct.findMany.mock.mockImplementation(async () => [BIZ_PRODUCT]);

    const res = await request(app).get('/api/business/products').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'bp-1');
  });

  it('404 — user has no business', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => null);

    const res = await request(app).get('/api/business/products').set('Authorization', AUTH);
    assert.equal(res.status, 404);
  });
});

describe('POST /api/business/products', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app)
      .post('/api/business/products')
      .send({ name: 'Bag', priceRwf: 5000 });
    assert.equal(res.status, 401);
  });

  it('201 — adds a product', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessProduct.create.mock.mockImplementation(async () => BIZ_PRODUCT);

    const res = await request(app)
      .post('/api/business/products')
      .set('Authorization', AUTH)
      .send({ name: 'Woven Bag', priceRwf: 8000 });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Woven Bag');
    assert.equal(res.body.data.priceRwf, 8000);
  });

  it('422 — name too short', async () => {
    const res = await request(app)
      .post('/api/business/products')
      .set('Authorization', AUTH)
      .send({ name: 'X', priceRwf: 8000 });

    assert.equal(res.status, 422);
  });

  it('422 — missing priceRwf', async () => {
    const res = await request(app)
      .post('/api/business/products')
      .set('Authorization', AUTH)
      .send({ name: 'Woven Bag' });

    assert.equal(res.status, 422);
  });
});

describe('PATCH /api/business/products/:id', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app)
      .patch('/api/business/products/bp-1')
      .send({ priceRwf: 9000 });
    assert.equal(res.status, 401);
  });

  it('200 — updates a product', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessProduct.findFirst.mock.mockImplementation(async () => BIZ_PRODUCT);
    mockPrisma.businessProduct.update.mock.mockImplementation(async () => ({
      ...BIZ_PRODUCT,
      priceRwf: 9000,
    }));

    const res = await request(app)
      .patch('/api/business/products/bp-1')
      .set('Authorization', AUTH)
      .send({ priceRwf: 9000 });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.priceRwf, 9000);
  });

  it('404 — product not found in this business', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessProduct.findFirst.mock.mockImplementation(async () => null);

    const res = await request(app)
      .patch('/api/business/products/ghost')
      .set('Authorization', AUTH)
      .send({ priceRwf: 9000 });

    assert.equal(res.status, 404);
  });
});

describe('DELETE /api/business/products/:id', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).delete('/api/business/products/bp-1');
    assert.equal(res.status, 401);
  });

  it('200 — removes a product', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessProduct.findFirst.mock.mockImplementation(async () => BIZ_PRODUCT);
    mockPrisma.businessProduct.delete.mock.mockImplementation(async () => ({}));

    const res = await request(app)
      .delete('/api/business/products/bp-1')
      .set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'bp-1');
  });

  it('404 — product not owned by business', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessProduct.findFirst.mock.mockImplementation(async () => null);

    const res = await request(app)
      .delete('/api/business/products/ghost')
      .set('Authorization', AUTH);

    assert.equal(res.status, 404);
  });
});

// ─── Business Orders ──────────────────────────────────────────────────────────

describe('GET /api/business/orders', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/business/orders');
    assert.equal(res.status, 401);
  });

  it('200 — returns orders and stats', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessOrder.findMany.mock.mockImplementation(async () => [BIZ_ORDER]);

    const res = await request(app).get('/api/business/orders').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.items.length, 1);
    assert.equal(res.body.data.items[0].id, 'bo-1');
    assert.ok('stats' in res.body.data, 'response should include stats');
    assert.equal(res.body.data.stats.total, 1);
    assert.equal(res.body.data.stats.newCount, 1);
    assert.equal(res.body.data.stats.earningsRwf, 0); // no Delivered orders
  });

  it('200 — earningsRwf sums Delivered orders only', async () => {
    const deliveredOrder = { ...BIZ_ORDER, id: 'bo-2', status: 'Delivered', totalRwf: 16000 };
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessOrder.findMany.mock.mockImplementation(async () => [
      BIZ_ORDER,
      deliveredOrder,
    ]);

    const res = await request(app).get('/api/business/orders').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.stats.earningsRwf, 16000);
    assert.equal(res.body.data.stats.newCount, 1);
  });

  it('404 — user has no business', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => null);

    const res = await request(app).get('/api/business/orders').set('Authorization', AUTH);
    assert.equal(res.status, 404);
  });
});

describe('PATCH /api/business/orders/:id', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app)
      .patch('/api/business/orders/bo-1')
      .send({ status: 'Preparing' });
    assert.equal(res.status, 401);
  });

  it('200 — updates order status', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessOrder.findFirst.mock.mockImplementation(async () => BIZ_ORDER);
    mockPrisma.businessOrder.update.mock.mockImplementation(async () => ({
      ...BIZ_ORDER,
      status: 'Preparing',
    }));

    const res = await request(app)
      .patch('/api/business/orders/bo-1')
      .set('Authorization', AUTH)
      .send({ status: 'Preparing' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'Preparing');
  });

  it('422 — invalid status value', async () => {
    const res = await request(app)
      .patch('/api/business/orders/bo-1')
      .set('Authorization', AUTH)
      .send({ status: 'shipped' }); // lowercase, wrong enum

    assert.equal(res.status, 422);
  });

  it('404 — order not found in this business', async () => {
    mockPrisma.business.findUnique.mock.mockImplementation(async () => BUSINESS);
    mockPrisma.businessOrder.findFirst.mock.mockImplementation(async () => null);

    const res = await request(app)
      .patch('/api/business/orders/ghost')
      .set('Authorization', AUTH)
      .send({ status: 'Preparing' });

    assert.equal(res.status, 404);
  });
});
