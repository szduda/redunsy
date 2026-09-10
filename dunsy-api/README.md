# dunsy-api

> Parked inside the Redunsy git tree until `szduda/dunsy-api` exists. See [EXTRACT.md](./EXTRACT.md). Treat this folder as its own repository: `cd dunsy-api && npm install`.

NestJS + Express HTTP API for Dunsy. This origin is **server-to-server only**: the Next.js app at `re.dunsy.app` is the BFF. Browsers must call `/api/backend/*` on the frontend, never this host.

Package name: `@dunsy/api`. Layout is Nx-importable (`src/` is the app; no imports from the Next.js repo). Do not introduce Nx until a shared `libs/contracts` package exists.

## Connection slice (this version)

| Method | Path                    | Auth                                                     |
| ------ | ----------------------- | -------------------------------------------------------- |
| `GET`  | `/health`               | none (liveness, no DB)                                   |
| `GET`  | `/ready`                | internal key (pings Postgres when `POSTGRES_URL` is set) |
| `GET`  | `/v1/connection/whoami` | internal key; echoes BFF identity headers                |
| `GET`  | `/docs`, `/docs-json`   | none in non-production; disabled in production           |

There are no publish or user-profile routes yet.

## Trust model

```
Browser  →  https://re.dunsy.app/api/backend/v1/...     (Auth.js cookie, same origin)
Next.js  →  http://localhost:3001/v1/...               (this API)
```

- Require `x-dunsy-internal-key` or `Authorization: Bearer <DUNSY_API_INTERNAL_KEY>` on every route except `/health` (and OpenAPI in non-prod).
- Do **not** IP-allowlist Vercel. Function egress IPs are not stable.
- If `Origin` is a frontend origin (`https://re.dunsy.app`, `http://localhost:3000`, or `*.vercel.app`), respond `403 BROWSER_ORIGIN_FORBIDDEN`. Next server `fetch` must not send `Origin`.
- CORS is closed (`cors: false`). No `Access-Control-Allow-Origin`.
- Forwarded claims (trusted only after the internal key matches):

| Header                 | Meaning                                          |
| ---------------------- | ------------------------------------------------ |
| `x-dunsy-internal-key` | Shared secret                                    |
| `x-dunsy-google-sub`   | Google subject                                   |
| `x-dunsy-email`        | Email (`ADMIN_EMAILS` → `admin: true`)           |
| `x-dunsy-request-id`   | Correlation id (also accepted as `x-request-id`) |

## Local

```bash
cp .env.example .env
# set DUNSY_API_INTERNAL_KEY to a long random string
npm install
npm run dev
```

Listens on **port 3001** (`PORT` overrides). Point the Next.js app at `DUNSY_API_URL=http://localhost:3001` with the same internal key.

```bash
npm test
npm run lint
npm run format:check
curl -s http://localhost:3001/health
curl -s -H "x-dunsy-internal-key: $DUNSY_API_INTERNAL_KEY" http://localhost:3001/v1/connection/whoami
```

OpenAPI: `http://localhost:3001/docs` (non-production). Regenerate the committed spec with `npm run openapi`.

## Vercel

`src/main.ts` is the Nest entry (`bootstrap` + `listen`). After extract, rename `vercel.ts.example` to `vercel.ts` (`framework: 'nestjs'`). Do not add `api/` Route Handlers or rewrites that bypass Nest.

While this folder is parked inside Redunsy, the parent `.vercelignore` excludes it so the Next.js project does not treat it as a second Vercel app.

Set the same env vars on the API project as in `.env.example`. Mirror `DUNSY_API_INTERNAL_KEY` and `ADMIN_EMAILS` onto the Next.js project.

## Product constraints (later features)

- Google sign-in only (Auth.js on the frontend). Nickname `^[A-Za-z0-9]+$` after login. Publish for any user with a nickname.
- Admin remains `ADMIN_EMAILS`. Users live in the existing Postgres (`google_sub` is the identity key). Redis is not a user directory.
- Official catalogue stays editorial; community rhythms will not upsert into the SSG table.
