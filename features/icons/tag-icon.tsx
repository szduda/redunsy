import type { Icon } from '@/features/icons/types'

export const TagIcon: Icon = ({ className, ...props }) => (
  <svg
    aria-hidden
    className={className ?? 'size-5 shrink-0 block'}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M9.57 3H5.25A2.25 2.25 0 0 0 3 5.25v4.32c0 .59.24 1.16.66 1.59l9.58 9.58c.7.7 1.78.87 2.61.33a18.1 18.1 0 0 0 5.22-5.22c.54-.83.37-1.91-.33-2.61L11.16 3.66A2.25 2.25 0 0 0 9.57 3Z"
      strokeLinejoin="round"
    />
    <path d="M6.75 6.75h.01" strokeLinecap="round" strokeWidth={2.5} />
    <circle cx="6.75" cy="6.75" fill="currentColor" r="1.1" stroke="none" />
  </svg>
)
