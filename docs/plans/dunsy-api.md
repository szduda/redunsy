# dunsy-api — LLM brief for the new API repo

This document is the source of truth for scaffolding **dunsy-api**. Do not invent a second product model. Do not couple this repo to the Next.js app’s file tree.

Companion: [`dunsy-next-api-connection.md`](./dunsy-next-api-connection.md) (frontend connection only).

## Identity

| Item | Value |
| --- | --- |
| Git repo name | `dunsy-api` (not `redunsy`, not `redunsy-api`) |
| npm name | `@dunsy/api` |
| Runtime | NestJS + default Express adapter (`@nestjs/platform-express`) |
| Host | Vercel, Fluid Compute / Node.js (second Vercel project, not inside the Next app) |
| Public contract | OpenAPI 3, URL prefix `/v1` |
| Frontend | Existing Next.js app at `re.dunsy.app` (repo remains separate) |

The browser **never** calls this origin. The Next.js server is the only caller (BFF). See *Trust model* below.

## Non-goals (day 1)

- Do not convert anything to an Nx workspace yet. Stay **Nx-importable**.
- Do not implement concrete business endpoints in the first connection slice (health + auth-forward echo is enough to prove the pipe).
- Do not port the existing admin publish Route Handler. That was an allowlisted prototype; user publish is a later feature on this API.
- Do not use in-memory rate limits, in-memory user lists, or `app.listen()` as the production entry.
- Do not add Clerk, Auth0, or password registration.

## Nx compatibility (required from commit 1)

Nx will later `nx import` this repo into `apps/api`. Layout and boundaries must not fight that.

```
dunsy-api/
  package.json          # name: "@dunsy/api", private: true
  tsconfig.json         # strict, bundler/NodeNext as Nest needs; no paths into other repos
  src/                  # all application code lives here
  test/
  vercel.ts             # Vercel project config (TypeScript config, not dashboard-only)
  README.md
```

Rules:

1. **No imports from the Next repo.** No shared folders, no git submodules of `features/` or `db/`.
2. **Contract = HTTP + OpenAPI**, not TypeScript path aliases across repos. A generated client may appear later as `libs/contracts`.
3. Keep a **single Nest application** at `src/`. Do not scatter apps. Feature modules are Nest modules under `src/<feature>/`.
4. `package.json` scripts stay ordinary (`build`, `start`, `test`, `lint`). Nx can wrap them later; do not require `nx` to develop.
5. Prefer **npm** to match the frontend repo until a real monorepo exists.
6. Nest **classes / DI are allowed in this repo**. The Next app’s “no classes” rule does not apply here.
7. Avoid barrel `index.ts` files unless Nest’s module graph truly needs them.

## Product assumptions the API must be ready for

These are not the first PR’s endpoints, but the auth and data model must not contradict them.

- **Sign-in:** Google only (Auth.js / NextAuth on the frontend). No email+password.
- **Nickname:** collected after Google, regex `^[A-Za-z0-9]+$` (length 3–20), unique case-insensitive. Reserved: `admin`, `api`, `u`, `rhythm`, `www`.
- **Publish:** any authenticated user **with a nickname**. Not gated on admin.
- **Admin:** `ADMIN_EMAILS` allowlist (comma-separated, lowercased) remains the only admin gate. Do not store roles in the users table on day 1.
- **Users:** table in the **existing Postgres** (same `POSTGRES_URL` / Neon / Supabase the Next app already uses). Identity key is Google `sub`, not email. Redis is **not** a user directory.
- **Community vs catalogue:** user-published rhythms are not upserted into the official SSG catalogue. Official `/rhythm/[slug]` stays editorial. Community URLs will be `/u/[nickname]/[slug]`.

## Professional API baseline

Treat this as a public-grade HTTP API even though only Next talks to it.

### HTTP and contract

- Prefix all business routes with `/v1`. Breaking changes → `/v2`, do not silently mutate `/v1`.
- `GET /health` — liveness, no auth, no DB.
- `GET /ready` — checks DB (and Redis once rate-limit is on). Used by ops, not browsers.
- OpenAPI generated from Nest (`@nestjs/swagger`), committed or produced in CI. Errors and DTOs match the spec.
- JSON only. Charset UTF-8. No HTML error pages.
- Pagination on every list (`limit` + cursor or `offset`, hard max `limit`).
- Idempotency-Key on mutating POSTs (store in Redis once Redis exists; until then reject missing key on publish-class routes).

### Errors

Stable envelope, no stack traces in production:

```json
{ "error": { "code": "NICKNAME_REQUIRED", "message": "Human-readable", "requestId": "…" } }
```

Map: `400` validation, `401` unauthenticated, `403` authenticated but not allowed (admin / nickname), `404` unknown or hidden foreign draft (do not leak existence with `403`), `409` nickname/slug conflict, `429` rate limit, `500` unexpected.

### Validation and limits

- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.
- Explicit body size cap (notation JSON is small; do not inherit a 100 MB platform default).
- Timeouts on outbound calls. Fail closed.

### Security (OWASP API / healthy defaults)

