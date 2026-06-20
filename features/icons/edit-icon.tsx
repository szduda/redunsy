import type { Icon } from '@/features/icons/types'

export const EditIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M16.862 4.487 19.5 7.125a1.125 1.125 0 0 1 0 1.591l-9.9 9.9a4.5 4.5 0 0 1-1.591.353H7.125a.75.75 0 0 1-.75-.75v-2.284a4.5 4.5 0 0 1 .353-1.591l9.9-9.9a1.125 1.125 0 0 1 1.591 0Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M15 6 18 9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
