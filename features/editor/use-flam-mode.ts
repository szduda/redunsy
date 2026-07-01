'use client'

import { useEffect, useRef, useState } from 'react'

import {
  flamDisableTarget,
  flamEnableTarget,
  flamSymbolsForInstrument,
  isFlamSymbol,
} from '@/features/editor/flam-sounds'
import { getSelectedFlatNote, type NoteSelection } from '@/features/editor/notation/bar-note-edits'

export const useFlamMode = (
  instrument: string,
  bars: string[],
  selection: NoteSelection | null,
  onSelectSound: (sound: string) => void,
  isNoteMode: boolean,
) => {
  const [flamMode, setFlamMode] = useState(false)
  const flamBaseNoteRef = useRef<string | null>(null)
  const flamSelectionKeyRef = useRef<string | null>(null)

  const selected = selection && isNoteMode ? getSelectedFlatNote(bars, selection) : null
  const flamSymbols = flamSymbolsForInstrument(instrument)
  const canFlam = selection !== null && isNoteMode && flamSymbols.length > 0

  useEffect(() => {
    const selectionKey = selected == null ? null : `${selected.barIndex}:${selected.glyphIndex}`

    if (selectionKey !== flamSelectionKeyRef.current) {
      flamBaseNoteRef.current = null
      flamSelectionKeyRef.current = selectionKey
    }

    if (!selected) {
      setFlamMode(false)
      return
    }
    if (isFlamSymbol(selected.note, instrument)) {
      setFlamMode(true)
      return
    }
    if (selected.note === '-') {
      setFlamMode(false)
      flamBaseNoteRef.current = null
      return
    }
    setFlamMode(false)
    flamBaseNoteRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrument, selected?.barIndex, selected?.glyphIndex, selected?.note])

  const toggleFlam = () => {
    if (!selected || !flamSymbols.length) return
    const next = !flamMode
    setFlamMode(next)
    if (next) {
      flamBaseNoteRef.current = selected.note
      if (selected.note === '-') return
      const flam = flamEnableTarget(selected.note, instrument)
      if (flam) onSelectSound(flam)
      return
    }
    if (selected.note === '-') {
      flamBaseNoteRef.current = null
      return
    }
    if (!isFlamSymbol(selected.note, instrument)) {
      flamBaseNoteRef.current = null
      return
    }
    const restore = flamDisableTarget(flamBaseNoteRef.current ?? selected.note, selected.note)
    if (restore) onSelectSound(restore)
    flamBaseNoteRef.current = null
  }

  return { canFlam, flamMode, flamSymbols, toggleFlam }
}
