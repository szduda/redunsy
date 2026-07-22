import type { ReactElement } from 'react'

import type { GrooveSymbol } from '@/lib/midinike/groove/groove-symbols'
import { cn } from '@/features/theme/cn'

const iconClass = 'size-full stroke-[3]'

const DotIcon = () => (
  <svg aria-hidden className={iconClass} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg aria-hidden className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg aria-hidden className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DoubleChevronLeftIcon = () => (
  <svg aria-hidden className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M18 6 12 12l6 6M12 6 6 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DoubleChevronRightIcon = () => (
  <svg aria-hidden className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m6 6 6 6-6 6m6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SWING_PATTERN_ICON: Record<GrooveSymbol, () => ReactElement> = {
  '-': DotIcon,
  '(': ChevronLeftIcon,
  '<': DoubleChevronLeftIcon,
  '>': DoubleChevronRightIcon,
  ')': ChevronRightIcon,
}

type SwingPatternIconProps = {
  symbol: GrooveSymbol
  className?: string
}

export const SwingPatternIcon = ({ symbol, className }: SwingPatternIconProps) => {
  const Icon = SWING_PATTERN_ICON[symbol]
  return (
    <span className={cn('flex size-5 items-center justify-center font-black', className)}>
      <Icon />
    </span>
  )
}
