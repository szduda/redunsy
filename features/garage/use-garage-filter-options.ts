'use client'

import { useEffect, useMemo, useState } from 'react'

import { filterOptionsFromRhythmCards } from '@/features/search-index/search-index.filters'
import {
  listIndexRhythmCardsForOwnership,
  listRhythmCardsForOwnership,
} from '@/features/search-index/search-index.search'
import { useSearchIndex } from '@/features/search-index/use-search-index'
import { useGarageFiltersStore } from '@/features/garage/garage-filters.store'

export const useGarageFilterOptions = () => {
  useSearchIndex()
  const ownership = useGarageFiltersStore((state) => state.ownership)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return useMemo(
    () =>
      filterOptionsFromRhythmCards(
        hydrated
          ? listRhythmCardsForOwnership(ownership)
          : listIndexRhythmCardsForOwnership(ownership),
      ),
    [hydrated, ownership],
  )
}
