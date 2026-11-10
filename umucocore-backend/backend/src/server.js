import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

const server = app.listen(env.PORT, () => {
  console.log(`UmucoCore API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

// Warm the database connection at boot so the first user request doesn't pay
// the DNS + TCP + TLS cold-start cost of reaching the hosted Postgres.
prisma.$queryRaw`SELECT 1`
  .then(() => console.log('Database connection ready'))
  .catch((err) => console.warn('Database warm-up failed:', err.message));

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
