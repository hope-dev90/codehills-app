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

const PRODUCT = {
  id: 'prod-1',
  name: 'Agaseke Basket',
  priceRwf: 15000,
  imageKey: null,
  imageUrl: null,
  rewardStoryId: null,
  isActive: true,
};

const CART_ITEM = {
  id: 'ci-1',
  userId: USER_ID,
  productId: 'prod-1',
  quantity: 2,
  addedAt: new Date(),
  updatedAt: new Date(),
  product: PRODUCT,
};

const DELIVERY = {
  fullName: 'Jean Baptiste',
  phone: '+250788000001',
  address: 'KG 7 Ave',
  city: 'Kigali',
};

const ORDER_LINE = {
  id: 'ol-1',
  orderId: 'ORD-ABCDEF123456',
  productId: 'prod-1',
  productName: 'Agaseke Basket',
  priceRwf: 15000,
  quantity: 2,
  imageKey: null,
  imageUrl: null,
  rewardStoryId: null,
};

const ORDER = {
  id: 'ORD-ABCDEF123456',
  userId: USER_ID,
  subtotalRwf: 30000,
  shippingRwf: 2000,
  totalRwf: 32000,
  currency: 'RWF',
  deliveryFullName: DELIVERY.fullName,
  deliveryPhone: DELIVERY.phone,
  deliveryAddress: DELIVERY.address,
  deliveryCity: DELIVERY.city,
  status: 'placed',
  paymentStatus: 'unpaid',
  paymentMethod: 'cash_on_delivery',
  rewardStoryId: null,
  isDemo: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lines: [ORDER_LINE],
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

describe('GET /api/cart', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/cart');
    assert.equal(res.status, 401);
  });

  it('200 — returns cart items', async () => {
    mockPrisma.cartItem.findMany.mock.mockImplementation(async () => [CART_ITEM]);

    const res = await request(app).get('/api/cart').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.items.length, 1);
    assert.equal(res.body.data.items[0].productId, 'prod-1');
    assert.equal(res.body.data.items[0].quantity, 2);
  });

  it('200 — empty cart', async () => {
    mockPrisma.cartItem.findMany.mock.mockImplementation(async () => []);

    const res = await request(app).get('/api/cart').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.items, []);
  });
});

describe('POST /api/cart', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).post('/api/cart').send({ productId: 'prod-1', quantity: 1 });
    assert.equal(res.status, 401);
  });

  it('200 — adds new item to cart', async () => {
    mockPrisma.product.findUnique.mock.mockImplementation(async () => PRODUCT);
    mockPrisma.cartItem.findUnique.mock.mockImplementation(async () => null);
    mockPrisma.cartItem.create.mock.mockImplementation(async () => CART_ITEM);

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', AUTH)
      .send({ productId: 'prod-1', quantity: 2 });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.productId, 'prod-1');
  });

  it('200 — increments quantity for existing cart item', async () => {
    mockPrisma.product.findUnique.mock.mockImplementation(async () => PRODUCT);
    mockPrisma.cartItem.findUnique.mock.mockImplementation(async () => CART_ITEM);
    mockPrisma.cartItem.update.mock.mockImplementation(async () => ({
      ...CART_ITEM,
      quantity: 4,
    }));

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', AUTH)
      .send({ productId: 'prod-1', quantity: 2 });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.quantity, 4);
  });

  it('404 — product not found', async () => {
    mockPrisma.product.findUnique.mock.mockImplementation(async () => null);

    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', AUTH)
      .send({ productId: 'ghost', quantity: 1 });

    assert.equal(res.status, 404);
  });

  it('422 — missing productId', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', AUTH)
      .send({ quantity: 1 });

    assert.equal(res.status, 422);
  });

  it('422 — quantity 0 not allowed on add', async () => {
    const res = await request(app)
      .post('/api/cart')
      .set('Authorization', AUTH)
      .send({ productId: 'prod-1', quantity: 0 });

    assert.equal(res.status, 422);
  });
});

describe('PATCH /api/cart/:productId', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).patch('/api/cart/prod-1').send({ quantity: 3 });
    assert.equal(res.status, 401);
  });

  it('200 — updates quantity', async () => {
    mockPrisma.cartItem.update.mock.mockImplementation(async () => ({
      ...CART_ITEM,
      quantity: 3,
    }));

    const res = await request(app)
      .patch('/api/cart/prod-1')
      .set('Authorization', AUTH)
      .send({ quantity: 3 });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.quantity, 3);
  });

  it('200 — quantity 0 removes item', async () => {
    mockPrisma.cartItem.deleteMany.mock.mockImplementation(async () => ({ count: 1 }));

    const res = await request(app)
      .patch('/api/cart/prod-1')
      .set('Authorization', AUTH)
      .send({ quantity: 0 });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.removed, true);
  });

  it('422 — quantity above max', async () => {
    const res = await request(app)
      .patch('/api/cart/prod-1')
      .set('Authorization', AUTH)
      .send({ quantity: 100 });

    assert.equal(res.status, 422);
  });
});

