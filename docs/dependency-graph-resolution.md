# Dependency graph — resolution plan

Decisions from import analysis. A finding **stays** only when the coupling is the intended product shape. Everything else is a small, concrete move — no barrels, no mega-folders.

Current snapshot: **3 file cycles**, **7 layer jumps**, **6 “other hubs”**. Shared kernels (`theme`, `icons`, `layout`, …) are not issues.

---

## 1. Cycles — all three are real; all three are cheap

### 1.1 `garage-filters.store` ↔ `garage-filters-url-storage` — **remove**

Zustand persist: the store constructs storage with `createJSONStorage(() => garageFiltersUrlStorage)`, and the storage adapter imports `sanitizeGarageFilters` from the store.

`sanitizeGarageFilters` / `pruneFiltersForOwnership` are pure. Move them to `features/garage/garage-filters-sanitize.ts`. Store and URL storage both import that module. No behavior change.

### 1.2 `canvas/renderers.ts` ↔ `canvas/drum-font.ts` — **remove**

`renderers` imports `font` from `drum-font`. `drum-font` imports `colors` from `renderers`, but `colors` is only `export const colors = darkCanvasColors`.

Change `drum-font` to import `darkCanvasColors` from `canvas-colors.ts` (already the source of truth). One import line.

### 1.3 `search.store` → `search-url-storage` → `app-query-state` → `search.store` — **remove**

The back-edge is `SEARCH_QUERY_PARAM` living on the store file. Move the constant to `app-query-state.ts` (it already owns the other query keys). Store and URL reader both import the constant. No behavior change.

---

## 2. Layer jumps — four are type/config, three are real

Intended layers: `app` (routes) → `features` (UI) → `lib` (engine) / `db` (persistence). Domain types live in `features/rhythm` because the catalogue is a product concept, not a SQL concept.

### 2.1 `db/*` → `features/rhythm/rhythm.types` (5 edges) — **keep, narrow the rule**

`schema.ts`, `mappers.ts`, `queries.ts`, `admin-rhythms.ts` import **types only** (`RhythmPattern`, `RhythmCard`, `Rhythm`). Persistence mapping a domain type is normal. Moving types into `db/` would force the whole UI to import the database layer.

**Do:** keep types in `features/rhythm/rhythm.types.ts`. Change the cruiser rule so `db-not-to-features` allows `dependencyTypes: ['type-only']` to `features/rhythm/rhythm.types.ts` (or drop those five from the warn list). Do **not** move the types.

### 2.2 `db/admin-rhythms.ts` → `features/admin/rhythm-to-row.ts` — **remove**

This is a **runtime** mapper, not a type import. `rhythm-to-row.ts` converts a `Rhythm` into a published row; only `db/admin-rhythms.ts` uses it in production (`admin.test.ts` in tests).

**Do:** move it to `db/rhythm-to-row.ts`. Admin UI keeps talking to `db/admin-rhythms`, not to a feature-level mapper.

### 2.3 `lib/auth-session.ts` → `auth.ts` — **keep, reclassify `auth.ts`**

`auth.ts` is NextAuth options at repo root, not an `app/` route. The graph buckets it with `app` because it is outside `lib/`/`features/`. `lib/auth-session` _should_ read auth options.

**Do not** move NextAuth config into `features`. Either:

- treat `auth.ts` as lib/infra in the cruiser config (`lib` may import `^auth\\.ts$`), or
- rename/move to `lib/auth-options.ts` and keep `app/api/auth/[...nextauth]/route.ts` importing that.

Prefer **reclassify in the graph** unless a rename is already convenient. Justified: auth config is infrastructure, not a route.

### 2.4 `lib/auth-session.ts` → `features/admin/admin-emails.ts` — **remove**

`isAdminEmail` / `parseAdminEmails` are pure string helpers with no UI. `auth.ts` and `lib/auth-session` both need them.

**Do:** move to `lib/admin-emails.ts`. `features/admin` imports from `lib`. That also drops one of admin’s surprising inbound edges.

---

## 3. Other hubs — keep the product ones, cut the leaks

Inbound here is **collapsed folders**. Many arrows are “this feature is used from several product surfaces”, not a god-module.

| Hub             | In / out | Verdict                                                                                                                                                                                        |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `groovy-player` | 11 / 8   | **Keep as a hub.** Core, app-wide player. See leaks below.                                                                                                                                     |
| `admin`         | 5 / 4    | **Keep the UI hub; move the two lib/db helpers** (2.2, 2.4). Leftover ins: editor `PublishGate`, `app/` routes. That’s the admin feature.                                                      |
| `garage`        | 4 / 6    | **Keep.** Editor rhythm picker reuses `GarageResults`; homepage uses `search-suggestions`; URL sync lives in `features/shared`. Catalogue search is a product surface, not an accidental star. |
| `share-rhythm`  | 4 / 5    | **Keep.** Player, editor, share route, and `SHARED_WITH_ME_TAG` in rhythm metadata. Cross-cutting product feature.                                                                             |
| `editor`        | 3 / 13   | **Keep the feature; remove 2 leaked ins** (help + share-rhythm). After that, inbound is essentially `app/editor`. High outbound is the editor composing player/canvas — expected.              |
| `contact`       | 3 / 3    | **Keep.** `ContactInfo` in the nav and on help is deliberate reuse. Three ins is the graph threshold, not a smell.                                                                             |

### 3.1 Groovy-player leaks (hub stays; these ins are not “the player”)

These are generic pieces parked in the player folder:

