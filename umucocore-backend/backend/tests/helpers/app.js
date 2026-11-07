/**
 * Builds the Express app with the mocked Prisma injected.
 * Import this (and NOT the real app.js) in integration tests.
 *
 * IMPORTANT: env.js MUST be imported before this file.
 */

import '../../src/config/env.js'; // ensure env is validated

import { mockPrisma } from './mockPrisma.js';

// Inject mock into the global slot that database.js reads from
globalThis.__prisma = mockPrisma;

// Now it's safe to import the app (which imports database.js, which reuses __prisma)
const { default: app } = await import('../../src/app.js');

export default app;