| Control | Requirement |
| --- | --- |
| AuthN | Trust **only** the BFF: require internal secret (and later the forwarded user claims). Google cookies are not presented to this origin. |
| AuthZ | User id from verified claims, never from JSON body. Admin = email ∈ `ADMIN_EMAILS`. |
| CORS | Closed to browsers in production. See *Trust model*. |
| Rate limit | Vercel WAF on `/v1/*` writes **and** app-level limiter via Upstash Redis (per user id + per IP). Never `express-rate-limit` memory store. |
| Headers | Disable `X-Powered-By`. Helmet-equivalent (CSP not required for JSON API). `X-Request-Id` on every response. |
| Injection | Drizzle parameterized queries only. Treat notation as data, never `eval`. |
| Abuse | WAF + Bot protection on write paths when user publish ships. |
| Secrets | Vercel env only. No secrets in OpenAPI examples or logs. |
| Audit | When publish ships: who published / unpublished / admin-approved, with request id. |

### Observability

- Structured logs: `requestId`, route, status, user id (not email in info logs), duration.
- `/health` stays silent of secrets.
- Do not log access tokens or `Authorization`.

### Vercel / Nest specifics

- Production entry **exports the Express/Nest HTTP adapter** for Vercel Functions. No long-running `listen()` in prod.
- Fluid Compute reuses instances: process memory is **not** a global cache or rate-limit store.
- Egress IPs of the Next.js project are **not stable**. Do **not** IP-allowlist “the frontend”. Authenticate the caller with a shared secret (and optionally Vercel OIDC later).
- Same Postgres as the Next app; new tables only (`users`, later `user_rhythms`). Do not reuse `upsertPublishedRhythm`.

## Trust model and frontend connection

```
Browser  →  https://re.dunsy.app/api/backend/*    (same origin, NextAuth cookie)
Next.js  →  https://<dunsy-api-host>/v1/*         (server-to-server)
```

### Why not CORS-to-browser

NextAuth JWT lives in an **httpOnly** cookie on `re.dunsy.app`. The browser cannot attach it as `Authorization` to another origin. Cookie `Domain=.dunsy.app` across two Vercel projects is fragile (preview URLs, SameSite, CSRF). Direct browser → API is forbidden unless this document is explicitly revised.

### Caller authentication (API side)

Every request except `/health` (and OpenAPI in non-prod) must pass:

1. **`x-dunsy-internal-key`** (or `Authorization: Bearer <DUNSY_API_INTERNAL_KEY>`) matching `DUNSY_API_INTERNAL_KEY`. Constant-time compare. Missing/wrong → `401`.
2. Optional later: Vercel OIDC between the two projects. Do not block day 1 on OIDC.

Do **not** implement “allow these IPs”. Vercel Function IPs change.

### Origin / Host / CORS

Production:

- `cors({ origin: false })` or omit browser CORS entirely — server-to-server has no Origin, or Origin is irrelevant.
- If `Origin` **is** present and equals a browser origin (`https://re.dunsy.app`, `http://localhost:3000`, `https://*.vercel.app` previews), **reject** (`403`) — that means a leaked public call.
- Pin `Host` / public URL via `DUNSY_API_PUBLIC_URL`. Do not trust `Host` for auth.

Preview / local:

- Allow the internal key from the Next dev server (`localhost:3000` → `localhost:3001`).
- Still require the internal key. Never disable it for “dev convenience” in committed config.

### Forwarded user claims (set by Next, verified by API)

Next attaches, after validating the Auth.js session:

| Header | Meaning |
| --- | --- |
| `x-dunsy-internal-key` | Shared secret |
| `x-dunsy-google-sub` | Google subject (stable user id) |
| `x-dunsy-email` | Email for admin allowlist checks |
| `x-dunsy-request-id` | Correlation id |

Unsigned headers are worthless without the internal key. Once the key matches, treat these claims as the user. Do not re-parse the NextAuth cookie on the API (cookie is not sent).

Unsigned alternative to avoid later: Next signs a short-lived JWT with `AUTH_SECRET` / a dedicated `DUNSY_API_JWT_SECRET` and the API verifies the signature. Prefer this as soon as user writes exist; the raw headers + shared secret are acceptable for the connection slice.

### Allowed frontend identities (config, not IP)

| Environment | Browser origin (Next) | API host |
| --- | --- | --- |
| Production | `https://re.dunsy.app` | private Vercel URL or `https://api.dunsy.app` (not called from JS) |
| Preview | `https://<preview>.vercel.app` | matching API preview URL |
| Local | `http://localhost:3000` | `http://localhost:3001` |

Keep these lists in env (`DUNSY_ALLOWED_BROWSER_ORIGINS`) **only** to reject accidental browser `Origin`s, not to authenticate Next.

## Env (API project)

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` | Same database as the Next app |
| `DUNSY_API_INTERNAL_KEY` | BFF shared secret |
| `DUNSY_API_JWT_SECRET` | Optional signed-claims JWT (may equal `AUTH_SECRET` if both projects share it) |
| `ADMIN_EMAILS` | Admin allowlist (same value as Next) |
| `DUNSY_API_PUBLIC_URL` | Canonical API base |
| `DUNSY_ALLOWED_BROWSER_ORIGINS` | Reject list detector for browser Origin |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | Rate limit (when limiter ships) |

## First connection slice (this repo)

1. Nest + Express on Vercel, `GET /health`.
2. Internal-key guard on `GET /v1/connection/whoami` that echoes google sub / email / admin boolean.
3. OpenAPI for those two routes.
4. Closed CORS + Origin reject as above.
5. README: local port `3001`, required env, how Next rewrites to this server.

Do not add publish routes until the Next connection plan is implemented and `whoami` works through the BFF.
