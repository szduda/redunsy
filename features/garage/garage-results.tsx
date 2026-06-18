'use client'

import { hasActiveGarageFilters, useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import { GarageNotFound } from '@/features/garage/garage-not-found'
import { SnippetCard } from '@/features/garage/snippet-card'
import { useDebouncedValue } from '@/features/garage/use-debounced-value'
import { useGarageSnippets } from '@/features/garage/use-garage-snippets'
import { useSearchStore } from '@/features/store/search.store'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

const GarageSpinner = () => (
  <div aria-label="Loading" className="flex justify-center py-16" role="status">
    <span className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
  </div>
)

export const GarageResults = () => {
  const searchTerm = useSearchStore((state) => state.searchTerm)
  const hasFilters = useGarageFiltersStore(hasActiveGarageFilters)
  const hasQueryParams = searchTerm.length > 0 || hasFilters
  const debouncedSearch = useDebouncedValue(searchTerm, 500)
  const isSearching = debouncedSearch.length > 0
  const isDebouncing = searchTerm !== debouncedSearch

  const { data, isFetching, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGarageSnippets(debouncedSearch)

  const snippets = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0
  const showSpinner = isDebouncing || ((isLoading || isFetching) && !isFetchingNextPage)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <h1 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
        {hasQueryParams ? 'Search results' : 'Recently added'}
      </h1>

      {showSpinner ? <GarageSpinner /> : null}

      {!showSpinner && isSearching && snippets.length === 0 ? (
        <GarageNotFound searchTerm={debouncedSearch} />
      ) : null}

      {!showSpinner && snippets.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {snippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      ) : null}

      {!showSpinner && isSearching && hasNextPage ? (
        <Button
          className="w-fit"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          variant="outlined"
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </Button>
      ) : null}

      {!showSpinner && isSearching && snippets.length > 0 ? (
        <Text className={cn(!hasNextPage && 'opacity-60')} variant="mono">
          {total} result{total === 1 ? '' : 's'}
        </Text>
      ) : null}
    </div>
  )
}
