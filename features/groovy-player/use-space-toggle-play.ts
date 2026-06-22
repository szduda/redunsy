'use client'
import { useEffect, useRef } from 'react'

const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  target instanceof HTMLButtonElement ||
  (target instanceof HTMLElement && target.isContentEditable)

/** Toggle play/pause on the Space key, unless an interactive element is focused. */
export const useSpaceTogglePlay = (onToggle: () => void) => {
  const onToggleRef = useRef(onToggle)

  useEffect(() => {
    onToggleRef.current = onToggle
  }, [onToggle])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return
      if (event.repeat || isInteractiveTarget(event.target)) return
      event.preventDefault()
      onToggleRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
