'use client'

import { useEffect, useRef, useState } from 'react'

import { PepperIcon } from '@/features/icons/pepper-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { SwingPatternField } from '@/features/groovy-player/swing-pattern-field'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { cn } from '@/features/theme/cn'

export const SwingToggle = () => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const tempo = usePlayerStore((state) => state.tempo)
  const toggleSwingEnabled = usePlayerStore((state) => state.toggleSwingEnabled)

  useEffect(() => {
    if (!open) return
    const onPointerDown = ({ target }: PointerEvent) => {
      if (!rootRef.current?.contains(target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        active={swingEnabled}
        aria-label={`Turn swing ${swingEnabled ? 'off' : 'on'}`}
        aria-pressed={swingEnabled}
        onClick={toggleSwingEnabled}
      >
        <PepperIcon
          className={cn('size-9', swingEnabled && isPlaying && 'animate-spin')}
          style={
            swingEnabled && isPlaying
              ? { animationDuration: `${Math.round((2 * 60000) / tempo)}ms` }
              : undefined
          }
        />
      </IconButton>
      <button
        className="absolute uppercase top-full left-1/2 -translate-x-1/2 text-[8px] text-zinc-500 transition-colors hover:text-yellowy"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        edit
      </button>
      {open ? (
        <div className="absolute bottom-full z-20 mb-2 w-44 rounded-md border border-zinc-300 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-950">
          <SwingPatternField />
        </div>
      ) : null}
    </div>
  )
}
