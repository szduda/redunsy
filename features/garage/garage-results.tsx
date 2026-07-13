'use client'

import { useCallback, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  hasActiveGarageFilters,
  selectGarageFilters,
  useGarageFiltersStore,
} from '@/features/garage/garage-filters.store'
import { GarageNotFound } from '@/features/garage/garage-not-found'
import { GaragePagination } from '@/features/garage/garage-pagination'
import { usePaginationStore } from '@/features/garage/pagination.store'
import { RhythmCardView } from '@/features/garage/rhythm-card'
import { useDebouncedValue } from '@/features/garage/use-debounced-value'
import { useGarageSnippets } from '@/features/garage/use-garage-snippets'
import type { GarageFilters } from '@/features/rhythm/rhythm.types'
import { useSearchStore } from '@/features/store/search.store'
import { cn } from '@/features/theme/cn'

const GarageSpinner = () => (
  <div aria-label="Loading" className="flex justify-center py-16" role="status">
    <span className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
  </div>
)

type GarageResultsProps = {
  filters?: GarageFilters
  searchTerm?: string
  showHeading?: boolean
}

export const GarageResults = ({
  filters: filtersOverride,
  searchTerm: searchTermOverride,
  showHeading = true,
}: GarageResultsProps = {}) => {
  const storeSearchTerm = useSearchStore((state) => state.searchTerm)
  const storeFilters = useGarageFiltersStore(useShallow(selectGarageFilters))
  const searchTerm = searchTermOverride ?? storeSearchTerm
  const filters = filtersOverride ?? storeFilters
  const hasFilters = hasActiveGarageFilters(filters)
  const hasQueryParams = searchTerm.length > 0 || hasFilters
  const debouncedSearch = useDebouncedValue(searchTerm, 200)
  const isDebouncing = searchTerm !== debouncedSearch

  const page = usePaginationStore((state) => state.page)
  const setPage = usePaginationStore((state) => state.setPage)
  const pageSize = usePaginationStore((state) => state.pageSize)
  const setPageSize = usePaginationStore((state) => state.setPageSize)

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(nextPage)
      window.scrollTo(0, 0)
    },
    [setPage],
  )

  const { data, isLoading, isFetching, isPlaceholderData } = useGarageSnippets(debouncedSearch, {
    filters: filtersOverride,
  })

  const snippets = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const showSpinner = isDebouncing || (isLoading && !data)
  const hasActiveQuery = hasQueryParams
  const showNotFound = !showSpinner && !isFetching && hasActiveQuery && snippets.length === 0

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }
      if (event.key === 'ArrowLeft' && page > 1) {
        event.preventDefault()
        goToPage(page - 1)
      } else if (event.key === 'ArrowRight' && page < totalPages) {
        event.preventDefault()
        goToPage(page + 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goToPage, page, totalPages])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {showHeading ? (
        <h1 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
          {hasQueryParams ? 'Search results' : 'Recently added'}
        </h1>
      ) : null}

      {showSpinner ? <GarageSpinner /> : null}

      {showNotFound ? <GarageNotFound searchTerm={debouncedSearch} /> : null}

      {!showSpinner && snippets.length > 0 ? (
        <div
          className={cn(
            'grid grid-cols-1 gap-3 lg:grid-cols-2',
            isPlaceholderData && isFetching && 'opacity-60',
          )}
        >
          {snippets.map((card) => (
            <RhythmCardView key={card.slug} card={card} />
          ))}
        </div>
      ) : null}

      {!showSpinner ? (
        <GaragePagination
          disabled={isFetching}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
        />
      ) : null}
    </div>
  )
}
