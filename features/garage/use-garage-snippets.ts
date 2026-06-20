'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { selectGarageFilters, useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import { searchRhythmCards } from '@/features/garage/search-snippets'
import type { GarageFilters } from '@/features/rhythm/rhythm.types'

export const GARAGE_PAGE_SIZE = 10

export const garageSnippetsQueryKey = (search: string, filters: GarageFilters) =>
  ['garage-snippets', search, filters] as const

export const useGarageSnippets = (search: string) => {
  const filters = useGarageFiltersStore(useShallow(selectGarageFilters))

  return useInfiniteQuery({
    queryKey: garageSnippetsQueryKey(search, filters),
    queryFn: ({ pageParam }) =>
      searchRhythmCards({
        search,
        filters,
        page: pageParam,
        pageSize: GARAGE_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!search) return undefined
      return lastPage.page * lastPage.pageSize < lastPage.total ? lastPage.page + 1 : undefined
    },
  })
}
