# UI Performance Audit — Player & Editor (Revised)

**Repo:** redunsy · **Branch:** `cursor/ui-performance-audit-4ecd` · **PR:** #65  
**Date:** 2026-07-22  
**Process:** Plan → implement → 2× [cold review → implement] → final polish

## Goal

Top-notch player/editor UI under real load: **4 instruments × up to 240 bars**, no main-thread hangs, no aggressive polling. Exercise drag-drop, navigation, rapid tool keys (`r→y→t→y→e`), tempo/volume, **paused and playing**, mobile and desktop.

## Load checkpoints

| Checkpoint | Instruments | Bars / instrument |
| ---------- | ----------- | ----------------- |
| Baseline   | 4           | 8                 |
| Mid        | 4           | 32 / 64 / 128     |
| Max        | 4           | 240               |

## Baseline (pre-fix) — ranked

| Sev | Issue                                                                           | Effect at 128–240 bars                             |
| --- | ------------------------------------------------------------------------------- | -------------------------------------------------- |
| P0  | `parseBarLayout` re-parsed **all bars per bar** in heights + layout + brackets  | ~`3N` full `parseGroupedNotation`s per track paint |
| P0  | Playhead `activeBarIndex` full-repainted every open track                       | 4× full paints every bar step                      |
| P1  | Bar drag: `setDrag` every `pointermove` + `barBoundsForBars` parsed **per bar** | O(N) parses **before** React even ran              |
| P1  | Every note edit sync-wrote entire `my-rhythms` JSON                             | Main-thread I/O on rapid keys                      |
| P1  | Arrow/`flattenBarNotes` used per-bar parse → O(N²)                              | Navigation jank                                    |
| P2  | Tempo drag restarted audio loop each tick                                       | Audible hiccups + cancel/reschedule                |
| P2  | `buildMergedBeats` compiled primary twice                                       | Extra compile on play/restart                      |
| P3  | Unthrottled ResizeObserver; broad volume map select                             | Secondary thrash                                   |

Audio scheduler at 25 ms is intentional and fine; UI is bar-stepped (not RAF-polled).

---

## What shipped

### Round 1 — foundation

- Threaded **single-parse** APIs (`parseBarsNotation`, optional layouts into heights/brackets/`renderBars`).
- rAF-coalesced drag state; canvas memo compares `instrument`.
- Debounced localStorage (300 ms) + flush on hide/unload; immediate write on rename/delete.
- Live `setPlayLoopTempo` (rebase timing, no loop generation bump).
- rAF width measure; narrower volume sync signature.

**Cold review score: 6/10** — layout API real; paint still double-parsed at call sites; drag still O(N) parses; merge-beats claimed but missing; ImageData/rAF incomplete.

### Round 2 — close the blockers

- Call sites share **one parse** for height + `renderBars`.
- Drag hit-test uses **cached element bounds** (no parse on move).
- Pointer-only moves: **no React setState**; ghost via composite layer.
- `buildMergedBeats` reuses primary compile.
- `storage` event invalidates memory cache; dirty-gated flush.
- Notation `flattenBarNotes` / multi-bar glyph maps: **one parse**.
- Tempo rebase unit tests (`rebaseLoopTiming`).

**Cold review score: 8/10** — blockers closed; playhead still full-repainted; ImageData ghost called heavy.

### Round 3 — playhead + ghost polish

- **Static offscreen layer** per track: rebuild only when bars/size/theme/settings change; playhead ticks **blit + paint one highlighted bar**.
- `ensureCanvasDpi` avoids wiping canvas when size unchanged.
- Hash-keyed **`cachedParseBarsNotation`** (module LRU) — no re-parse on playhead ticks; ESLint-clean (no ref-during-render).
- Ghost composite: **offscreen canvas + `drawImage`** (ImageData removed).
- Cached ghost bar layout; drag helpers extracted (`bar-drag-paint`, `paint-editable-frame`, `static-bars-layer`).

---

## Hot-path cost model (after)

| Scenario                       | Before (approx)             | After (approx)                                                                              |
| ------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------- |
| Paint 1 track, N bars          | ~3N full parses + full draw | 1 cached parse (`barsNotationHash` / NUL sep); static redraw only on content change         |
| Playhead step, 4 tracks        | 4× (parse + full draw)      | 4× (blit static + 1 bar); when `markTriplets` is on, also re-stroke bracket overlays        |
| Drag pointermove (same slot)   | N parses + full React paint | Geometry on cached bounds; ghost composite only                                             |
| Drag pointermove (slot change) | N parses + full React paint | Full reparse/repaint of preview order + offscreen snapshot; then ghost-only until next slot |
| Rapid note keys                | Sync LS + O(N²) flatten     | Debounced LS + O(N) flatten                                                                 |
| Tempo drag while playing       | Stop/restart loop           | Rebase `stepMs` in place                                                                    |

---

## Verification

| Suite                                                       | Result         |
| ----------------------------------------------------------- | -------------- |
| `features/groovy-player/canvas/` + editor + storage + clock | **133 passed** |
| `npm run test:playback`                                     | **100 passed** |
| `tsc --noEmit`                                              | clean          |
| ESLint on touched UI/canvas files                           | clean          |

Manual browser harness at 8→240 bars (play/pause, drag, rapid tools, mobile) still recommended on the PR.

---

## Remaining / consciously rejected

**Optional follow-ups (low urgency):**

- Richer multi-tab merge by `updatedAt` if dual-tab editing becomes common (current: local snapshot wins; a concurrent remote write is overwritten).
- When `markTriplets` is on, playhead overlay currently re-strokes all brackets after the highlighted bar (correctness); could dirty-rect brackets later.
- Drag hover highlight: hit-test uses original-order bounds frozen at drag start; paint uses preview-order rowHeights — with mixed bar heights the hover overlay can sit on a different row than the cursor.
- `demo-bar.tsx` may still double-parse (out of critical path).

**Rejected (overkill):** canvas virtualization before this paint model; Worker parse; replacing 25 ms scheduler; `useMemo` wallpaper; OffscreenCanvas transferables.

---

## Review follow-ups addressed (post Round-3)

- `barsNotationHash` / NUL separator — no `join('')` cache-key collisions.
- Multi-tab `storage`: flush dirty memory before invalidate (local snapshot wins; remote concurrent write overwritten — not a merge).
- Drag preview highlights use reordered `barsToRender` / `renderParsed` geometry; slot-change parse uses `cachedParseBarsNotation`.
- Offscreen ghost copy skips bitmap wipe when size unchanged.
- Playhead path: no per-tick `layouts.map` clone; canvas via `useRef` (not `getElementById`).
- Drop-index past-last guards empty/mismatched bounds; vacuous hash test removed; non-dirty storage invalidate test restored.
- Dead `renderBar` export removed.

## Iteration agents

- **Implementers:** Cursor Grok 4.5 High — algorithmic perf, clean modules, low cognitive complexity.
- **Reviewer (persisted):** cold-blooded, roasted incomplete Round 1 claims, ImageData cost, and playhead gap; Round 2/3 addressed must-fixes.

## Key files

- `features/groovy-player/canvas/{bar-layout,renderers,bars-canvas,static-bars-layer,use-canvas-width}.ts(x)`
- `features/editor/{editable-bars-canvas.tsx,canvas/bar-drag-paint.ts,canvas/paint-editable-frame.ts,notation/bar-note-edits.ts}`
- `features/rhythm/my-rhythms-storage.ts`
- `lib/midinike/{use-midinike.ts,audio/player.ts,audio/playback-clock.ts}`
