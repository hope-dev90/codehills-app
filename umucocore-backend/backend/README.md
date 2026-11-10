# UmucoCore Backend (foundation)

Express + Prisma + Supabase PostgreSQL. ES Modules.

## Status
Done: app skeleton, env validation, security middleware (Helmet, rate limit), error/response format, JWT authenticate/authorize, Supabase + Google config, contact normalization and token hashing utilities.

Pending (needs the 19-table schema): `prisma/schema.prisma`, migrations, seed, auth/users and all other modules.

## Setup
1. `npm install`
2. `cp .env.example .env` and fill in your Supabase / Google / Gemini values
3. `npm run dev` then open `GET /api/health`

## Migrations (once schema.prisma exists)
- Development: `npx prisma migrate dev --name init`
- Production: `npm run prisma:deploy`
- Seed: `npm run seed`
- `DATABASE_URL` = pooled (port 6543), `DIRECT_URL` = direct (port 5432, used for migrations)