describe('DELETE /api/cart/:productId', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).delete('/api/cart/prod-1');
    assert.equal(res.status, 401);
  });

  it('200 — removes item from cart', async () => {
    mockPrisma.cartItem.deleteMany.mock.mockImplementation(async () => ({ count: 1 }));

    const res = await request(app)
      .delete('/api/cart/prod-1')
      .set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.removed, true);
    assert.equal(res.body.data.productId, 'prod-1');
  });
});

describe('DELETE /api/cart', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).delete('/api/cart');
    assert.equal(res.status, 401);
  });

  it('200 — clears the entire cart', async () => {
    mockPrisma.cartItem.deleteMany.mock.mockImplementation(async () => ({ count: 3 }));

    const res = await request(app).delete('/api/cart').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});

// ─── Orders ───────────────────────────────────────────────────────────────────

describe('POST /api/orders', () => {
  beforeEach(() => resetMocks());

  it('201 — places order as guest (no auth)', async () => {
    mockPrisma.product.findMany.mock.mockImplementation(async () => [PRODUCT]);
    mockPrisma.$transaction.mock.mockImplementation(async (fn) => fn(mockPrisma));
    mockPrisma.order.create.mock.mockImplementation(async () => ORDER);

    const res = await request(app).post('/api/orders').send({
      lines: [{ productId: 'prod-1', quantity: 2 }],
      delivery: DELIVERY,
    });

    assert.equal(res.status, 201);
    assert.ok(res.body.data.id.startsWith('ORD-'));
    assert.equal(res.body.data.status, 'placed');
  });

  it('201 — places order as authenticated user', async () => {
    mockPrisma.product.findMany.mock.mockImplementation(async () => [PRODUCT]);
    mockPrisma.userUnlockedStory.findMany.mock.mockImplementation(async () => []);
    mockPrisma.story.findFirst.mock.mockImplementation(async () => null);
    mockPrisma.$transaction.mock.mockImplementation(async (fn) => fn(mockPrisma));
    mockPrisma.order.create.mock.mockImplementation(async () => ORDER);
    mockPrisma.cartItem.deleteMany.mock.mockImplementation(async () => ({ count: 0 }));

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', AUTH)
      .send({
        lines: [{ productId: 'prod-1', quantity: 2 }],
        delivery: DELIVERY,
      });

    assert.equal(res.status, 201);
  });

  it('400 — product not found or inactive', async () => {
    mockPrisma.product.findMany.mock.mockImplementation(async () => []); // none returned

    const res = await request(app).post('/api/orders').send({
      lines: [{ productId: 'ghost', quantity: 1 }],
      delivery: DELIVERY,
    });

    assert.equal(res.status, 400);
  });

  it('422 — empty lines array', async () => {
    const res = await request(app).post('/api/orders').send({
      lines: [],
      delivery: DELIVERY,
    });
    assert.equal(res.status, 422);
  });

  it('422 — missing delivery city', async () => {
    const res = await request(app).post('/api/orders').send({
      lines: [{ productId: 'prod-1', quantity: 1 }],
      delivery: { fullName: 'Jean', phone: '+250788000001', address: 'KG 7' },
    });
    assert.equal(res.status, 422);
  });

  it('422 — invalid paymentMethod value', async () => {
    const res = await request(app).post('/api/orders').send({
      lines: [{ productId: 'prod-1', quantity: 1 }],
      delivery: DELIVERY,
      paymentMethod: 'crypto',
    });
    assert.equal(res.status, 422);
  });
});

describe('GET /api/orders', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/orders');
    assert.equal(res.status, 401);
  });

  it('200 — returns user orders', async () => {
    mockPrisma.order.findMany.mock.mockImplementation(async () => [ORDER]);

    const res = await request(app).get('/api/orders').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 1);
    assert.equal(res.body.data.items[0].id, 'ORD-ABCDEF123456');
  });

  it('200 — empty order history', async () => {
    mockPrisma.order.findMany.mock.mockImplementation(async () => []);

    const res = await request(app).get('/api/orders').set('Authorization', AUTH);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.total, 0);
    assert.deepEqual(res.body.data.items, []);
  });
});

describe('GET /api/orders/:id', () => {
  beforeEach(() => resetMocks());

  it('401 — no token', async () => {
    const res = await request(app).get('/api/orders/ORD-ABCDEF123456');
    assert.equal(res.status, 401);
  });

  it('200 — returns specific order', async () => {
    mockPrisma.order.findFirst.mock.mockImplementation(async () => ORDER);

    const res = await request(app)
      .get('/api/orders/ORD-ABCDEF123456')
      .set('Authorization', AUTH);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'ORD-ABCDEF123456');
    assert.equal(res.body.data.totalRwf, 32000);
    assert.ok(res.body.data.delivery);
    assert.equal(res.body.data.delivery.city, 'Kigali');
  });

  it('404 — order not found or belongs to another user', async () => {
    mockPrisma.order.findFirst.mock.mockImplementation(async () => null);

    const res = await request(app)
      .get('/api/orders/ORD-NOTMINE')
      .set('Authorization', AUTH);

    assert.equal(res.status, 404);
  });
});
