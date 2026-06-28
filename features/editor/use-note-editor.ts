'use client'

import { useCallback, useEffect, useState } from 'react'

import { applyBarModeAction } from '@/features/editor/canvas/bar-pattern-actions'
import {
  convertToEighth,
  convertToSixteenth,
  convertToTriplet,
  defaultNoteSelection,
  navigateBarSelection,
  navigateSelection,
  setNoteAtGlyph,
  updateBarAtSelection,
  type NoteSelection,
} from '@/features/editor/notation/bar-note-edits'
import { remapBarIndex, reorderBar } from '@/features/editor/notation/reorder-bars'

export type SelectionMode = 'note' | 'bar'

export const useNoteEditor = (
  trackId: string,
  bars: string[],
  barSize: number,
  onBarsChange: (bars: string[]) => void,
) => {
  const [selection, setSelection] = useState<NoteSelection | null>(() => defaultNoteSelection(bars))
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('note')

  useEffect(() => {
    setSelection(defaultNoteSelection(bars))
    setSelectionMode('note')
  }, [trackId, bars])

  const selectNote = useCallback((barIndex: number, glyphIndex: number) => {
    setSelection({ barIndex, glyphIndex })
  }, [])

  const selectBar = useCallback((barIndex: number) => {
    setSelection({ barIndex, glyphIndex: 0 })
  }, [])

  const clearSelection = useCallback(() => setSelection(null), [])

  const navigate = useCallback(
    (direction: -1 | 1) => {
      setSelection((current) =>
        selectionMode === 'bar'
          ? navigateBarSelection(bars, current, direction)
          : navigateSelection(bars, current, direction),
      )
    },
    [bars, selectionMode],
  )

  const setSelectionModeWithSelection = useCallback(
    (mode: SelectionMode) => {
      setSelectionMode(mode)
      if (mode === 'bar') {
        setSelection((current) => {
          if (current) return { barIndex: current.barIndex, glyphIndex: 0 }
          return defaultNoteSelection(bars)
        })
      }
    },
    [bars],
  )

  const setSound = useCallback(
    (sound: string) => {
      if (!selection || selectionMode !== 'note') return
      const nextBars = updateBarAtSelection(bars, selection, (bar, glyphIndex) =>
        setNoteAtGlyph(bar, glyphIndex, sound),
      )
      onBarsChange(nextBars)
    },
    [bars, onBarsChange, selection, selectionMode],
  )

  const applyConversion = useCallback(
    (converter: (bar: string, glyphIndex: number) => string) => {
      if (!selection || selectionMode !== 'note') return
      const nextBars = updateBarAtSelection(bars, selection, converter)
      onBarsChange(nextBars)
    },
    [bars, onBarsChange, selection, selectionMode],
  )

  const runBarModeAction = useCallback(
    (action: 'add' | 'remove' | 'clear') => {
      const barIndex = selection?.barIndex ?? -1
      const result = applyBarModeAction(bars, barSize, barIndex, action)
      onBarsChange(result.bars)
      if (result.barIndex >= 0) {
        setSelection({ barIndex: result.barIndex, glyphIndex: 0 })
      }
    },
    [barSize, bars, onBarsChange, selection?.barIndex],
  )

  const reorderBarAt = useCallback(
    (from: number, to: number) => {
      const nextBars = reorderBar(bars, from, to)
      if (nextBars === bars) return
      onBarsChange(nextBars)
      setSelection((current) =>
        current ? { ...current, barIndex: remapBarIndex(current.barIndex, from, to) } : null,
      )
    },
    [bars, onBarsChange],
  )

  return {
    selection,
    selectionMode,
    selectNote,
    selectBar,
    clearSelection,
    navigate,
    setSelectionMode: setSelectionModeWithSelection,
    setSound,
    reorderBarAt,
    runBarModeAction,
    convertToSixteenth: () => applyConversion(convertToSixteenth),
    convertToTriplet: () => applyConversion(convertToTriplet),
    convertToEighth: () => applyConversion(convertToEighth),
  }
}

export type NoteEditor = ReturnType<typeof useNoteEditor>
