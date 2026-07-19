'use client'

import { useEffect, useRef } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'

type PlayerKeyboardActions = {
  onStop: () => void
  focusTempo: () => void
  focusStop: () => void
  focusMetronome: () => void
  focusSwing: () => void
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement

export const usePlayerKeyboard = (actions: PlayerKeyboardActions | null) => {
  const actionsRef = useRef(actions)
  const toggleHasMetronome = usePlayerStore((state) => state.toggleHasMetronome)
  const toggleSwingEnabled = usePlayerStore((state) => state.toggleSwingEnabled)

  useEffect(() => {
    actionsRef.current = actions
  }, [actions])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const current = actionsRef.current
      if (!current || event.repeat || isTypingTarget(event.target)) return

      const key = event.key.toLowerCase()

      if (key === 'm') {
        event.preventDefault()
        toggleHasMetronome()
        current.focusMetronome()
        return
      }

      if (key === 'n') {
        event.preventDefault()
        toggleSwingEnabled()
        current.focusSwing()
        return
      }

      if (key === 'b') {
        event.preventDefault()
        current.focusTempo()
        return
      }

      if (key === 's') {
        event.preventDefault()
        current.onStop()
        current.focusStop()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleHasMetronome, toggleSwingEnabled])
}
