import { type Icon } from '@/features/icons/types'

export const WarningIcon: Icon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M12 3 2 21h20L12 3Z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path d="M12 9v5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    <circle cx="12" cy="17" fill="currentColor" r="1" />
  </svg>
)
