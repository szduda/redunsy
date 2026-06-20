'use client'

import { hasActiveGarageFilters, useGarageFiltersStore } from '@/features/garage/garage-filters.store'
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
  const canClear = searchTerm.length > 0 || hasFilters

  const clearAll = () => {
    clearSearchTerm()
    clearFilters()
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          aria-label="Search sheets"
          className="w-full pl-9"
          onChange={({ target }) => setSearchTerm(target.value)}
          placeholder={placeholder}
          type="search"
          value={searchTerm}
        />
      </div>
      <Button
        aria-label="Clear search and filters"
        className="rounded-full enabled:text-redy enabled:hover:text-redy-light"
        disabled={!canClear}
        onClick={clearAll}
        variant="subtle"
      >
        <CloseIcon />
      </Button>
    </div>
  )
}
