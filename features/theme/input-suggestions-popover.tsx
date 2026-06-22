'use client'

import { useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/features/theme/cn'

const POPOVER_GAP_PX = 4

type InputSuggestionsPopoverProps = {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  suggestions: string[]
  onSelect: (value: string) => void
}

const positionForAnchor = (anchor: HTMLElement): CSSProperties => {
  const rect = anchor.getBoundingClientRect()
  return {
    top: rect.bottom + POPOVER_GAP_PX,
    left: rect.left,
    width: 192,
    maxHeight: 128,
  }
}

export const InputSuggestionsPopover = ({
  anchorRef,
  open,
  suggestions,
  onSelect,
}: InputSuggestionsPopoverProps) => {
  const [style, setStyle] = useState<CSSProperties>()

  const updatePosition = () => {
    if (!anchorRef.current) return
    setStyle(positionForAnchor(anchorRef.current))
  }

  useLayoutEffect(() => {
    if (!open) {
      setStyle(undefined)
      return
    }
    updatePosition()
  }, [anchorRef, open, suggestions])

  useEffect(() => {
    if (!open) return
    const onViewportChange = () => updatePosition()
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [open])

  if (!open || suggestions.length === 0 || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed z-50 overflow-y-auto rounded-md border border-zinc-300 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
      onMouseDown={(event) => event.preventDefault()}
      style={style}
    >
      {suggestions.map((suggestion) => (
        <button
          className={cn(
            'block w-full px-3 py-1.5 text-left font-mono text-sm text-zinc-900',
            'hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800',
          )}
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          type="button"
        >
          {suggestion}
        </button>
      ))}
    </div>,
    document.body,
  )
}
