'use client'

import { PepperIcon } from '@/features/icons/pepper-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import {
  barSizeFromTrackBars,
  isSwingPatternIncorrect,
  usePlayerStore,
} from '@/features/groovy-player/player.store'
import { cn } from '@/features/theme/cn'

export const SwingToggle = () => {
  const swingEnabled = usePlayerStore((state) => state.swingEnabled)
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const trackBars = usePlayerStore((state) => state.trackBars)
  const barSize = barSizeFromTrackBars(trackBars)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const tempo = usePlayerStore((state) => state.tempo)
  const toggleSwingEnabled = usePlayerStore((state) => state.toggleSwingEnabled)
  const swingIncorrect = isSwingPatternIncorrect(swingPattern, barSize)

  return (
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
  )
}
