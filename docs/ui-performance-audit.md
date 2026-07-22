# UI Performance Audit — Player & Editor

**Scope:** Player + Editor UI under real load (4 instruments × up to 240 bars).  
**Goal:** No main-thread hangs, no aggressive polling, slick drag/navigation while paused and playing.  
**Date:** 2026-07-22

## Method

1. Static hot-path audit of player/editor canvas, stores, MIDI scheduler, keyboard, DnD.
2. Implement highest-ROI fixes (real work reduction, not `useMemo` wallpaper).
3. Two review → implement fine-tuning rounds with an independent cold-blooded reviewer.

## Load checkpoints (manual / future browser harness)

| Checkpoint | Instruments | Bars / instrument |
|------------|-------------|-------------------|
| Baseline   | 4           | 8                 |
| Mid        | 4           | 32, 64, 128       |
| Max        | 4           | 240               |

Exercise while **paused** and **playing**: bar drag-drop, arrow navigation, rapid tool keys (`r→y→t→y→e`), tempo/volume drag, mobile + desktop.

## Baseline findings (pre-fix)

### P0 — Canvas re-parses notation O(N) times per paint

`parseBarLayout` calls `parseGroupedNotation(allBars)` for **each bar**.  
`rowHeightsForBars` + `layoutBar` (via `renderBars`) therefore parse the full pattern roughly **2N times** per paint. Triplet/polyrhythm brackets parse again.

**Hit on:** every playhead bar step, every drag `pointermove`, every arrow preview, resize, theme/settings toggle.

### P0 — Playhead updates repaint every open track canvas

`activeBarIndex` fans out to all track canvases; each does a full layout+paint.

### P1 — Bar drag: React state every `pointermove`

`editable-bars-canvas` `setDrag` on every move → `useLayoutEffect` full re-parse + ghost redraw.

### P1 — Editor persist: sync `localStorage` on every note/bar edit

`updateActiveRhythm` → `saveRhythm` → read JSON + rewrite entire library on each key.

### P1 — Arrow key-repeat → preview store → full canvas paint

Commit-on-keyup is good; paint path still heavy (mitigated by P0 parse fix).

### P2 — Tempo drag restarts the audio loop

`useMidinike` effect calls `startLoop` on every tempo change while playing (cancel queue + reschedule).

### P2 — Volume sync selects entire `byInstrument` map

### P2 — `buildMergedBeats` compiles primary track twice

### P3 — Unthrottled `ResizeObserver` → width state → paint

### P3 — 25 ms audio scheduler (necessary; UI is bar-stepped, OK)

## Round 1 implementation plan

| Fix | Approach | Why real perf |
|-----|----------|---------------|
| Single-parse layout | Parse bars once; thread `BarLayout[]` through heights + render + brackets | Cuts parse work from ~2N+2 → 1 per paint |
| Drag coalescing | rAF-coalesce drag state; skip identical drop/hover when possible | Caps drag paints to frame rate |
| Debounced persist | Keep Zustand immediate; debounce `localStorage` writes; flush on hide/unload | Removes JSON I/O from keystroke path |
| Live tempo | Mutable loop BPM on player; invalidate schedule without full stop | Smooth tempo while playing |
| Resize rAF | Coalesce width updates to one per frame | Less layout thrash |
| Volume sync | Narrow subscriptions / stable levels signature | Less effect churn |
| Memo compare | Include `instrument` in canvas memo | Correctness + avoid stale skips |
| Merge beats | Reuse primary compile in merge | Less compile on play/restart |

## Success criteria

- Paint path: one `parseGroupedNotation` per canvas paint for a given bars array.
- Drag while editing 128–240 bars stays interactive (no multi-frame freezes).
- Rapid note entry does not sync-write storage every key.
- Tempo slider while playing does not tear/restart audible loop each tick.
- Existing unit + playback tests green; lint clean.

## Iteration log

- **Round 1:** (in progress) implement plan above.
- **Review 1:** pending cold review.
- **Round 2:** pending.
- **Review 2:** pending.
- **Round 3:** pending final polish + revised report.
