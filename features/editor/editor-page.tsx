'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { CreatorFlow } from '@/features/editor/creator-flow'
import { useEditorStore } from '@/features/editor/editor.store'
import { RhythmEditor } from '@/features/editor/rhythm-editor'
import { RhythmPicker } from '@/features/editor/rhythm-picker'

export const EditorPage = () => {
  const searchParams = useSearchParams()
  const hydrated = useEditorStore((state) => state.hydrated)
  const view = useEditorStore((state) => state.view)
  const hydrateFromStorage = useEditorStore((state) => state.hydrateFromStorage)
  const openRhythm = useEditorStore((state) => state.openRhythm)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  useEffect(() => {
    if (!hydrated) return
    const slug = searchParams.get('rhythm')
    if (slug) openRhythm(slug)
  }, [hydrated, openRhythm, searchParams])

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <span className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    )
  }

  if (view === 'picker') return <RhythmPicker />
  if (view === 'creator') return <CreatorFlow />
  return <RhythmEditor />
}
