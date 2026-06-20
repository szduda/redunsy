'use client'

import { useRouter } from 'next/navigation'

import { EditIcon } from '@/features/icons/edit-icon'
import { copyRhythmToMyRhythms, findRhythmBySlug } from '@/features/rhythm/rhythm-catalog'
import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'

type RhythmEditorButtonProps = {
  slug: string
  userOwned?: boolean
  className?: string
}

export const RhythmEditorButton = ({ slug, userOwned, className }: RhythmEditorButtonProps) => {
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

  return (
    <Button
      aria-label="Copy to editor"
      className={cn('rounded-full', className)}
      onClick={() => {
        const rhythm = findRhythmBySlug(slug)
        if (!rhythm) return
        const saved = copyRhythmToMyRhythms(rhythm)
        router.push(`/editor?rhythm=${saved.slug}`)
      }}
      variant="subtle"
    >
      <EditIcon />
    </Button>
  )
}
