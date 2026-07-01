'use client'
import { useEffect, useRef } from 'react'

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement

/** Toggle play/pause on Space unless a text field is focused. */
export const useSpaceTogglePlay = (onToggle: () => void) => {
  const onToggleRef = useRef(onToggle)

  useEffect(() => {
    onToggleRef.current = onToggle
  }, [onToggle])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return
      if (event.repeat || isTypingTarget(event.target)) return
      event.preventDefault()
      onToggleRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
