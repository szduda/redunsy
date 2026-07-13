import type { IconProps } from '@/features/icons/types'

type PolyrhythmBracketIconProps = IconProps & {
  largeLabel?: boolean
}

export const PolyrhythmBracketIcon = ({
  largeLabel = false,
  ...props
}: PolyrhythmBracketIconProps) => (
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
      fontSize={largeLabel ? 10 : 6}
      fontWeight={largeLabel ? 700 : 400}
      stroke="none"
      textAnchor="middle"
      x="12"
      y={largeLabel ? 10 : 9}
    >
      4:3
    </text>
  </svg>
)
