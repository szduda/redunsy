'use client'

import { useEffect, useRef } from 'react'

import { soundForDigit } from '@/features/editor/instrument-sounds'
import type { SelectionMode } from '@/features/editor/use-note-editor'
import type { NoteSelection } from '@/features/editor/notation/bar-note-edits'

type EditorKeyboardActions = {
  selection: NoteSelection | null
  selectionMode: SelectionMode
  previewNavigate: (direction: -1 | 1) => void
  commitSelection: () => void
  setSelectionMode: (mode: SelectionMode) => void
  setSound: (sound: string) => void
  toggleFlam: () => void
  convertToSixteenth: () => void
  convertToTriplet: () => void
  convertToEighth: () => void
}

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement

export const useEditorKeyboard = (instrument: string, actions: EditorKeyboardActions | null) => {
  const actionsRef = useRef(actions)
  const arrowHeldRef = useRef(false)

  useEffect(() => {
    actionsRef.current = actions
  }, [actions])

  useEffect(() => {
    const commitIfHeld = () => {
      if (!arrowHeldRef.current) return
      arrowHeldRef.current = false
      actionsRef.current?.commitSelection()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const current = actionsRef.current
      if (!current) return
      if (isEditableTarget(event.target)) return

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        arrowHeldRef.current = true
        current.previewNavigate(-1)
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        arrowHeldRef.current = true
        current.previewNavigate(1)
        return
      }

      if (arrowHeldRef.current) {
        commitIfHeld()
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

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      commitIfHeld()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', commitIfHeld)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', commitIfHeld)
    }
  }, [instrument])
}
