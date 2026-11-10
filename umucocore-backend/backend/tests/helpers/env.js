/**
 * Inject required env vars before any app module is imported.
 * Must be the very first import in every test file.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-secret-must-be-at-least-32-chars-long';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_TTL_DAYS = '7';
process.env.REFRESH_TOKEN_TTL_DAYS_REMEMBER = '30';
process.env.PORT = '0';
