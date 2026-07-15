'use client'

import { PRIVATE_GARAGE_FILTERS } from '@/features/garage/garage-filter-presets'
import { GarageResults } from '@/features/garage/garage-results'
import { useEditorStore } from '@/features/editor/editor.store'
import { Button } from '@/features/theme/button'

export const RhythmPicker = () => {
  const startCreator = useEditorStore((state) => state.startCreator)

  return (
    <div className="mx-auto flex w-full max-w-2xl xl:max-w-3xl flex-col gap-4 p-4 md:pt-4 xl:px-6 xl:pt-6 md:p-0">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-fit justify-between">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your Rhythms</h1>
          <Button
            className="px-2 py-1 text-xs opacity-50 hover:opacity-100"
            href="/garage?ownership=private"
            variant="outlined"
          >
            Browse in Garage
          </Button>
        </div>

        <Button
          className="font-semibold !bg-greeny-light text-white hover:!bg-greeny-lighter dark:text-zinc-900 w-full my-6 md:my-0 md:w-fit"
          onClick={startCreator}
          variant="filled"
        >
          New rhythm
        </Button>
      </div>

      <GarageResults filters={PRIVATE_GARAGE_FILTERS} searchTerm="" showHeading={false} />
    </div>
  )
}
