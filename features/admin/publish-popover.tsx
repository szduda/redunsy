'use client'

import { useState } from 'react'

import { publishSlugFromRhythm } from '@/features/admin/publish-slug'
import { PublishSlugInput } from '@/features/admin/publish-slug-input'
import { usePublishRhythm } from '@/features/admin/use-publish-rhythm'
import { useToast } from '@/features/admin/toasts'
import type { IndexRefreshStatus } from '@/features/admin/admin-api'
import { Popover } from '@/features/groovy-player/popover'
import { DeployIcon } from '@/features/icons/deploy-icon'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import { Switch } from '../theme/switch'

type PublishPopoverProps = {
  rhythm: Rhythm
}

const indexRefreshToast = (status: IndexRefreshStatus) => {
  if (status === 'queued') return 'Garage index redeploy queued'
  if (status === 'not-configured') {
    return 'Garage index redeploy not configured (set VERCEL_DEPLOY_HOOK_URL and redeploy)'
  }
  return 'Garage index redeploy failed — garage cards may stay stale until the next deploy'
}

export const PublishPopover = ({ rhythm }: PublishPopoverProps) => {
  const { pushToast } = useToast()
  const [slug, setSlug] = useState(() => publishSlugFromRhythm(rhythm))
  const [error, setError] = useState<string | null>(null)
  const [safetyToggle, setSafetyToggle] = useState(false)
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
          pushToast('Rhythm page revalidated', 'success')
          pushToast(
            indexRefreshToast(payload.indexRefresh),
            payload.indexRefresh === 'failed' ? 'error' : 'success',
          )
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
        <div className="flex w-full flex-col gap-2 p-2 md:w-96">
          <PublishSlugInput onChange={setSlug} value={slug} />

          {error ? (
            <Text className="text-red-600 dark:text-red-400" variant="mono">
              {error}
            </Text>
          ) : null}

          <div className="flex justify-between items-center">
            <Switch
              checked={safetyToggle}
              onChange={setSafetyToggle}
              label="I know what I'm doing"
              reversed
              labelClassName="dark:!text-yellowy-light !text-xs font-semibold uppercase"
            />
            <Button
              disabled={isPending || !safetyToggle}
              onClick={() => onSubmit(close)}
              variant="filled"
              className="md:w-fit bg-yellowy dark:bg-yellowy-light hover:bg-yellowy/80 dark:hover:bg-yellowy-light/80"
            >
              {isPending ? 'Publishing…' : 'Publish'}
            </Button>
          </div>
        </div>
      )}
      panelClassName="w-auto max-md:!left-0 max-md:!w-[100dvw] max-md:!translate-x-0 max-md:rounded-none max-md:border-x-0 max-md:!right-0 !bg-yellowy/50 dark:!bg-yellowy/15 backdrop-blur-xl"
      preferredDirection="right"
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
