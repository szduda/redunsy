'use client'

import { useEffect, useRef, useState } from 'react'

import { PepperIcon } from '@/features/icons/pepper-icon'
import { WarningIcon } from '@/features/icons/warning-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { SwingPatternField } from '@/features/groovy-player/swing-pattern-field'
import { isSwingPatternIncorrect, usePlayerStore } from '@/features/groovy-player/player.store'
import { cn } from '@/features/theme/cn'
import { Text } from '@/features/theme/text'

export const SwingToggle = () => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const barSize = usePlayerStore((state) => state.barSize)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const tempo = usePlayerStore((state) => state.tempo)
  const toggleSwingEnabled = usePlayerStore((state) => state.toggleSwingEnabled)
  const swingIncorrect = isSwingPatternIncorrect(swingPattern, barSize)

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
        aria-disabled={swingIncorrect && !swingEnabled}
        aria-label={`Turn swing ${swingEnabled ? 'off' : 'on'}`}
        aria-pressed={swingEnabled}
        className={cn(swingIncorrect && !swingEnabled && 'opacity-40')}
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
      <div className="absolute top-full left-1/2 flex -translate-x-1/2 items-center gap-0.5">
        {swingIncorrect ? (
          <WarningIcon
            aria-label="Swing pattern length does not match bar size"
            className="size-3 text-yellowy"
          />
        ) : null}
        <button
          className="text-[8px] uppercase text-zinc-500 transition-colors hover:text-yellowy"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          edit
        </button>
      </div>
      {open ? (
        <div className="absolute top-full translate-y-4 z-20 mb-2 w-32 flex flex-col gap-1 rounded-b-md p-3 shadow-lg bg-white dark:bg-zinc-900">
          <Text variant="mono" className="text-xs uppercase font-medium">Swing pattern</Text>
          <SwingPatternField />
        </div>
      ) : null}
    </div>
  )
}
