'use client'

import { useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'
import type { OwnershipFilter } from '@/features/rhythm/rhythm.types'

const OWNERSHIP_OPTIONS: OwnershipFilter[] = ['all', 'public', 'private']

const DESKTOP_OWNERSHIP_LABELS: Record<OwnershipFilter, string> = {
  all: 'All Rhythms',
  public: 'Site Rhythms',
  private: 'My Rhythms',
}

const MOBILE_OWNERSHIP_LABELS: Record<OwnershipFilter, string> = {
  all: 'All Rhythms',
  public: 'Site Rhythms',
  private: 'My Rhythms',
}

const nextOwnership = (current: OwnershipFilter): OwnershipFilter => {
  const index = OWNERSHIP_OPTIONS.indexOf(current)
  return OWNERSHIP_OPTIONS[(index + 1) % OWNERSHIP_OPTIONS.length]
}

export const GarageOwnershipFilter = () => {
  const ownership = useGarageFiltersStore((state) => state.ownership)
  const setOwnership = useGarageFiltersStore((state) => state.setOwnership)

  const onSelect = (value: OwnershipFilter) => {
    if (ownership === value && value !== 'all') {
      setOwnership('all')
      return
    }
    setOwnership(value)
  }

  return (
    <div className="hidden flex-wrap gap-1.5 lg:flex">
      {OWNERSHIP_OPTIONS.map((value) => {
        const active = ownership === value
        return (
          <button
            key={value}
            aria-pressed={active}
            className={cn(
              KEYBOARD_FOCUS_VISIBLE_CLASS,
              'rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors',
              active
                ? 'bg-greeny-dark text-white dark:bg-greeny-lighter dark:text-zinc-900'
                : 'bg-zinc-50 text-zinc-500 hover:text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:text-zinc-300 opacity-40 hover:opacity-100',
            )}
            onClick={() => onSelect(value)}
            type="button"
          >
            {DESKTOP_OWNERSHIP_LABELS[value]}
          </button>
        )
      })}
    </div>
  )
}

export const GarageOwnershipFilterMobile = () => {
  const ownership = useGarageFiltersStore((state) => state.ownership)
  const setOwnership = useGarageFiltersStore((state) => state.setOwnership)

  return (
    <button
      aria-label={`Rhythm scope: ${MOBILE_OWNERSHIP_LABELS[ownership]}. Click to change.`}
      className={cn(
        KEYBOARD_FOCUS_VISIBLE_CLASS,
        'shrink-0 rounded-md bg-greeny-light px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-white transition-colors active:scale-[0.98]',
      )}
      onClick={() => setOwnership(nextOwnership(ownership))}
      type="button"
    >
      {MOBILE_OWNERSHIP_LABELS[ownership]}
    </button>
  )
}
