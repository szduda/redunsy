import type { Icon } from '@/features/icons/types'

export const ChevronDownIcon: Icon = ({ className, ...props }) => (
  <svg
    aria-hidden
    className={className ?? 'size-4'}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
