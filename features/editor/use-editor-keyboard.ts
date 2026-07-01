'use client'

import { useEffect, useRef } from 'react'

import { soundForDigit } from '@/features/editor/instrument-sounds'
import type { SelectionMode } from '@/features/editor/use-note-editor'
import type { NoteSelection } from '@/features/editor/notation/bar-note-edits'

type EditorKeyboardActions = {
  selection: NoteSelection | null
  selectionMode: SelectionMode
  navigate: (direction: -1 | 1) => void
  setSelectionMode: (mode: SelectionMode) => void
  setSound: (sound: string) => void
  toggleFlam: () => void
  convertToSixteenth: () => void
  convertToTriplet: () => void
  convertToEighth: () => void
}

export const useEditorKeyboard = (instrument: string, actions: EditorKeyboardActions | null) => {
  const actionsRef = useRef(actions)

  useEffect(() => {
    actionsRef.current = actions
  }, [actions])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const current = actionsRef.current
      if (!current) return

      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        current.navigate(-1)
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        current.navigate(1)
        return
      }

      if (event.key === '`' || event.code === 'Backquote') {
        event.preventDefault()
        current.setSelectionMode(current.selectionMode === 'bar' ? 'note' : 'bar')
        return
      }

      if (current.selectionMode !== 'note' || !current.selection) return

      if (event.key === 'Backspace') {
        event.preventDefault()
        current.setSound('-')
        return
      }

      if (event.key === 'r') {
        event.preventDefault()
        current.convertToSixteenth()
        return
      }

      if (event.key === 't') {
        event.preventDefault()
        current.convertToTriplet()
        return
      }

      if (event.key === 'y') {
        event.preventDefault()
        current.convertToEighth()
        return
      }

      if (event.key === 'u') {
        event.preventDefault()
        current.toggleFlam()
        return
      }

      const digit = Number(event.key)
      if (!Number.isInteger(digit) || digit < 1 || digit > 9) return

      const sound = soundForDigit(instrument, digit)
      if (!sound) return

      event.preventDefault()
      current.setSound(sound)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [instrument])
}
