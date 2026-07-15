import { type ReactNode } from 'react'

import { cn } from '@/features/theme/cn'

type FixedSideActionsPlacement = 'side' | 'above'

type FixedSideActionsProps = {
  children: ReactNode
  className?: string
  placement?: FixedSideActionsPlacement
}

export const FIXED_SIDE_ACTIONS_CLASS =
  'flex w-fit flex-col gap-2 xl:fixed mt-3 md:mt-0 md:left-4 md:top-16 md:z-20'

const ABOVE_PLAYER_ACTIONS_CLASS =
  'flex w-full flex-wrap gap-2 md:pr-24 md:pl-4 lg:pt-4 xl:pt-6'

export const FixedSideActions = ({
  children,
  className,
  placement = 'side',
}: FixedSideActionsProps) => (
  <div
    className={cn(
      placement === 'above' ? ABOVE_PLAYER_ACTIONS_CLASS : FIXED_SIDE_ACTIONS_CLASS,
      className,
    )}
  >
    {children}
  </div>
)
