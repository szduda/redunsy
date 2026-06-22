import { type ReactNode } from 'react'

import { cn } from '@/features/theme/cn'

type FixedSideActionsProps = {
  children: ReactNode
  className?: string
}

export const FIXED_SIDE_ACTIONS_CLASS =
  'flex w-fit flex-col gap-2 xl:fixed mt-3 md:mt-0 md:left-4 md:top-16 md:z-20'

export const FixedSideActions = ({ children, className }: FixedSideActionsProps) => (
  <div className={cn(FIXED_SIDE_ACTIONS_CLASS, className)}>{children}</div>
)
