'use client'

import { type Ref } from 'react'

import { PepperIcon } from '@/features/icons/pepper-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { isSwingPatternIncorrect, usePlayerStore } from '@/features/groovy-player/player.store'
import { cn } from '@/features/theme/cn'

type SwingToggleProps = {
  focusRef?: Ref<HTMLButtonElement>
}

export const SwingToggle = ({ focusRef }: SwingToggleProps) => {
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const swingBarSize = usePlayerStore((state) => state.swingBarSize)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const tempo = usePlayerStore((state) => state.tempo)
  const toggleSwingEnabled = usePlayerStore((state) => state.toggleSwingEnabled)
  const swingIncorrect = isSwingPatternIncorrect(swingPattern, swingBarSize)

  return (
    <IconButton
      ref={focusRef}
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
  )
}
