'use client'

import { useRouter } from 'next/navigation'

import { EditIcon } from '@/features/icons/edit-icon'
import { copyRhythmToMyRhythms, findRhythmBySlug } from '@/features/rhythm/rhythm-catalog'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'

type RhythmEditorButtonProps = {
  slug: string
  userOwned?: boolean
  /** In-memory rhythm (static rhythm page) so public rhythms can be copied without DB access. */
  rhythm?: Rhythm
  className?: string
}

export const RhythmEditorButton = ({
  slug,
  userOwned,
  rhythm,
  className,
}: RhythmEditorButtonProps) => {
  const router = useRouter()

  if (userOwned) {
    return (
      <Button
        aria-label="Open in editor"
        className={cn('rounded-full', className)}
        href={`/editor?rhythm=${slug}`}
        variant="subtle"
      >
        <EditIcon />
      </Button>
    )
  }

  // Without the rhythm in hand (e.g. a garage list card) the patterns live only
  // in Postgres, so send the user to the static rhythm page where they can copy.
  if (!rhythm) {
    return (
      <Button
        aria-label="Open rhythm"
        className={cn('rounded-full', className)}
        href={`/rhythm/${slug}`}
        variant="subtle"
      >
        <EditIcon />
      </Button>
    )
  }

  return (
    <Button
      aria-label="Copy to editor"
      className={cn('rounded-full', className)}
      onClick={() => {
        const source = findRhythmBySlug(slug) ?? rhythm
        const saved = copyRhythmToMyRhythms(source)
        router.push(`/editor?rhythm=${saved.slug}`)
      }}
      variant="subtle"
    >
      <EditIcon />
    </Button>
  )
}
