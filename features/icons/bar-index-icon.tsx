import type { Icon } from '@/features/icons/types'
import { darkCanvasColors } from '@/features/groovy-player/canvas/canvas-colors'

export const BarIndexIcon: Icon = (props) => (
  <svg
    aria-hidden
    fill="currentColor"
    viewBox="0 0 24 24"
    style={{ backgroundColor: darkCanvasColors.b2 }}
    {...props}
  >
    <text fontFamily="ui-monospace, monospace" fontSize="10" textAnchor="middle" x="12" y="20">
      16
    </text>
  </svg>
)
