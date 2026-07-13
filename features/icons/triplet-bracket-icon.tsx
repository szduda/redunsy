import type { IconProps } from '@/features/icons/types'

type TripletBracketIconProps = IconProps & {
  largeLabel?: boolean
}

export const TripletBracketIcon = ({ largeLabel = false, ...props }: TripletBracketIconProps) => (
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
      fontSize={largeLabel ? 11 : 7}
      fontWeight={largeLabel ? 700 : 400}
      stroke="none"
      textAnchor="middle"
      x="12"
      y={largeLabel ? 10 : 9}
    >
      3
    </text>
  </svg>
)
