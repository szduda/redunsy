'use client'

import { Button } from '@/features/theme/button'
import { usePlayerStore } from '@/features/groovy-player/player.store'

export const MetronomeToggle = () => {
  const hasMetronome = usePlayerStore((state) => state.hasMetronome)
  const toggleHasMetronome = usePlayerStore((state) => state.toggleHasMetronome)

  return (
    <Button
      aria-pressed={hasMetronome}
      className="shrink-0 px-3"
      onClick={toggleHasMetronome}
      variant={hasMetronome ? 'primary' : 'secondary'}
    >
      Pulse
    </Button>
  )
}
