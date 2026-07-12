'use client'

import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'

import { useEditorStore } from '@/features/editor/editor.store'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

export const RhythmPicker = () => {
  const router = useRouter()
  const rhythms = useEditorStore(useShallow((state) => Object.values(state.rhythms)))
  const openRhythm = useEditorStore((state) => state.openRhythm)
  const startCreator = useEditorStore((state) => state.startCreator)

  const onOpenRhythm = (slug: string) => {
    openRhythm(slug)
    router.push(`/editor/${slug}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 lg:pt-4 xl:px-6 xl:pt-6 md:p-0">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your rhythms</h1>
        <Button onClick={startCreator} variant="outlined">
          New rhythm
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rhythms.map((rhythm) => (
          <button
            key={rhythm.slug}
            className="rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60"
            onClick={() => onOpenRhythm(rhythm.slug)}
            type="button"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{rhythm.title}</span>
              <Text className="!text-zinc-500" variant="mono">
                {rhythm.meter}/4
              </Text>
            </div>
            <Text className="mt-1" variant="mono">
              {Object.keys(rhythm.instruments).join(' · ')}
            </Text>
          </button>
        ))}
      </div>
    </div>
  )
}
