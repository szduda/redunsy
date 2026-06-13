'use client'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

export const BarSizeToggle = () => {
  const barSize = usePlayerStore((state) => state.barSize)
  const toggleBarSize = usePlayerStore((state) => state.toggleBarSize)

  return (
    <Button
      aria-label={`Bar size ${barSize}, click to toggle`}
      className="min-w-[3rem] px-3 flex flex-col gap-1"
      onClick={toggleBarSize}
      variant="secondary"
    >
      {barSize}
      <Text variant="mono" className="text-[8px] uppercase font-medium">Bar size</Text>
    </Button>
  )
}
