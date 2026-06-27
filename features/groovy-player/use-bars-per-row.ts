'use client'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { useIsMobile } from '@/features/shared/use-is-mobile'

export const useBarsPerRow = () => {
  const isMobile = useIsMobile()
  const desktopBarsPerRow = usePlayerStore((state) => state.desktopBarsPerRow)
  const mobileBarsPerRow = usePlayerStore((state) => state.mobileBarsPerRow)
  return isMobile ? mobileBarsPerRow : desktopBarsPerRow
}
