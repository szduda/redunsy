import { useRhythmIndexStore } from '@/features/garage/rhythm-index.store'
import type { RhythmCard } from '@/features/rhythm/rhythm.types'

export const syncRhythmIndexFromApi = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/rhythm-index')
    if (!response.ok) return false

    const cards = (await response.json()) as RhythmCard[]
    useRhythmIndexStore.getState().setCards(cards)
    return true
  } catch {
    return false
  }
}
