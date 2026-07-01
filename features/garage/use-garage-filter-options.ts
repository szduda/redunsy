'use client'

import { useEffect, useMemo, useState } from 'react'

import { filterOptionsFromRhythmCards } from '@/features/garage/rhythm-index'
import {
  listIndexRhythmCardsForOwnership,
  listRhythmCardsForOwnership,
} from '@/features/garage/search-snippets'
import { useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import { useRhythmIndexStore } from '@/features/garage/rhythm-index.store'

export const useGarageFilterOptions = () => {
  const ownership = useGarageFiltersStore((state) => state.ownership)
  const revision = useRhythmIndexStore((state) => state.revision)
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
    [hydrated, ownership, revision],
  )
}
