# Redunsy

West African drum rhythm player and editor. Browse a catalogue of djembe, dundun, and bell patterns, play them with swing and metronome, fork public rhythms into your own collection, and compose new ones — all in the browser.

Live at [re.dunsy.app](https://re.dunsy.app).

## Tech stack

| Layer        | Choices                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript                                            |
| Styling      | Tailwind CSS 4, custom theme primitives in `features/theme/`                                                   |
| Client state | [Zustand](https://zustand.docs.pmnd.rs) per feature; [TanStack Query](https://tanstack.com/query) for async UI |
| Database     | [PostgreSQL](https://www.postgresql.org) via [Drizzle ORM](https://orm.drizzle.team) + `postgres` driver       |
| Audio engine | Custom **midinike** library (`lib/midinike/`) — notation parsing, groove compilation, WebAudio playback        |
| Search       | [Fuse.js](https://fusejs.io) over a live Blob-backed index (zero DB on user sessions)                          |
| Testing      | [Vitest](https://vitest.dev) (unit + playback invariants)                                                      |
| Deployment   | [Vercel](https://vercel.com)                                                                                   |

## Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│  app/                     Next.js routes (mostly static)        │
│  ├── page, garage, player, editor, help, contact               │
│  └── rhythm/[slug]        pre-rendered from Postgres at build   │
├─────────────────────────────────────────────────────────────────┤
│  features/<name>/         Feature modules (UI + stores + hooks)│
│  ├── groovy-player        Playback UI, transport, settings    │
│  ├── editor               Canvas notation editor                │
│  ├── garage               Browse UI over search-index feature │
│  ├── search-index         Live catalogue index (Blob + client)│
│  ├── rhythm               Shared types and localStorage catalog │
│  ├── store/               Cross-cutting Zustand stores          │
│  └── theme/, layout/, icons/  Shared UI primitives              │
├─────────────────────────────────────────────────────────────────┤
│  lib/midinike/            Audio/notation engine (framework-free)│
│  db/                      Drizzle schema, server-only queries   │
└─────────────────────────────────────────────────────────────────┘
```

The codebase follows **functional programming** conventions: no classes, feature-colocated stores, and imports from concrete module paths (no barrel `index` files in features).

### Data model

Published rhythms live in **Postgres** (`db/schema.ts`). Each row stores metadata plus instrument patterns as JSONB. At **build time**, the catalogue is read once to pre-render static `/rhythm/[slug]` player pages (`dynamicParams` allows new slugs without redeploy).

The **garage search index** is a separate live artifact owned by `features/search-index/`: admin actions rebuild a versioned JSON file on **Vercel Blob**; user sessions fetch it once (plus localStorage bootstrap) and never touch Postgres.

**User-owned rhythms** (created, forked, or edited) are stored in **localStorage** and resolved client-side. The editor and `/player?rhythm=<slug>` route work entirely in the browser for private collections.

### Midinike (playback engine)

`lib/midinike/` is the core audio stack, independent of React:

- **Notation** — parses bar strings (`t`, `b`, `s`, triplets `[…]`, swing groups `{…}`) into timed cell hits.
- **Groove** — compiles bars against a swing pattern to produce beat matrices for playback.
- **Audio** — WebAudioFont-based drum samples with per-track volume and metronome.

The groovy player and editor both depend on midinike; playback timing invariants are guarded by `npm run test:playback`.

### Feature modules

| Feature           | Route(s)                    | Responsibility                                           |
| ----------------- | --------------------------- | -------------------------------------------------------- |
| **Groovy player** | `/rhythm/[slug]`, `/player` | Multi-track playback, tempo, swing, metronome, wake lock |
| **Garage**        | `/garage`                   | Browse UI; search/filter via `features/search-index/`    |
| **Editor**        | `/editor`, `/editor/[slug]` | Visual bar editor, metadata, fork/save to localStorage   |
| **Help**          | `/help`                     | Notation reference and interactive demos                 |

## Project layout

```
app/                  Routes and global styles
db/                   Drizzle schema, mappers, server-only queries
drizzle/              SQL migrations
features/             Feature modules (stores, hooks, components)
lib/midinike/         Notation parser, groove compiler, audio player
scripts/              Build-time index generation, DB seeding
```

## Core dependencies

**Runtime**

| Package                      | Role                               |
| ---------------------------- | ---------------------------------- |
| `next`, `react`, `react-dom` | App framework and UI               |
| `drizzle-orm`, `postgres`    | Database access                    |
| `zustand`                    | Client state management            |
| `@tanstack/react-query`      | Async data and query caching       |
| `fuse.js`                    | Fuzzy search over the rhythm index |
| `@vercel/blob`               | Durable live search-index artifact |
| `tailwind-merge`             | Conditional class merging          |

**Development**

| Package                               | Role                                      |
| ------------------------------------- | ----------------------------------------- |
| `typescript`, `eslint`, `prettier`    | Type-checking and linting                 |
| `vitest`                              | Unit and playback tests                   |
| `drizzle-kit`                         | Schema migrations                         |
| `tsx`                                 | Script runner (index generation, seeding) |
| `tailwindcss`, `@tailwindcss/postcss` | CSS framework                             |

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL (for local DB work and fresh search-index builds)

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server works without a database — the committed search index and static rhythm pages are used as fallbacks.

### Environment variables

Create `.env.local` (or pull from Vercel with `vercel env pull`):

| Variable                         | Required for             | Purpose                                          |
| -------------------------------- | ------------------------ | ------------------------------------------------ |
| `POSTGRES_URL` or `DATABASE_URL` | Build, DB scripts, admin | Postgres connection string                       |
| `BLOB_READ_WRITE_TOKEN`          | Production index writes  | Vercel Blob token for live search-index rebuilds |

### Database

```bash
npm run db:push        # Push schema to local Postgres
npm run db:migrate     # Run migrations
npm run db:seed        # Seed rhythms from migration scripts
npm run search-index   # Refresh committed seed JSON from Postgres (optional fallback)
```

`npm run build` runs `prebuild` automatically, which refreshes the seed JSON when a connection string is available. Live catalogue updates use Blob rebuilds, not redeploys.

### Scripts

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start development server                      |
| `npm run build`         | Production build (refreshes seed index first) |
| `npm run start`         | Serve production build                        |
| `npm run lint`          | ESLint                                        |
| `npm run test`          | Run all Vitest suites                         |
| `npm run test:playback` | Playback timing and groove-length invariants  |
| `npm run format`        | Prettier write                                |

### Garage search index (live)

Garage browse/search is owned by [`features/search-index/`](features/search-index/). User sessions do **not** read Postgres for catalogue cards.

**Read path (users):**

1. Bootstrap from `localStorage` when present (repeat visits).
2. Otherwise load the committed seed JSON as a separate chunk.
3. Passively fetch `GET /api/search-index` once per session (Blob latest, seed fallback).
4. Search, filters, and pagination run in the browser (Fuse.js).

**Write path (admin only):**

1. Publish / soft-unpublish / manual rebuild calls `rebuildSearchIndex()`.
2. That reads published cards from Postgres and writes versioned JSON to Vercel Blob.
3. Clients pick up the new version on their next passive fetch (admin UI refreshes immediately from rebuild `cards`). Passive CDN cache is ~60s + 300s stale-while-revalidate; admins never depend on that path for their own session.

**Soft unpublish:** `DELETE /api/admin/rhythms/[slug]` sets `published = false` and rebuilds the index. Delete UI for editors is tracked in #28.

**Cost profile (expected scale):**

| Event              | DB reads (garage) | API calls (garage) | Notes                                      |
| ------------------ | ----------------- | ------------------ | ------------------------------------------ |
| New user session   | 0                 | 1                  | Cached JSON fetch; localStorage on repeats |
| Search/filter/page | 0                 | 0                  | Client CPU only                            |
| One publish        | 1 catalogue read  | 0 (user)           | Admin upsert + Blob write                  |

Current catalogue is ~50 rhythms; under 1,000 should stay comfortably within Vercel Pro.

## Deployment

Deployed on Vercel. Static rhythm pages are produced at build time (`dynamicParams` covers newly published slugs). The garage search index is served from Blob and refreshed by admin actions without a full redeploy.
