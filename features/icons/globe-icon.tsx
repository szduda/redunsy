import type { Icon } from '@/features/icons/types'

export const GlobeIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" strokeLinecap="round" />
  </svg>
)
