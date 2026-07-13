import { NoteBracketPaths } from '@/features/icons/note-bracket-icon'
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
    <NoteBracketPaths />
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
