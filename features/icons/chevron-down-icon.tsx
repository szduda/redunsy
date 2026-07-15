import type { Icon } from '@/features/icons/types'
import { cn } from '@/features/theme/cn'

export const ChevronDownIcon: Icon = ({ className, ...props }) => (
  <svg
    aria-hidden
    className={cn('size-4', className)}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
