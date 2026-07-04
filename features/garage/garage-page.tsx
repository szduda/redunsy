'use client'

import { GarageFilters } from '@/features/garage/garage-filters'
import { GarageOwnershipFilter } from '@/features/garage/garage-ownership-filter'
import { GarageResults } from '@/features/garage/garage-results'
import { GarageSearchInput } from '@/features/garage/garage-search-input'
import {
  GARAGE_MOBILE_TOOLBAR_STICKY_CLASS,
  TOP_NAV_STICKY_SIDEBAR_LG_CLASS,
} from '@/features/layout/constants'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'
import { cn } from '@/features/theme/cn'

export const GaragePage = () => {
  useTopNavSticky(true)

  return (
    <div className="mx-auto w-full max-w-8xl flex-1 px-3 md:px-4">
      <aside className={GARAGE_MOBILE_TOOLBAR_STICKY_CLASS}>
        <GarageSearchInput />
        <GarageFilters />
      </aside>

      <main className="min-w-0">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_1.618fr] lg:items-start">
          <aside
            className={cn(
              'hidden flex-col lg:flex lg:sticky lg:self-start lg:overflow-y-auto lg:pr-2 lg:py-8',
              TOP_NAV_STICKY_SIDEBAR_LG_CLASS,
            )}
          >
            <div className="flex flex-col gap-6">
              <GarageSearchInput />
              <GarageOwnershipFilter />
              <GarageFilters />
            </div>
          </aside>

          <section className="min-w-0 py-6 lg:py-8">
            <GarageResults />
          </section>
        </div>
      </main>
    </div>
  )
}
