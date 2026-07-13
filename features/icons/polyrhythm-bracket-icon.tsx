import type { Icon } from '@/features/icons/types'

export const PolyrhythmBracketIcon: Icon = (props) => (
  <svg
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M6 14V11M18 14V11" strokeLinecap="round" />
    <path d="M6 11h12" strokeLinecap="round" strokeWidth={3} />
    <text
      fill="currentColor"
      fontFamily="ui-monospace, monospace"
      fontSize="6"
      stroke="none"
      textAnchor="middle"
      x="12"
      y="9"
    >
      4:3
    </text>
  </svg>
)
