'use client'

import { GlobeIcon } from '@/features/icons/globe-icon'
import type { SwingLocale } from '@/features/learn/swing/swing-article.types'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type SwingLanguagePanelProps = {
  message: string
  action: string
  onSwitch: (locale: SwingLocale) => void
  targetLocale: SwingLocale
  className?: string
}

export const SwingLanguagePanel = ({
  message,
  action,
  onSwitch,
  targetLocale,
  className,
}: SwingLanguagePanelProps) => (
  <aside
    aria-label={message}
    className={cn(
      'flex flex-col gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/50',
      className,
    )}
  >
    <div className="flex gap-3">
      <GlobeIcon className="mt-0.5 size-5 shrink-0 text-zinc-500" />
      <Text className="text-pretty leading-relaxed text-zinc-800 dark:text-zinc-200">
        {message}
      </Text>
    </div>
    <Button className="shrink-0 self-start sm:self-auto" onClick={() => onSwitch(targetLocale)}>
      {action}
    </Button>
  </aside>
)
