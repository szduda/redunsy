'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { resolveEncodedRhythmParam } from '@/features/share-rhythm/import/encoded-rhythm-from-url'
import { importSharedRhythm } from '@/features/share-rhythm/import/import-shared-rhythm'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'

export const SharedRhythmImportView = () => {
  const params = useParams<{ encodedRhythm: string }>()
  const router = useRouter()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const encodedRhythm = resolveEncodedRhythmParam(window.location.pathname, params.encodedRhythm)
    if (!encodedRhythm) {
      setFailed(true)
      return
    }

    const imported = importSharedRhythm(encodedRhythm)
    if (!imported) {
      setFailed(true)
      return
    }

    router.replace(`/player?rhythm=${encodeURIComponent(imported.slug)}`)
  }, [params.encodedRhythm, router])

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Text>Could not import this shared rhythm.</Text>
        <Button href="/garage" variant="outlined">
          Back to garage
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-16" aria-busy>
      <Text>Importing shared rhythm…</Text>
    </div>
  )
}
