'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { selectGarageFilters, useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import { usePaginationStore } from '@/features/garage/pagination.store'
import { searchRhythmCards } from '@/features/garage/search-snippets'
import type { GarageFilters } from '@/features/rhythm/rhythm.types'

export const garageSnippetsQueryKey = (
  search: string,
  filters: GarageFilters,
  page: number,
  pageSize: number,
  indexVersion: number,
) => ['garage-snippets', search, filters, page, pageSize, indexVersion] as const

export const useGarageSnippets = (search: string, indexVersion: number) => {
  const filters = useGarageFiltersStore(useShallow(selectGarageFilters))
  const page = usePaginationStore((state) => state.page)
  const pageSize = usePaginationStore((state) => state.pageSize)

  return useQuery({
    queryKey: garageSnippetsQueryKey(search, filters, page, pageSize, indexVersion),
    queryFn: () => searchRhythmCards({ search, filters, page, pageSize }),
    // Search is synchronous in-memory — keep previous results visible while the
    // new query key resolves so there is no blank/spinner flash between pages.
    placeholderData: keepPreviousData,
    // Never retry: the queryFn is pure in-memory and errors are bugs, not
    // transient failures. Retrying would just delay the error state visibly.
    retry: false,
  })
}
