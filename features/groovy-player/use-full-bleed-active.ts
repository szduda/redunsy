'use client'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { useIsMobile } from '@/features/shared/use-is-mobile'

export const useFullBleedActive = () => {
  const fullBleed = usePlayerStore((state) => state.fullBleed)
  const isMobile = useIsMobile()
  return fullBleed && !isMobile
}
