/**
 * A mock Prisma client that lets each test control return values.
 *
 * Usage:
 *   import { mockPrisma, resetMocks } from './helpers/mockPrisma.js';
 *
 *   beforeEach(() => resetMocks());
 *   mockPrisma.user.findUnique.mock.mockImplementation(async () => ({ id: 'u1', ... }));
 */

import { mock } from 'node:test';

// Default implementations — these are restored by resetMocks() after each test.
const DEFAULTS = {
  findUnique:  () => async () => null,
  findFirst:   () => async () => null,
  findMany:    () => async () => [],
  count:       () => async () => 0,
  create:      () => async (args) => ({ id: 'mock-id', ...args?.data }),
  update:      () => async (args) => ({ id: 'mock-id', ...args?.data }),
  updateMany:  () => async () => ({ count: 0 }),
  delete:      () => async () => ({ id: 'mock-id' }),
  deleteMany:  () => async () => ({ count: 0 }),
  upsert:      () => async (args) => ({ id: 'mock-id', ...args?.create }),
};

function makeModelMock() {
  const m = {};
  for (const [method, defFn] of Object.entries(DEFAULTS)) {
    m[method] = mock.fn(defFn());
  }
  return m;
}

export const mockPrisma = {
  user:               makeModelMock(),
  refreshToken:       makeModelMock(),
  story:              makeModelMock(),
  destination:        makeModelMock(),
  event:              makeModelMock(),
  artisan:            makeModelMock(),
  product:            makeModelMock(),
  userFavorite:       makeModelMock(),
  userBookmark:       makeModelMock(),
  userUnlockedStory:  makeModelMock(),
  cartItem:           makeModelMock(),
  order:              makeModelMock(),
  orderLine:          makeModelMock(),
  business:           makeModelMock(),
  businessProduct:    makeModelMock(),
  businessOrder:      makeModelMock(),
  businessPlan:       makeModelMock(),
  learningResource:   makeModelMock(),
  $transaction: mock.fn(async (fn) => fn(mockPrisma)),
};

/**
 * Resets all mocks to their default implementations between tests.
 * Must be called in beforeEach() in every test file.
 */
export function resetMocks() {
  for (const [model, val] of Object.entries(mockPrisma)) {
    if (model === '$transaction') {
      val.mock.resetCalls();
      val.mock.mockImplementation(async (fn) => fn(mockPrisma));
      continue;
    }
    if (val && typeof val === 'object') {
      for (const [method, fn] of Object.entries(val)) {
        if (fn && typeof fn.mock?.resetCalls === 'function') {
          fn.mock.resetCalls();
          // Restore the original default implementation
          if (DEFAULTS[method]) {
            fn.mock.mockImplementation(DEFAULTS[method]());
          }
        }
      }
    }
  }
}
