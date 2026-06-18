'use client'

import { GarageFilters } from '@/features/garage/garage-filters'
import { GarageResults } from '@/features/garage/garage-results'
import { GarageSearchInput } from '@/features/garage/garage-search-input'
import { useTopNavSticky } from '@/features/layout/use-top-nav-sticky'

export const GaragePage = () => {
  useTopNavSticky(true)

  return (
    <main className="mx-auto w-full max-w-8xl flex-1 px-3 py-6 md:px-4 lg:py-8">
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_1.618fr] lg:items-start">
      <aside className="flex h-min flex-col gap-6 lg:sticky lg:top-14 lg:max-h-[calc(100dvh-3.5rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
        <GarageSearchInput />
        <GarageFilters />
      </aside>

      <section className="min-w-0">
        <GarageResults />
      </section>
    </div>
  </main>
  )
}
