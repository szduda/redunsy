import { NoteBracketPaths } from '@/features/icons/note-bracket-icon'
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
    <NoteBracketPaths />
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
