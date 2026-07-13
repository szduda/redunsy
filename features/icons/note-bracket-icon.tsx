import type { Icon } from '@/features/icons/types'

export const NoteBracketPaths = () => (
  <>
    <path d="M6 14V11M18 14V11" strokeLinecap="round" />
    <path d="M6 11h12" strokeLinecap="round" />
  </>
)

export const NoteBracketIcon: Icon = (props) => (
  <svg
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <NoteBracketPaths />
  </svg>
)
