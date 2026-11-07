# CodeHills Admin Dashboard

A standalone admin web dashboard for the CodeHills / UmucoCore platform. It is a
Vite + React 18 + TypeScript single-page app with plain hand-written CSS (no UI
framework) that talks to the live UmucoCore REST API.

## Requirements

- Node.js 18+ and npm
- The UmucoCore backend running and reachable (default `http://localhost:4000`)

## Setup

```bash
cd admin-dashboard
npm install
```

## Configuration

The API base URL is read from `VITE_API_URL`. A committed `.env` file provides the
default:

```
VITE_API_URL=http://localhost:4000/api
```

Change it (or create `.env.local`) to point at a different backend.

## Run (development)

```bash
npm run dev
```

The dev server starts on port 5173: http://localhost:5173

## Type-check and build

```bash
npx tsc --noEmit   # type-check only
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
```

## Authentication

Sign in with an account whose `role` is `admin`. Non-admin accounts are rejected on
the login screen and no tokens are stored.

- Access and refresh tokens are stored in `localStorage` under `codehills.admin.tokens`.
- Every admin request sends `Authorization: Bearer <accessToken>`.
- On a `401`, the client refreshes once via `POST /auth/refresh` and retries the
  original request; if the refresh fails, tokens are cleared and you are returned to
  the login screen.

## Features

- Overview: KPI cards for users, orders, revenue and content counts, plus recent
  users and recent orders tables.
- Users: search, role and active filters, pagination, and per-row actions to toggle
  active status and role.
- Orders: status filter chips, paginated table with an expandable row showing order
  lines, and inline dropdowns to change status and payment status.
- Content collections: Stories, Destinations, Events, Products, Artisans, Businesses
  and Learning each have a searchable, paginated table with an edit drawer, create
  form, delete confirmation and (where applicable) a publish/active toggle.

## Project structure

```
admin-dashboard/
  index.html
  vite.config.ts
  tsconfig.json
  .env
  src/
    main.tsx
    App.tsx
    api/
      client.ts        # fetch wrapper, token storage, 401 refresh
      types.ts         # API payload types
      endpoints.ts     # one function per endpoint
    auth/AuthContext.tsx
    components/        # Layout, Sidebar, Topbar, DataTable, Badge, Button, ...
    hooks/useAsync.ts
    pages/             # Login, Overview, Users, Orders + 7 collection pages
    styles/            # theme.css (CSS variables) + app.css
    utils/format.ts
```
