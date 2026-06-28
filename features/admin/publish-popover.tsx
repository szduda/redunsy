'use client'

import { useState } from 'react'

import { publishSlugFromRhythm } from '@/features/admin/publish-slug'
import { useToast } from '@/features/admin/toasts'
import { Popover } from '@/features/groovy-player/popover'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { Input } from '@/features/theme/input'
import { Text } from '@/features/theme/text'

type PublishPopoverProps = {
  rhythm: Rhythm
}

export const PublishPopover = ({ rhythm }: PublishPopoverProps) => {
  const { pushToast } = useToast()
  const [slug, setSlug] = useState(() => publishSlugFromRhythm(rhythm))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (close: () => void) => {
    const nextSlug = slugFromTitle(slug)
    if (!nextSlug) {
      setError('Enter a valid slug')
      return
    }

    setSubmitting(true)
    setError(null)
    pushToast('Saving to database…')

    try {
      const response = await fetch('/api/admin/rhythms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: nextSlug, rhythm }),
      })
      const payload = (await response.json()) as { error?: string; url?: string; created?: boolean }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Publish failed')
      }

      pushToast(
        payload.created ? 'Created new published rhythm' : 'Updated published rhythm',
        'success',
      )
      pushToast('Page revalidated and warmed', 'success')
      pushToast(`Live at ${payload.url ?? `/rhythm/${nextSlug}`}`, 'success')
      close()
    } catch (publishError) {
      const message = publishError instanceof Error ? publishError.message : 'Publish failed'
      setError(message)
      pushToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Popover
      panel={({ close }) => (
        <div className="flex w-64 flex-col gap-2 p-2">
          <Text className="font-semibold text-zinc-900 dark:text-zinc-100">Publish as…</Text>
          <Input
            autoComplete="off"
            onChange={(event) => setSlug(event.target.value)}
            placeholder="slug"
            value={slug}
          />
          {error ? (
            <Text className="text-red-600 dark:text-red-400" variant="mono">
              {error}
            </Text>
          ) : null}
          <Button disabled={submitting} onClick={() => onSubmit(close)} variant="filled">
            {submitting ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      )}
      panelClassName="w-auto"
      preferredDirection="bottom"
    >
      {({ toggle }) => (
        <Button className="!justify-start" onClick={toggle} variant="subtle">
          Publish as…
        </Button>
      )}
    </Popover>
  )
}
