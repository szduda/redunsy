import type { Icon } from '@/features/icons/types'

export const Note8Icon: Icon = (props) => (
  <svg aria-hidden className="size-5" fill="currentColor" viewBox="0 0 24 24" {...props}>
    <ellipse cx="9" cy="18" rx="3.5" ry="3" transform="rotate(-18 9 18)" />
    <rect height="14" rx="0.75" width="1.5" x="11.5" y="3.5" />
    <path
      d="M12.5 3.5c3.5 1.2 5.5 2.8 4.5 5.2"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.6"
    />
  </svg>
)
