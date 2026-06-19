'use client'

import { type FC } from 'react'

import { cn } from '@/features/theme/cn'
import { type FancyIconProps } from '@/features/icons/types'

type LogoIconProps = FancyIconProps & {
  onStickClick?: () => void
}

const drumClass = 'saturate-80 contrast-150 brightness-70 dark:saturate-100 dark:contrast-100 dark:brightness-100'

export const LogoIcon: FC<LogoIconProps> = ({
  onStickClick = () => null,
  innerClass,
  innerClass2,
  ...props
}) => (
  <svg
    height="36"
    viewBox="-4 0 76 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Website logo: two dundun drums pictured from above with a stick over the bigger drum on the right."
    {...props}
  >
    <circle cx="48" cy="26" r="18.5" stroke="#f9c926aa" strokeWidth="3" className={drumClass} />
    <circle
      cx="48"
      cy="26"
      r="14"
      fill="#f9c92644"
      stroke="#f9c926aa"
      className={cn(innerClass2, drumClass)}
    />
    <circle cx="13" cy="27" r="11.5" stroke="#f9c926aa" strokeWidth="3" className={drumClass} />
    <circle cx="13" cy="27" r="8" fill="#f9c92644" stroke="#f9c926aa" className={drumClass} />
    <g className={innerClass}>
      <rect
        x="43.5661"
        y="29.2281"
        width="36.8182"
        height="4"
        rx="2"
        transform="rotate(-137.518 43.5661 29.2281)"
        className="fill-[#af8545] stroke-[#9a7640] dark:fill-[#4A2317] dark:stroke-[#121211AA]"
        strokeWidth="1"
        style={{ cursor: 'pointer' }}
        onClick={onStickClick}
      />
    </g>
    <defs>
      <filter
        id="filter0_d_24_121"
        x="66.3359"
        y="13.1621"
        width="155.728"
        height="37.4902"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_24_121" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_24_121" result="shape" />
      </filter>
    </defs>
  </svg>
)
