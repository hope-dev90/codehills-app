import './helpers/env.js';
import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { mockPrisma, resetMocks } from './helpers/mockPrisma.js';
import { bearerToken } from './helpers/tokens.js';

// Import app AFTER env + mockPrisma setup
const { default: app } = await import('./helpers/app.js');

// ─── Fixtures ────────────────────────────────────────────────────────────────

const PASSWORD = 'password123';
const HASH = await bcrypt.hash(PASSWORD, 1); // low rounds for test speed

const BASE_USER = {
  id: 'user-1',
  fullName: 'Test User',
  contact: 'test@example.com',
  contactType: 'email',
  passwordHash: HASH,
  authProvider: 'password',
  googleId: null,
  googleEmail: null,
  language: 'en',
  rememberMe: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const REFRESH_ROW = {
  id: 'rt-1',
  userId: 'user-1',
  tokenHash: 'abc123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  revokedAt: null,
  deviceInfo: null,
  createdAt: new Date(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** POST helper that returns supertest response */
const post = (path, body) => request(app).post(path).send(body);
const get  = (path, token) => request(app).get(path).set('Authorization', token ?? '');
const put  = (path, body, token) =>
  request(app).put(path).set('Authorization', token ?? '').send(body);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  beforeEach(() => resetMocks());

  it('201 — creates a new user and returns tokens', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => null);
    mockPrisma.user.create.mock.mockImplementation(async () => BASE_USER);
    mockPrisma.refreshToken.create.mock.mockImplementation(async () => REFRESH_ROW);

    const res = await post('/api/auth/register', {
      fullName: 'Test User',
      contact: 'test@example.com',
      password: PASSWORD,
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.accessToken);
    assert.ok(res.body.data.refreshToken);
    assert.equal(res.body.data.user.contact, 'test@example.com');
  });

  it('409 — rejects duplicate contact', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => BASE_USER);

    const res = await post('/api/auth/register', {
      fullName: 'Test User',
      contact: 'test@example.com',
      password: PASSWORD,
    });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  it('422 — rejects missing password', async () => {
    const res = await post('/api/auth/register', {
      fullName: 'Test User',
      contact: 'test@example.com',
    });
    assert.equal(res.status, 422);
  });

  it('422 — rejects short password (< 8 chars)', async () => {
    const res = await post('/api/auth/register', {
      fullName: 'Test User',
      contact: 'test@example.com',
      password: 'short',
    });
    assert.equal(res.status, 422);
  });

  it('400 — rejects invalid contact format', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => null);

    const res = await post('/api/auth/register', {
      fullName: 'Test User',
      contact: 'not-a-valid-contact',
      password: PASSWORD,
    });
    assert.equal(res.status, 400);
  });

  it('normalizes Rwandan phone number', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => null);
    mockPrisma.user.create.mock.mockImplementation(async (args) => ({
      ...BASE_USER,
      contact: args.data.contact,
      contactType: args.data.contactType,
    }));
    mockPrisma.refreshToken.create.mock.mockImplementation(async () => REFRESH_ROW);

    const res = await post('/api/auth/register', {
      fullName: 'Rwandan User',
      contact: '0788123456',
      password: PASSWORD,
    });

    assert.equal(res.status, 201);
    // normalizeContact should have converted 0788... → +250788...
    assert.match(res.body.data.user.contact, /^\+250/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(() => resetMocks());

  it('200 — valid credentials return tokens', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => BASE_USER);
    mockPrisma.user.update.mock.mockImplementation(async () => BASE_USER);
    mockPrisma.refreshToken.create.mock.mockImplementation(async () => REFRESH_ROW);

    const res = await post('/api/auth/login', {
      contact: 'test@example.com',
      password: PASSWORD,
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.accessToken);
    assert.ok(res.body.data.refreshToken);
    assert.equal(res.body.data.user.id, 'user-1');
  });

  it('401 — wrong password', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => BASE_USER);

    const res = await post('/api/auth/login', {
      contact: 'test@example.com',
      password: 'wrongpassword',
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('401 — user not found', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => null);

    const res = await post('/api/auth/login', {
      contact: 'nobody@example.com',
      password: PASSWORD,
    });

    assert.equal(res.status, 401);
  });

  it('422 — missing contact field', async () => {
    const res = await post('/api/auth/login', { password: PASSWORD });
    assert.equal(res.status, 422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  beforeEach(() => resetMocks());

  it('200 — rotates the refresh token', async () => {
    mockPrisma.refreshToken.findUnique.mock.mockImplementation(async () => REFRESH_ROW);
    mockPrisma.user.findUnique.mock.mockImplementation(async () => BASE_USER);
    mockPrisma.refreshToken.update.mock.mockImplementation(async () => ({ ...REFRESH_ROW, revokedAt: new Date() }));
    mockPrisma.refreshToken.create.mock.mockImplementation(async () => ({ ...REFRESH_ROW, id: 'rt-2' }));

    const res = await post('/api/auth/refresh', { refreshToken: 'some-opaque-token' });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.accessToken);
    assert.ok(res.body.data.refreshToken);
  });

  it('401 — revoked token is rejected', async () => {
    mockPrisma.refreshToken.findUnique.mock.mockImplementation(async () => ({
      ...REFRESH_ROW,
      revokedAt: new Date(),
    }));

    const res = await post('/api/auth/refresh', { refreshToken: 'revoked-token' });
    assert.equal(res.status, 401);
  });

  it('401 — expired token is rejected', async () => {
    mockPrisma.refreshToken.findUnique.mock.mockImplementation(async () => ({
      ...REFRESH_ROW,
      expiresAt: new Date(Date.now() - 1000),
    }));

    const res = await post('/api/auth/refresh', { refreshToken: 'expired-token' });
    assert.equal(res.status, 401);
  });

  it('401 — token not found', async () => {
    mockPrisma.refreshToken.findUnique.mock.mockImplementation(async () => null);

    const res = await post('/api/auth/refresh', { refreshToken: 'nonexistent' });
    assert.equal(res.status, 401);
  });

  it('422 — missing refreshToken field', async () => {
    const res = await post('/api/auth/refresh', {});
    assert.equal(res.status, 422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  beforeEach(() => resetMocks());

  it('200 — revokes the token', async () => {
    mockPrisma.refreshToken.updateMany.mock.mockImplementation(async () => ({ count: 1 }));

    const res = await post('/api/auth/logout', { refreshToken: 'some-token' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('200 — succeeds even with no token in body', async () => {
    const res = await post('/api/auth/logout', {});
    assert.equal(res.status, 200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  beforeEach(() => resetMocks());

  it('200 — returns sanitized user for valid token', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => BASE_USER);

    const res = await get('/api/auth/me', bearerToken('user-1'));

    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 'user-1');
    assert.ok(!('passwordHash' in res.body.data), 'passwordHash must not be exposed');
  });

  it('401 — missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
  });

  it('401 — tampered token', async () => {
    const res = await get('/api/auth/me', 'Bearer invalid.token.here');
    assert.equal(res.status, 401);
  });

  it('404 — user deleted after token issued', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => null);

    const res = await get('/api/auth/me', bearerToken('deleted-user'));
    assert.equal(res.status, 404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('PUT /api/auth/change-password', () => {
  beforeEach(() => resetMocks());

  it('200 — changes password and revokes all tokens', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => BASE_USER);
    mockPrisma.user.update.mock.mockImplementation(async () => BASE_USER);
    mockPrisma.refreshToken.updateMany.mock.mockImplementation(async () => ({ count: 1 }));

    const res = await put(
      '/api/auth/change-password',
      { currentPassword: PASSWORD, newPassword: 'newpassword99' },
      bearerToken('user-1'),
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('401 — wrong current password', async () => {
    mockPrisma.user.findUnique.mock.mockImplementation(async () => BASE_USER);

    const res = await put(
      '/api/auth/change-password',
      { currentPassword: 'wrongpassword', newPassword: 'newpassword99' },
      bearerToken('user-1'),
    );

    assert.equal(res.status, 401);
  });

  it('401 — no auth token', async () => {
    const res = await request(app)
      .put('/api/auth/change-password')
      .send({ currentPassword: PASSWORD, newPassword: 'newpassword99' });
    assert.equal(res.status, 401);
  });

  it('422 — new password too short', async () => {
    const res = await put(
      '/api/auth/change-password',
      { currentPassword: PASSWORD, newPassword: 'short' },
      bearerToken('user-1'),
    );
    assert.equal(res.status, 422);
  });
});
