# Redunsy

West African drum rhythm player and editor. Browse a catalogue of djembe, dundun, and bell patterns, play them with swing and metronome, fork public rhythms into your own collection, and compose new ones — all in the browser.

Live at [re.dunsy.app](https://re.dunsy.app).

## Tech stack

| Layer | Choices |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, custom theme primitives in `features/theme/` |
| Client state | [Zustand](https://zustand.docs.pmnd.rs) per feature; [TanStack Query](https://tanstack.com/query) for async UI |
| Database | [PostgreSQL](https://www.postgresql.org) via [Drizzle ORM](https://orm.drizzle.team) + `postgres` driver |
| Audio engine | Custom **midinike** library (`lib/midinike/`) — notation parsing, groove compilation, WebAudio playback |
| Search | [Fuse.js](https://fusejs.io) over a build-time JSON index |
| Testing | [Vitest](https://vitest.dev) (unit + playback invariants) |
| Deployment | [Vercel](https://vercel.com) |

## Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│  app/                     Next.js routes (mostly static)        │
│  ├── page, garage, player, editor, help, contact               │
│  ├── rhythm/[slug]        pre-rendered from Postgres at build   │
│  └── api/slack            Slack webhook → Cursor agent bot      │
├─────────────────────────────────────────────────────────────────┤
│  features/<name>/         Feature modules (UI + stores + hooks)│
│  ├── groovy-player        Playback UI, transport, settings    │
│  ├── editor               Canvas notation editor                │
│  ├── garage               Search, filters, pagination           │
│  ├── rhythm               Shared types and localStorage catalog │
│  ├── agent-bot            Slack + GitHub + Cursor agent flow    │
│  ├── store/               Cross-cutting Zustand stores          │
│  └── theme/, layout/, icons/  Shared UI primitives              │
├─────────────────────────────────────────────────────────────────┤
│  lib/midinike/            Audio/notation engine (framework-free)│
│  db/                      Drizzle schema, server-only queries   │
└─────────────────────────────────────────────────────────────────┘
```

The codebase follows **functional programming** conventions: no classes, feature-colocated stores, and imports from concrete module paths (no barrel `index` files in features).

### Data model

Published rhythms live in **Postgres** (`db/schema.ts`). Each row stores metadata plus instrument patterns as JSONB. At **build time**, the catalogue is read once to:

1. Pre-render static `/rhythm/[slug]` player pages.
2. Generate `features/garage/rhythm-index.generated.json` for client-side search (no runtime DB access in the browser).

**User-owned rhythms** (created, forked, or edited) are stored in **localStorage** and resolved client-side. The editor and `/player?rhythm=<slug>` route work entirely in the browser for private collections.

### Midinike (playback engine)

`lib/midinike/` is the core audio stack, independent of React:

- **Notation** — parses bar strings (`t`, `b`, `s`, triplets `[…]`, swing groups `{…}`) into timed cell hits.
- **Groove** — compiles bars against a swing pattern to produce beat matrices for playback.
- **Audio** — WebAudioFont-based drum samples with per-track volume and metronome.

The groovy player and editor both depend on midinike; playback timing invariants are guarded by `npm run test:playback`.

### Feature modules

| Feature | Route(s) | Responsibility |
| --- | --- | --- |
| **Groovy player** | `/rhythm/[slug]`, `/player` | Multi-track playback, tempo, swing, metronome, wake lock |
| **Garage** | `/garage` | Fuse.js search, faceted filters, pagination over the static index |
| **Editor** | `/editor`, `/editor/[slug]` | Visual bar editor, metadata, fork/save to localStorage |
| **Help** | `/help` | Notation reference and interactive demos |
| **Agent bot** | `POST /api/slack` | Slack bot that spawns Cursor cloud agents on GitHub branches |

### Agent bot (optional)

The Slack integration (`features/agent-bot/`) uses the [Chat SDK](https://github.com/vercel/chat) with Postgres-backed state. Incoming messages create a GitHub branch, run a [Cursor cloud agent](https://cursor.com), and reply with a Vercel preview URL. This path is only active when the required secrets are configured in production.

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

| Package | Role |
| --- | --- |
| `next`, `react`, `react-dom` | App framework and UI |
| `drizzle-orm`, `postgres` | Database access |
| `zustand` | Client state management |
| `@tanstack/react-query` | Async data and query caching |
| `fuse.js` | Fuzzy search over the rhythm index |
| `tailwind-merge` | Conditional class merging |
| `chat`, `@chat-adapter/slack`, `@chat-adapter/state-pg` | Slack bot adapter |
| `@cursor/sdk`, `@octokit/rest` | Cursor agents and GitHub branch creation |

**Development**

| Package | Role |
| --- | --- |
| `typescript`, `eslint`, `prettier` | Type-checking and linting |
| `vitest` | Unit and playback tests |
| `drizzle-kit` | Schema migrations |
| `tsx` | Script runner (index generation, seeding) |
| `tailwindcss`, `@tailwindcss/postcss` | CSS framework |

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

| Variable | Required for | Purpose |
| --- | --- | --- |
| `POSTGRES_URL` or `DATABASE_URL` | Build, DB scripts, agent bot | Postgres connection string |
| `CURSOR_API_KEY` | Agent bot | Cursor cloud agent API |
| `GITHUB_TOKEN` | Agent bot | Branch creation in the repo |
| `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` | Agent bot | Target repository (defaults: `szduda/redunsy`) |
| Slack signing secrets | Agent bot | Configured via Chat SDK / Vercel integration |

### Database

```bash
npm run db:push        # Push schema to local Postgres
npm run db:migrate     # Run migrations
npm run db:seed        # Seed rhythms from migration scripts
npm run search-index   # Regenerate garage search JSON from Postgres
```

`npm run build` runs `prebuild` automatically, which regenerates the search index when a connection string is available.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build (regenerates search index first) |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run test` | Run all Vitest suites |
| `npm run test:playback` | Playback timing and groove-length invariants |
| `npm run format` | Prettier write |

## Deployment

Deployed on Vercel. Static rhythm pages and the garage search index are produced at build time; the Slack webhook runs as a serverless function with `maxDuration = 300`.
