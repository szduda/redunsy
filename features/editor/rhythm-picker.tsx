'use client'

import { PRIVATE_GARAGE_FILTERS } from '@/features/garage/garage-filter-presets'
import { GarageResults } from '@/features/garage/garage-results'
import { useEditorStore } from '@/features/editor/editor.store'
import { Button } from '@/features/theme/button'

export const RhythmPicker = () => {
  const startCreator = useEditorStore((state) => state.startCreator)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 lg:pt-4 xl:px-6 xl:pt-6 md:p-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your Rhythms</h1>
          <Button className="px-2 py-1 text-xs" href="/garage?ownership=private" variant="outlined">
            Browse in Garage
          </Button>
        </div>
        <Button onClick={startCreator} variant="outlined">
          New rhythm
        </Button>
      </div>

      <GarageResults filters={PRIVATE_GARAGE_FILTERS} searchTerm="" showHeading={false} />
    </div>
  )
}
