import type { ReactNode } from 'react'

import { cn } from '@/features/theme/cn'

export const HELP_CONTENT_CLASS = 'mx-auto w-full max-w-3xl px-4 md:px-6'

type HelpContentProps = {
  children: ReactNode
  className?: string
}

export const HelpContent = ({ children, className }: HelpContentProps) => (
  <div className={cn(HELP_CONTENT_CLASS, className)}>{children}</div>
)

type HelpTileProps = {
  children: ReactNode
  className?: string
}

export const HelpTile = ({ children, className }: HelpTileProps) => (
  <div className={cn('w-full', className)}>
    <div className={HELP_CONTENT_CLASS}>{children}</div>
  </div>
)
