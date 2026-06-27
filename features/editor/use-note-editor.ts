'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  convertToEighth,
  convertToSixteenth,
  convertToTriplet,
  defaultNoteSelection,
  navigateSelection,
  setNoteAtGlyph,
  updateBarAtSelection,
  type NoteSelection,
} from '@/features/editor/notation/bar-note-edits'
import { remapBarIndex, reorderBar } from '@/features/editor/notation/reorder-bars'

export const useNoteEditor = (
  trackId: string,
  bars: string[],
  onBarsChange: (bars: string[]) => void,
) => {
  const [selection, setSelection] = useState<NoteSelection | null>(() =>
    defaultNoteSelection(bars),
  )

  useEffect(() => {
    setSelection(defaultNoteSelection(bars))
  }, [trackId])

  const selectNote = useCallback((barIndex: number, glyphIndex: number) => {
    setSelection({ barIndex, glyphIndex })
  }, [])

  const clearSelection = useCallback(() => setSelection(null), [])

  const navigate = useCallback(
    (direction: -1 | 1) => {
      setSelection((current) => navigateSelection(bars, current, direction))
    },
    [bars],
  )

  const setSound = useCallback(
    (sound: string) => {
      if (!selection) return
      const nextBars = updateBarAtSelection(bars, selection, (bar, glyphIndex) =>
        setNoteAtGlyph(bar, glyphIndex, sound),
      )
      onBarsChange(nextBars)
    },
    [bars, onBarsChange, selection],
  )

  const applyConversion = useCallback(
    (converter: (bar: string, glyphIndex: number) => string) => {
      if (!selection) return
      const nextBars = updateBarAtSelection(bars, selection, converter)
      onBarsChange(nextBars)
    },
    [bars, onBarsChange, selection],
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
    selectNote,
    clearSelection,
    navigate,
    setSound,
    reorderBarAt,
    convertToSixteenth: () => applyConversion(convertToSixteenth),
    convertToTriplet: () => applyConversion(convertToTriplet),
    convertToEighth: () => applyConversion(convertToEighth),
  }
}

export type NoteEditor = ReturnType<typeof useNoteEditor>
