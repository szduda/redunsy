import type { Icon } from '@/features/icons/types'

export const MenuIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-6"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
