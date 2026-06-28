'use client'

import { useState } from 'react'

import { publishSlugFromRhythm } from '@/features/admin/publish-slug'
import { PublishSlugInput } from '@/features/admin/publish-slug-input'
import { usePublishRhythm } from '@/features/admin/use-publish-rhythm'
import { useToast } from '@/features/admin/toasts'
import { Popover } from '@/features/groovy-player/popover'
import { DeployIcon } from '@/features/icons/deploy-icon'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type PublishPopoverProps = {
  rhythm: Rhythm
}

export const PublishPopover = ({ rhythm }: PublishPopoverProps) => {
  const { pushToast } = useToast()
  const [slug, setSlug] = useState(() => publishSlugFromRhythm(rhythm))
  const [error, setError] = useState<string | null>(null)
  const { mutate, isPending } = usePublishRhythm()

  const onSubmit = (close: () => void) => {
    const nextSlug = slugFromTitle(slug)
    if (!nextSlug) {
      setError('Enter a valid slug')
      return
    }

    setError(null)
    pushToast('Saving to database…')

    mutate(
      { slug: nextSlug, rhythm },
      {
        onSuccess: (payload) => {
          pushToast(
            payload.created ? 'Created new published rhythm' : 'Updated published rhythm',
            'success',
          )
          pushToast('Page revalidated and warmed', 'success')
          pushToast(`Live at ${payload.url}`, 'success')
          close()
        },
        onError: (publishError) => {
          const message = publishError instanceof Error ? publishError.message : 'Publish failed'
          setError(message)
          pushToast(message, 'error')
        },
      },
    )
  }

  return (
    <Popover
      panel={({ close }) => (
        <div className="flex w-64 flex-col gap-2 p-2">
          <Text className="font-semibold text-zinc-900 dark:text-zinc-100">Publish as…</Text>
          <PublishSlugInput onChange={setSlug} value={slug} />
          {error ? (
            <Text className="text-red-600 dark:text-red-400" variant="mono">
              {error}
            </Text>
          ) : null}
          <Button disabled={isPending} onClick={() => onSubmit(close)} variant="filled">
            {isPending ? 'Publishing…' : 'Publish'}
          </Button>
        </div>
      )}
      panelClassName="w-auto"
      preferredDirection="bottom"
    >
      {({ toggle, open }) => (
        <Button
          className={cn(
            '!justify-start w-full',
            open &&
              '!text-[#af8545] dark:!text-yellowy-light bg-zinc-200 bg-zinc-200/70 dark:bg-zinc-800/50',
          )}
          onClick={toggle}
          variant="subtle"
        >
          <DeployIcon className="mr-1 size-4" /> Publish as…
        </Button>
      )}
    </Popover>
  )
}
