import type { Icon } from '@/features/icons/types'

export const ForkIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="6" cy="6" r="2.25" />
    <circle cx="6" cy="18" r="2.25" />
    <circle cx="18" cy="12" r="2.25" />
    <path
      d="M6 8.25v7.5M8.25 6h5.5a4.5 4.5 0 0 1 4.5 4.5v1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
