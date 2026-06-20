'use client'

import { useEffect, useMemo, useState } from 'react'

import { filterOptionsFromRhythmCards } from '@/features/garage/mock-snippets'
import {
  listMockRhythmCardsForOwnership,
  listRhythmCardsForOwnership,
} from '@/features/garage/search-snippets'
import { useGarageFiltersStore } from '@/features/garage/garage-filters.store'

export const useGarageFilterOptions = () => {
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
          : listMockRhythmCardsForOwnership(ownership),
      ),
    [hydrated, ownership],
  )
}
