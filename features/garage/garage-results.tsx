'use client'

import { useEffect, useRef, useState } from 'react'

import {
  hasActiveGarageFilters,
  useGarageFiltersStore,
} from '@/features/garage/garage-filters.store'
import { GarageNotFound } from '@/features/garage/garage-not-found'
import {
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
  usePaginationStore,
} from '@/features/garage/pagination.store'
import { RhythmCardView } from '@/features/garage/rhythm-card'
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

type PageSizePopoverProps = {
  value: PageSizeOption
  onChange: (value: PageSizeOption) => void
}

const PageSizePopover = ({ value, onChange }: PageSizePopoverProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <span ref={ref} className="relative inline-block">
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-transparent px-2 py-0.5 font-mono text-xs text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900/50"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {value}
        <span aria-hidden className="text-[10px]">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          aria-label="Page size"
          className="absolute left-0 top-full z-20 mt-1 min-w-full rounded-md border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          role="listbox"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                className={cn(
                  'w-full px-3 py-1 text-left font-mono text-xs',
                  option === value
                    ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900',
                )}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
                type="button"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  )
}

type PaginationProps = {
  page: number
  totalPages: number
  total: number
  pageSize: PageSizeOption
  disabled: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSizeOption) => void
}

const GaragePagination = ({
  page,
  totalPages,
  total,
  pageSize,
  disabled,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) =>
  Boolean(total) && (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button
          aria-label="Previous page"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          variant="outlined"
        >
          Previous
        </Button>
        <Button
          aria-label="Next page"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          variant="outlined"
        >
          Next
        </Button>
      </div>
      <Text variant="mono">
        Page {page} of {totalPages}
      </Text>
      <span className="font-mono text-xs text-zinc-500">
        Showing <PageSizePopover onChange={onPageSizeChange} value={pageSize} /> of {total} result
        {total === 1 ? '' : 's'}
      </span>
    </nav>
  )

export const GarageResults = () => {
  const searchTerm = useSearchStore((state) => state.searchTerm)
  const hasFilters = useGarageFiltersStore(hasActiveGarageFilters)
  const hasQueryParams = searchTerm.length > 0 || hasFilters
  const debouncedSearch = useDebouncedValue(searchTerm, 200)
  const isDebouncing = searchTerm !== debouncedSearch

  const page = usePaginationStore((state) => state.page)
  const setPage = usePaginationStore((state) => state.setPage)
  const pageSize = usePaginationStore((state) => state.pageSize)
  const setPageSize = usePaginationStore((state) => state.setPageSize)

  const { data, isLoading, isFetching, isPlaceholderData } = useGarageSnippets(debouncedSearch)

  const snippets = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  // Only spin on first load (no data yet) or while debouncing a new search term.
  const showSpinner = isDebouncing || (isLoading && !data)
  // Show no-results when query/filters are active, we have a settled result, and it's empty.
  const hasActiveQuery = hasQueryParams
  const showNotFound = !showSpinner && !isFetching && hasActiveQuery && snippets.length === 0

  // Arrow-key prev / next page navigation
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
        setPage(page - 1)
      } else if (event.key === 'ArrowRight' && page < totalPages) {
        event.preventDefault()
        setPage(page + 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [page, totalPages, setPage])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <h1 className="text-xs font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
        {hasQueryParams ? 'Search results' : 'Recently added'}
      </h1>

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
          onPageChange={setPage}
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
