'use client'

import { useCallback, useEffect, useState } from 'react'

import { applyBarModeAction } from '@/features/editor/canvas/bar-pattern-actions'
import {
  convertBarsToEighth,
  convertBarsToSixteenth,
  convertBarsToTriplet,
  defaultNoteSelection,
  navigateBarSelection,
  navigateSelection,
  setNoteAtGlyph,
  type NoteSelection,
} from '@/features/editor/notation/bar-note-edits'
import { useNoteSelectionStore } from '@/features/editor/note-selection.store'
import { remapBarIndex, reorderBar } from '@/features/editor/notation/reorder-bars'

export type SelectionMode = 'note' | 'bar'

const resolveNextSelection = (
  bars: string[],
  selectionMode: SelectionMode,
  current: NoteSelection | null,
  direction: -1 | 1,
) =>
  selectionMode === 'bar'
    ? navigateBarSelection(bars, current, direction)
    : navigateSelection(bars, current, direction)

export const useNoteEditor = (
  trackId: string,
  bars: string[],
  barSize: number,
  onBarsChange: (bars: string[]) => void,
) => {
  const [selection, setSelection] = useState<NoteSelection | null>(() => {
    const initial = defaultNoteSelection(bars)
    useNoteSelectionStore.getState().setPreviewSelection(initial)
    return initial
  })
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('note')
  const setPreviewSelection = useNoteSelectionStore((state) => state.setPreviewSelection)

  const syncSelection = useCallback(
    (next: NoteSelection | null) => {
      setSelection(next)
      setPreviewSelection(next)
    },
    [setPreviewSelection],
  )

  useEffect(() => {
    const next = defaultNoteSelection(bars)
    syncSelection(next)
    setSelectionMode('note')
    // bars intentionally omitted — preserve selection across edits; reset only when switching tracks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId])

  const selectNote = useCallback(
    (barIndex: number, glyphIndex: number) => {
      syncSelection({ barIndex, glyphIndex })
    },
    [syncSelection],
  )

  const selectBar = useCallback(
    (barIndex: number) => {
      syncSelection({ barIndex, glyphIndex: 0 })
    },
    [syncSelection],
  )

  const clearSelection = useCallback(() => syncSelection(null), [syncSelection])

  const navigate = useCallback(
    (direction: -1 | 1) => {
      const current = useNoteSelectionStore.getState().previewSelection ?? selection
      syncSelection(resolveNextSelection(bars, selectionMode, current, direction))
    },
    [bars, selection, selectionMode, syncSelection],
  )

  const previewNavigate = useCallback(
    (direction: -1 | 1) => {
      const current =
        useNoteSelectionStore.getState().previewSelection ?? selection ?? defaultNoteSelection(bars)
      setPreviewSelection(resolveNextSelection(bars, selectionMode, current, direction))
    },
    [bars, selection, selectionMode, setPreviewSelection],
  )

  const commitSelection = useCallback(() => {
    setSelection(useNoteSelectionStore.getState().previewSelection)
  }, [])

  const setSelectionModeWithSelection = useCallback(
    (mode: SelectionMode) => {
      setSelectionMode(mode)
      if (mode === 'bar') {
        const current = useNoteSelectionStore.getState().previewSelection ?? selection
        syncSelection(
          current ? { barIndex: current.barIndex, glyphIndex: 0 } : defaultNoteSelection(bars),
        )
      }
    },
    [bars, selection, syncSelection],
  )

  const setSound = useCallback(
    (sound: string) => {
      if (!selection || selectionMode !== 'note') return
      onBarsChange(setNoteAtGlyph(bars, selection, sound))
    },
    [bars, onBarsChange, selection, selectionMode],
  )

  const runBarModeAction = useCallback(
    (action: 'add' | 'remove' | 'clear') => {
      const barIndex = selection?.barIndex ?? -1
      const result = applyBarModeAction(bars, barSize, barIndex, action)
      onBarsChange(result.bars)
      if (result.barIndex >= 0) {
        syncSelection({ barIndex: result.barIndex, glyphIndex: 0 })
      }
    },
    [barSize, bars, onBarsChange, selection?.barIndex, syncSelection],
  )

  const reorderBarAt = useCallback(
    (from: number, to: number) => {
      const nextBars = reorderBar(bars, from, to)
      if (nextBars === bars) return
      onBarsChange(nextBars)
      const current = useNoteSelectionStore.getState().previewSelection ?? selection
      syncSelection(
        current ? { ...current, barIndex: remapBarIndex(current.barIndex, from, to) } : null,
      )
    },
    [bars, onBarsChange, selection, syncSelection],
  )

  return {
    selection,
    selectionMode,
    selectNote,
    selectBar,
    clearSelection,
    navigate,
    previewNavigate,
    commitSelection,
    setSelectionMode: setSelectionModeWithSelection,
    setSound,
    reorderBarAt,
    runBarModeAction,
    convertToSixteenth: () => {
      if (!selection || selectionMode !== 'note') return
      onBarsChange(convertBarsToSixteenth(bars, selection))
    },
    convertToTriplet: () => {
      if (!selection || selectionMode !== 'note') return
      onBarsChange(convertBarsToTriplet(bars, selection, barSize))
    },
    convertToEighth: () => {
      if (!selection || selectionMode !== 'note') return
      onBarsChange(convertBarsToEighth(bars, selection))
    },
  }
}

export type NoteEditor = ReturnType<typeof useNoteEditor>
