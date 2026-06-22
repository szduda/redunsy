'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { CreatorFlow } from '@/features/editor/creator-flow'
import { useEditorStore } from '@/features/editor/editor.store'
import { RhythmEditor } from '@/features/editor/rhythm-editor'
import { RhythmPicker } from '@/features/editor/rhythm-picker'
import { readMyRhythms } from '@/features/rhythm/my-rhythms-storage'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

type EditorPageProps = {
  slug?: string
}

export const EditorPage = ({ slug }: EditorPageProps) => {
  const router = useRouter()
  const hydrated = useEditorStore((state) => state.hydrated)
  const view = useEditorStore((state) => state.view)
  const activeSlug = useEditorStore((state) => state.activeSlug)
  const hydrateFromStorage = useEditorStore((state) => state.hydrateFromStorage)
  const openRhythm = useEditorStore((state) => state.openRhythm)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  useEffect(() => {
    if (!hydrated || !slug) return
    openRhythm(slug)
  }, [hydrated, openRhythm, slug])

  useEffect(() => {
    if (!hydrated || slug) return
    if (view === 'editor' && activeSlug) {
      router.replace(`/editor/${activeSlug}`)
    }
  }, [activeSlug, hydrated, router, slug, view])

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <span className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </div>
    )
  }

  if (slug && !readMyRhythms()[slug]) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Text>Rhythm not found.</Text>
        <Button href="/editor" variant="outlined">
          Back to My Rhythms
        </Button>
      </div>
    )
  }

  if (view === 'picker') return <RhythmPicker />
  if (view === 'creator') return <CreatorFlow />
  return <RhythmEditor />
}
