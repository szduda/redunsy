import type { Icon } from '@/features/icons/types'

export const UserIcon: Icon = ({ className, ...props }) => (
  <svg
    aria-hidden
    className={className ?? 'size-5 shrink-0 block'}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="3 2 18 21"
    {...props}
  >
    <circle cx="12" cy="7.75" r="3.75" />
    <path
      d="M5.25 21c1.05-3.35 3.35-5.35 6.75-5.35s5.7 2 6.75 5.35"
      strokeLinecap="round"
    />
  </svg>
)
