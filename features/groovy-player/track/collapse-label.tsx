import { ChevronDownIcon } from '@/features/icons/chevron-down-icon'
import { ChevronUpIcon } from '@/features/icons/chevron-up-icon'
import type { ReactNode } from 'react'
import { cn } from '@/features/theme/cn'

type Props = {
  collapsed: boolean
  children: ReactNode
  disabled?: boolean
  onClick: () => void
  className?: string
}

export const CollapseLabel = ({ children, onClick, collapsed, disabled, className }: Props) => (
  <button
    className={cn(
      'flex min-w-0 items-center py-2 gap-0.5 md:gap-1 font-semibold text-zinc-900 dark:text-zinc-100 text-sm md:text-sm shrink-0 disabled:opacity-50',
      className,
    )}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
    <span className="truncate">{children}</span>
  </button>
)