| Leak                                                                                                                                         | Importers                                                                             | Move to                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `popover.tsx` + `popover-position.ts`                                                                                                        | layout mobile nav, garage pagination, admin publish, editor tabs/hints, player itself | `features/theme/popover.tsx` (it’s a primitive, already uses `cn` + focus trap)                                                     |
| Swing helpers on `player.store` (`normalizeSwingPatternForMeter`, `defaultSwingPatternForMeter`, `DEFAULT_TEMPO`, `swingBarSizeForMeter`, …) | `rhythm-helpers`, `my-rhythms-storage`, editor metadata, share-rhythm validate        | `features/rhythm/swing-pattern.ts` or `lib/midinike/groove/` — they are domain/groove rules, not React state                        |
| `instrumentSounds()` via editor                                                                                                              | `share-rhythm/pattern-chars`                                                          | next to `drum-font` (e.g. `groovy-player/canvas/instrument-sounds.ts` or `lib/midinike`) so share-rhythm does not import **editor** |
| `canvas-colors` used by `icons/bar-index-icon`                                                                                               | one icon                                                                              | hardcode the fill or a theme token; icons must not import the player                                                                |

After those moves, groovy-player inbound is “routes + editor + help demos + learn swing input” — which **is** the core feature. Mark it as a justified kernel in `graph-hubs.mts` so it no longer sits next to cycles/jumps as an “other hub”.

### 3.2 Editor leaks

- `help/help-topic-row` → `editor/note-glyph-icon`: notation glyph UI. Move `NoteGlyphIcon` next to `drum-font` / player canvas (help and editor both render the same glyphs).
- `help/demo-bar` → `editor/canvas/draw-selection-border`: either duplicate a 10-line drawer in help, or move the helper next to player canvas. Prefer **move to player canvas** (demo bars are player notation, not editor state).
- `share-rhythm` → `editor/instrument-sounds`: covered in 3.1.

---

## 4. `layout` / `theme` / `icons` / `logo` — do not smash into one entry point

Observed DAG (not parallel):

```
layout  → logo, theme, icons, groovy-player/popover, contact
logo    → icons, theme
theme   → icons          (only InputChip → CloseIcon)
icons   → theme          (~7 fancy icons import `cn`)
icons   → groovy-player  (BarIndexIcon → canvas-colors)
```

Folder-level **theme ↔ icons** is a collapsed 2-cycle even though no **file** cycle exists. A barrel `index` would hide that and violate “no barrel files”.

### What not to do

- **Do not** merge layout into theme. Layout is page chrome (nav, bottom bar, slots). Theme is primitives (`Button`, `Text`, `Input`, `Switch`, `cn`). Different jobs. Layout’s 8 outbound is a **shell composing chrome**, not a smell — except the popover/contact leaks (3.1 / optional slot).
- **Do not** add `features/theme/index.ts`. Callers keep concrete paths.

### Best resolution

**A. Fold `logo` into `layout` (do this).**
`features/logo/logo.tsx` is one file. `layout/app-logo.tsx` already wraps it; homepage also imports `Logo`. Move to `features/layout/logo.tsx`. Homepage imports layout. Removes a parallel star that is just chrome.

**B. Nest `icons` under `theme`, still no barrel (do this).**
Move `features/icons/*` → `features/theme/icons/*`. Paths become `@/features/theme/icons/play-icon`. One design-system folder on the graph; glyphs belong with Button/Text, not with nav shell.

Break the remaining odd edges while moving:

- Fancy icons that need `cn`: keep importing `@/features/theme/cn` (now a same-folder sibling, no folder cycle).
- `theme/input-chip` → `CloseIcon`: stays `theme/icons/close-icon`.
- `BarIndexIcon`: stop importing player colors (3.1).

**C. Leave `layout` as its own feature.**
Optional follow-up: inject `ContactInfo` into the nav from `app-layout` / a slot so layout does not import `contact`. Lower priority; three-line product coupling, not a layer jump.

### Why not “split after import analysis” into more packages?

`cn` is 4 lines; extracting it to `lib/cn` just to keep `icons/` as a sibling is extra surface for no runtime win. Nesting under theme is the split that matches usage: almost every screen already imports both.

---

## 5. Suggested order

Do these as separate commits; graph should go quiet as each lands.

1. **Cycles (1.1–1.3)** — three tiny extract/move-constant changes. Graph lime nodes: garage, groovy-player, store.
2. **Layer helpers (2.2, 2.4)** — `rhythm-to-row` → `db/`, `admin-emails` → `lib/`.
3. **Cruiser rules (2.1, 2.3)** — allow type-only `db` → `rhythm.types`; stop treating `auth.ts` as `app`.
4. **Popover → theme** — biggest hub-leak; layout/garage/admin/editor stop importing player for chrome.
5. **Swing helpers + `instrumentSounds` + `NoteGlyphIcon` / selection border** — domain and notation UI out of the wrong folders.
6. **Logo → layout, icons → `theme/icons`** — chrome vs design system. Update `SHARED_KERNELS` / blue theme regex (`logo` gone, `icons` covered by `theme`).
7. **Mark `groovy-player` as a justified kernel** in `graph-hubs.mts` once leaks are gone (or immediately, with leaks still tracked as orange/lime until fixed).

Done when `npm run graph` shows: no file cycles, no runtime layer jumps, blue stars = theme (with icons) + layout (with logo) + rhythm + store + shared + lib/midinike + groovy-player, and “other hubs” only if a new surprise appears.

---

## Out of scope

- Rewriting editor outbound (it _should_ compose player canvas).
- Merging garage into editor because of the rhythm picker.
- Moving domain types into `db/`.
