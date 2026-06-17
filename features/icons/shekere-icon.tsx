import { type Icon } from '@/features/icons/types'
import { cn } from '@/features/theme/cn'

const shellFillClass = 'fill-[#af8545] dark:fill-[#1B1B1A]'
const shellStrokeClass = 'stroke-[#9a7640] dark:stroke-[#1B1B1A]'

export const ShekereIcon: Icon = ({ className, ...props }) => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden
    className={className}
    {...props}
  >
    <g clipPath="url(#shekere-icon-clip)">
      <path
        d="M22.5511 15.457C29.9274 4.77858 -2.76483 33.2726 0.748637 35.3382C4.2621 37.4038 15.1749 26.1353 22.5511 15.457Z"
        fill="#F9C926"
      />
      <path
        d="M29.8675 23.2864C12.3708 38.5464 1.22379 15.101 11.8109 4.7744C22.3979 -5.55224 47.3641 8.0263 29.8675 23.2864Z"
        fill="#F9C926"
      />
      <g className={shellFillClass}>
        <circle cx="19.1738" cy="8.72652" r="1.8602" transform="rotate(45.7134 19.1738 8.72652)" />
        <circle cx="22.5283" cy="21.0459" r="1.8602" transform="rotate(45.7134 22.5283 21.0459)" />
        <circle cx="27.7675" cy="22.8651" r="1.8602" transform="rotate(45.7134 27.7675 22.8651)" />
        <circle cx="17.311" cy="17.473" r="1.8602" transform="rotate(45.7134 17.311 17.473)" />
        <circle cx="13.8691" cy="12.1684" r="1.8602" transform="rotate(45.7134 13.8691 12.1684)" />
        <circle cx="13.9565" cy="5.15364" r="1.8602" transform="rotate(45.7134 13.9565 5.15364)" />
        <circle cx="18.9555" cy="26.2632" r="1.8602" transform="rotate(45.7134 18.9555 26.2632)" />
        <circle cx="13.7381" cy="22.6904" r="1.8602" transform="rotate(45.7134 13.7381 22.6904)" />
        <circle cx="10.2963" cy="17.3857" r="1.8602" transform="rotate(45.7134 10.2963 17.3857)" />
        <circle cx="8.62996" cy="10.3491" r="1.8602" transform="rotate(45.7134 8.62996 10.3491)" />
        <circle cx="20.1271" cy="2.59957" r="1.8602" transform="rotate(45.7134 20.1271 2.59957)" />
        <circle cx="34.8696" cy="15.9377" r="1.8602" transform="rotate(45.7134 34.8696 15.9377)" />
        <circle cx="28.7645" cy="13.2308" r="1.8602" transform="rotate(45.7134 28.7645 13.2308)" />
        <circle cx="25.3226" cy="7.92607" r="1.8602" transform="rotate(45.7134 25.3226 7.92607)" />
        <circle cx="22.6157" cy="14.0312" r="1.8602" transform="rotate(45.7134 22.6157 14.0312)" />
        <circle cx="27.833" cy="17.6041" r="1.8602" transform="rotate(45.7134 27.833 17.6041)" />
      </g>
      <g className={cn(shellStrokeClass, 'fill-none')} strokeWidth="0.5">
        <path d="M20.6147 -1.34076C14.2912 13.489 25.6136 19.7688 36.1794 16.3925" />
        <path d="M13.9893 2.52313C11.1731 17.3966 22.4344 25.0722 31.2858 22.0319" />
        <path d="M9.53957 7.72952C8.44462 20.3987 14.9933 27.5293 24.2056 27.2056" />
      </g>
    </g>
    <defs>
      <clipPath id="shekere-icon-clip">
        <rect width="36" height="36" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
