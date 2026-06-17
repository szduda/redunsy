import type { Icon } from '@/features/icons/types'

export const TripletBracketIcon: Icon = (props) => (
  <svg
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M6 14V11M18 14V11" strokeLinecap="round" />
    <path d="M6 11h12" strokeLinecap="round" />
    <text
      fill="currentColor"
      fontFamily="ui-monospace, monospace"
      fontSize="7"
      stroke="none"
      textAnchor="middle"
      x="12"
      y="9"
    >
      3
    </text>
  </svg>
)
