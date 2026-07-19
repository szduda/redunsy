'use client'
import { useEffect, useRef } from 'react'

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement

type SpaceTogglePlayOptions = {
  onToggle: () => void
  focusPlayPause?: () => void
}

/** Toggle play/pause on Space unless a text field is focused. */
export const useSpaceTogglePlay = ({ onToggle, focusPlayPause }: SpaceTogglePlayOptions) => {
  const onToggleRef = useRef(onToggle)
  const focusPlayPauseRef = useRef(focusPlayPause)

  useEffect(() => {
    onToggleRef.current = onToggle
  }, [onToggle])

  useEffect(() => {
    focusPlayPauseRef.current = focusPlayPause
  }, [focusPlayPause])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return
      if (event.repeat || isTypingTarget(event.target)) return
      event.preventDefault()
      onToggleRef.current()
      focusPlayPauseRef.current?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
