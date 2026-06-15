import { ChevronDownIcon } from '@/features/icons/chevron-down-icon'
import { ChevronUpIcon } from '@/features/icons/chevron-up-icon'
import type { ReactNode } from 'react'

type Props = {
  collapsed: boolean
  children: ReactNode
  onClick: () => void
}

export const CollapseLabel = ({ children, onClick, collapsed }: Props) => (
  <button
    className=
    'flex min-w-0 items-center py-2 gap-0.5 md:gap-1 font-semibold text-zinc-900 dark:text-zinc-100 text-sm md:text-sm w-24 shrink-0'
    onClick={onClick}
    type="button"
  >
    {collapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
    <span className='truncate'>{children}</span>
  </button>
)