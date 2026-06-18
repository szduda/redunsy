import type { Icon } from '@/features/icons/types'

export const CloseIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
  </svg>
)
