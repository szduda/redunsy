import type { Icon } from '@/features/icons/types'

export const HelpIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-6"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 2-3 4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="17" fill="currentColor" r="0.75" stroke="none" />
    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
