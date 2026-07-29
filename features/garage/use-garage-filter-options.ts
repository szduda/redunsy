'use client'

import { useEffect, useMemo, useState } from 'react'

import { useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import { listMyRhythms } from '@/features/rhythm/my-rhythms-storage'
import { rhythmToCard } from '@/features/rhythm/rhythm-helpers'
import { filterOptionsFromRhythmCards } from '@/features/search-index/search-index.filters'
import { matchesOwnership } from '@/features/search-index/search-index.search'
import { useSearchIndexStore } from '@/features/search-index/search-index.store'
import { useSearchIndex } from '@/features/search-index/use-search-index'

export const useGarageFilterOptions = () => {
  useSearchIndex()
  const ownership = useGarageFiltersStore((state) => state.ownership)
  const cards = useSearchIndexStore((state) => state.cards)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return useMemo(() => {
    const catalogue = hydrated ? [...cards, ...listMyRhythms().map(rhythmToCard)] : cards
    return filterOptionsFromRhythmCards(
      catalogue.filter((card) => matchesOwnership(card, ownership)),
    )
  }, [cards, hydrated, ownership])
}
