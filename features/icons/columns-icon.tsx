import type { Icon } from '@/features/icons/types'

export const ColumnsIcon: Icon = ({ className, ...props }) => (
  <svg
    aria-hidden
    className={className ?? 'size-6'}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M4 5h4v14H4V5zm6 0h4v14h-4V5zm6 0h4v14h-4V5z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
