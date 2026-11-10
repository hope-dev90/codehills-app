import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// Single shared client. DATABASE_URL (pooled, port 6543) is used at runtime;
// DIRECT_URL (port 5432) is used by `prisma migrate` via schema.prisma.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({ log: env.isProd ? ['error'] : ['warn', 'error'] });

if (!env.isProd) globalForPrisma.__prisma = prisma;
