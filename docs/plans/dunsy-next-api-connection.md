# Dunsy (Next.js) — LLM brief for connecting to dunsy-api

This document is the source of truth for **connection and config only** in the existing Next.js repo. No business endpoints, nickname form, or publish UI in this slice.

Companion: [`dunsy-api.md`](./dunsy-api.md) (new API repo).

## Decision: proxy through Next.js, do not call the API from the browser

**Requests go Browser → Next.js → dunsy-api, never Browser → dunsy-api.**

Do **not** use `fetch(process.env.NEXT_PUBLIC_API_URL)` in client components. Do **not** open CORS on the API for `re.dunsy.app`.

### Why proxy (BFF)

1. **Auth.js / NextAuth session is an httpOnly cookie** on `re.dunsy.app`. JavaScript cannot read it to send `Authorization` to another origin.
2. Two Vercel projects do not share cookies unless we set `Domain=.dunsy.app` and fight preview URLs, SameSite, and CSRF. That is a worse design than a same-origin BFF.
3. **Vercel Function egress IPs are not stable.** The API cannot allowlist “the Next app’s IP”. A shared secret on server-to-server calls is the actual control.
4. The API origin stays off the public JS bundle (no `NEXT_PUBLIC_` API host required).

### Why not one Route Handler per endpoint

Do **not** add `app/api/users/route.ts`, `app/api/rhythms/route.ts`, … as a manual copy of the Nest router.

Use **one generic proxy** plus a rewrite prefix:

| Layer | Role |
| --- | --- |
| Browser | `fetch('/api/backend/v1/...')` — same origin, cookies sent automatically |
| Next rewrite **or** a single catch-all Route Handler | Strip `/api/backend`, attach internal key + user claims, forward to `DUNSY_API_URL` |
| dunsy-api | Verifies internal key; serves `/v1/...` |

**Prefer a catch-all Route Handler** (`app/api/backend/[...path]/route.ts`) over a bare `next.config` rewrite:

- Rewrites alone cannot add `x-dunsy-internal-key` or session claims.
- A rewrite would forward the user’s NextAuth cookie to a third origin (unnecessary and wrong).
- The catch-all is still **one** module, not per-endpoint handlers.

`next.config.ts` rewrites are optional (e.g. docs or health). They are not sufficient for authenticated proxying.

## Non-goals (this slice)

- No nickname onboarding UI.
- No user publish UI and no removal of the admin publish prototype yet.
- No change to Google as the only IdP (already the case).
- Do not relax `ADMIN_EMAILS` in `auth.ts` in this slice unless required to test `whoami` as a non-admin — that product change belongs with user login work. The **proxy** must forward whatever session exists; it must not implement a second allowlist.

## Config to add

### Environment (Next.js project)

| Variable | Public? | Purpose |
| --- | --- | --- |
| `DUNSY_API_URL` | **No** | Server-only base, e.g. `http://localhost:3001` or the API’s Vercel URL. No trailing slash. |
| `DUNSY_API_INTERNAL_KEY` | **No** | Same value as on the API project. |
| Existing `AUTH_SECRET` / `NEXTAUTH_SECRET` | **No** | Session; optionally used to sign a short-lived JWT for the API. |
| Existing `ADMIN_EMAILS` | **No** | Unchanged; admin UI/API in Next still uses it. Copied to the API project separately. |

Never expose `DUNSY_API_URL` or the internal key as `NEXT_PUBLIC_*`.

Local: `.env.local` (gitignored). Production/preview: Vercel env on the **frontend** project, mirrored key on the **API** project.

### Allowed identities (documentation for operators)

| Environment | This app | API `DUNSY_API_URL` |
| --- | --- | --- |
| Local | `http://localhost:3000` | `http://localhost:3001` |
| Production | `https://re.dunsy.app` | Private API deployment URL (or `https://api.dunsy.app`) |
| Preview | `https://<this-preview>.vercel.app` | Matching API preview URL |

No IP allowlists. Do not document NAT IPs as a security control.

## Catch-all proxy behaviour

Path: `app/api/backend/[...path]/route.ts` (or equivalent App Router catch-all). Implement all methods used later (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`).

1. Build target `DUNSY_API_URL + '/' + path` (path already includes `v1/...`). Reject path segments that contain `..` or a full URL.
2. Copy safe hop-by-hop-stripped headers; **do not** forward `cookie` to the API.
3. Set `x-dunsy-internal-key` from env.
4. Set `x-dunsy-request-id` (incoming `x-request-id` or a new UUID).
5. If a session exists (`getServerSession` / Auth.js `auth()`): set `x-dunsy-google-sub` and `x-dunsy-email`. If later a signed JWT is used, send `Authorization: Bearer <jwt>` instead of raw identity headers.
6. If no session: still forward the request **without** user headers (public `GET`s). Do not 401 at the proxy unless the slice explicitly wants “all /api/backend requires login”. Default: **API decides** 401/403.
7. Forward body for methods that have one; cap size consistently with the API.
8. Return the API status, content-type, and body. Map network failure to `502` with the standard error envelope, no upstream stack.
9. `OPTIONS`: 204, no upstream call (browser talks same-origin; this is belt-and-suspenders).

Keep the file small. No per-route business logic.

### Client helper (connection slice)

One server-safe helper, e.g. `lib/dunsy-api.ts`:

- Browser code calls **relative** `/api/backend/v1/...` (via TanStack Query later).
- Server Components / Route Handlers that need the API also go through this helper (absolute URL to self or direct `DUNSY_API_URL` + internal key — pick **one** and document it in the helper). Prefer calling `DUNSY_API_URL` directly from the server helper to avoid a self-HTTP loop.

Do not scatter raw `fetch` to the API.

## CORS / origin on the Next side

The browser origin is this Next app. Same-origin `/api/backend` means **no CORS preflight** for the API. Do not add `Access-Control-Allow-Origin: *` on the catch-all.

CSRF: existing Auth.js cookie `SameSite=Lax` stays. Mutating calls are same-origin. Do not enable credentialed cross-origin calls to dunsy-api.

## Trust checklist (must match the API brief)

- [ ] Internal key present on every upstream request except when we explicitly call `/health` without it (optional).
- [ ] Cookie header not forwarded upstream.
- [ ] No `NEXT_PUBLIC_API_URL`.
- [ ] Preview and prod each point `DUNSY_API_URL` at the matching API deployment.
- [ ] `whoami` through `/api/backend/v1/connection/whoami` returns the Google sub/email when logged in, and unauthenticated when logged out.

## Connection slice in this repo (checklist)

1. Env vars documented in README (table row for `DUNSY_API_URL` / `DUNSY_API_INTERNAL_KEY`).
2. Catch-all proxy Route Handler + tests (path traversal rejected; cookie not forwarded; key set; 502 on downed API).
3. Thin `lib/dunsy-api.ts` helper.
4. No `next.config` rewrite that bypasses the proxy for `/api/backend`.
5. Do not implement `/v1/rhythms` or nickname routes here.

## Later (out of scope, do not do in the connection PR)

- Open Google sign-in to non-admin users; nickname form; publish for every logged-in user.
- Point garage/community at the API.
- Delete or replace `app/api/admin/rhythms`.
- Nx import of both repos.

When those ship, they **reuse** `/api/backend` and `lib/dunsy-api.ts`. They must not open a second, direct browser channel.
