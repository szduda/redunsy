'use client'

import { useEffect, useMemo, useState } from 'react'

import { filterOptionsFromRhythmCards } from '@/features/garage/rhythm-index'
import { useRhythmIndexStore } from '@/features/garage/rhythm-index.store'
import { listRhythmCardsForOwnership, matchesOwnership } from '@/features/garage/search-snippets'
import { useGarageFiltersStore } from '@/features/garage/garage-filters.store'

export const useGarageFilterOptions = () => {
  const ownership = useGarageFiltersStore((state) => state.ownership)
  const indexCards = useRhythmIndexStore((state) => state.cards)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return useMemo(
    () =>
      filterOptionsFromRhythmCards(
        hydrated
          ? listRhythmCardsForOwnership(ownership)
          : indexCards.filter((card) => matchesOwnership(card, ownership)),
      ),
    [hydrated, ownership, indexCards],
  )
}
