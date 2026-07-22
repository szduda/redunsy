'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { selectGarageFilters, useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import { usePaginationStore } from '@/features/garage/pagination.store'
import { searchRhythmCards } from '@/features/search-index/search-index.search'
import { useSearchIndexStore } from '@/features/search-index/search-index.store'
import { useSearchIndex } from '@/features/search-index/use-search-index'
import type { GarageFilters } from '@/features/rhythm/rhythm.types'

export const garageSnippetsQueryKey = (
  version: string,
  search: string,
  filters: GarageFilters,
  page: number,
  pageSize: number,
) => ['garage-snippets', version, search, filters, page, pageSize] as const

type UseSearchRhythmCardsOptions = {
  filters?: GarageFilters
}

export const useSearchRhythmCards = (search: string, options?: UseSearchRhythmCardsOptions) => {
  useSearchIndex()

  const storeFilters = useGarageFiltersStore(useShallow(selectGarageFilters))
  const filters = options?.filters ?? storeFilters
  const page = usePaginationStore((state) => state.page)
  const pageSize = usePaginationStore((state) => state.pageSize)
  const version = useSearchIndexStore((state) => state.version)

  return useQuery({
    queryKey: garageSnippetsQueryKey(version, search, filters, page, pageSize),
    queryFn: () => searchRhythmCards({ search, filters, page, pageSize }),
    placeholderData: keepPreviousData,
    retry: false,
    enabled: Boolean(version),
  })
}

/** @deprecated Prefer useSearchRhythmCards — kept for garage call sites during migration. */
export const useGarageSnippets = useSearchRhythmCards
