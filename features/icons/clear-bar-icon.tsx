import type { Icon } from '@/features/icons/types'

export const ClearBarIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    viewBox="0 0 24 24"
    {...props}
  >
    <rect height="10" rx="1" width="16" x="4" y="7" />
    <path d="M8 11h8M8 14h5" strokeLinecap="round" />
  </svg>
)
