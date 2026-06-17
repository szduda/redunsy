import type { Icon } from '@/features/icons/types'

export const SearchIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-6"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="m21 21-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
