import type { Icon } from '@/features/icons/types'

export const MinusIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M5 12h14" strokeLinecap="round" />
  </svg>
)
