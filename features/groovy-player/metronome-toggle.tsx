'use client'

import { type Ref } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { ShekereIcon } from '@/features/icons/shekere-icon'
import { cn } from '@/features/theme/cn'
import { IconButton } from '@/features/groovy-player/icon-button'

type MetronomeToggleProps = {
  focusRef?: Ref<HTMLButtonElement>
}

export const MetronomeToggle = ({ focusRef }: MetronomeToggleProps) => {
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const tempo = usePlayerStore((state) => state.tempo)
  const toggleHasMetronome = usePlayerStore((state) => state.toggleHasMetronome)

  return (
    <IconButton
      ref={focusRef}
      active={hasMetronome}
      aria-label={`Turn metronome ${hasMetronome ? 'off' : 'on'}`}
      aria-pressed={hasMetronome}
      className={cn(hasMetronome && isPlaying && 'animate-shake')}
      onClick={toggleHasMetronome}
      style={
        hasMetronome && isPlaying
          ? { animationDuration: `${Math.round(60000 / tempo)}ms` }
          : undefined
      }
    >
      <ShekereIcon className="size-9" />
    </IconButton>
  )
}
