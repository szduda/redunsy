'use client'

import { useEffect, useState } from 'react'

import {
  hasActiveGarageFilters,
  useGarageFiltersStore,
} from '@/features/garage/garage-filters.store'
import { CloseIcon } from '@/features/icons/close-icon'
import { SearchIcon } from '@/features/icons/search-icon'
import { useSearchStore } from '@/features/store/search.store'
import { Button } from '@/features/theme/button'
import { Input } from '@/features/theme/input'
import { cn } from '@/features/theme/cn'

type GarageSearchInputProps = {
  className?: string
  placeholder?: string
}

export const GarageSearchInput = ({
  className,
  placeholder = 'Search sheets...',
}: GarageSearchInputProps) => {
  const searchTerm = useSearchStore((state) => state.searchTerm)
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm)
  const clearSearchTerm = useSearchStore((state) => state.clearSearchTerm)
  const clearFilters = useGarageFiltersStore((state) => state.clearFilters)
  const hasFilters = useGarageFiltersStore(hasActiveGarageFilters)
  const canClear = searchTerm.trim().length > 0 || hasFilters

  // Local draft keeps raw input (with spaces) while the Zustand store holds the
  // trimmed value used for URL serialisation and search queries.
  const [draft, setDraft] = useState(searchTerm)

  // Sync draft when the search term changes from an external source (URL navigation,
  // clear button) but not when we ourselves just updated the store.
  useEffect(() => {
    setDraft((prev) => {
      // Only overwrite when the external value differs from the trimmed draft,
      // i.e. the change came from outside (not from our own typing).
      if (prev.trim() !== searchTerm) return searchTerm
      return prev
    })
  }, [searchTerm])

  const clearAll = () => {
    clearSearchTerm()
    clearFilters()
    setDraft('')
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          aria-label="Search sheets"
          className="w-full pl-9"
          onChange={({ target }) => {
            const value = target.value
            setDraft(value)
            setSearchTerm(value.trim())
          }}
          placeholder={placeholder}
          type="search"
          value={draft}
        />
      </div>
      {canClear && (
        <Button
          aria-label="Clear search and filters"
          className="rounded-full enabled:text-redy enabled:hover:text-redy-light"
          onClick={clearAll}
          variant="subtle"
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  )
}
