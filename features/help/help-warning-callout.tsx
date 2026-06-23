import type { ReactNode } from 'react'

import { WarningIcon } from '@/features/icons/warning-icon'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type HelpWarningCalloutProps = {
  children: ReactNode
  className?: string
}

export const HelpWarningCallout = ({ children, className }: HelpWarningCalloutProps) => (
  <div className={cn('flex gap-3 rounded-md border border-yellowy/30 bg-blacky/5 p-4', className)}>
    <WarningIcon className="mt-0.5 size-5 shrink-0 text-yellowy" />
    <Text className="text-pretty leading-relaxed text-zinc-800 dark:text-zinc-200">{children}</Text>
  </div>
)
