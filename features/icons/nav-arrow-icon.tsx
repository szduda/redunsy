import type { Icon } from '@/features/icons/types'
import { cn } from '@/features/theme/cn'

export const NavArrowIcon: Icon = ({ className, ...props }) => (
  <svg
    aria-hidden
    className={cn('size-5', className)}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M5 12h12M13 7l5 5-5 5" />
  </svg>
)
