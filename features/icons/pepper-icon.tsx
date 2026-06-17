import { type FancyIcon } from '@/features/icons/types'
import { cn } from '@/features/theme/cn'

export const PepperIcon: FancyIcon = ({ innerClass, innerClass2, className, ...props }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden className={className} {...props}>
    <g clipPath="url(#pepper-icon-clip)">
      <path
        className={innerClass}
        d="M23.1721 9.30281C18.8264 23.9027 12.5294 30.5698 5.5314 33.3144C3.24328 34.2118 3.10653 35.6752 5.51709 35.1967C16.7034 32.9765 26.5508 25.9165 30.8603 11.9677C31.1529 11.0206 30.6655 10.0108 29.755 9.61899L25.932 7.97387C24.8118 7.49183 23.52 8.13401 23.1721 9.30281Z"
        fill="#F9C926"
        stroke="#F9C926"
        strokeLinecap="round"
      />
      <path
        className={cn('stroke-yellowy dark:stroke-[#142926]', innerClass2)}
        d="M28.8436 9.74091L27.0536 9.01565C26.5094 8.79516 26.2732 8.15616 26.543 7.63442L27.5743 5.64043L29.5064 0.522994C29.9306 -0.600677 31.6154 -0.16495 31.4331 1.02129L30.2125 8.96419C30.1143 9.60303 29.4432 9.98384 28.8436 9.74091Z"
        fill="#F9C926"
        strokeLinecap="round"
      />
    </g>
    <defs>
      <clipPath id="pepper-icon-clip">
        <rect width="36" height="36" rx="2" fill="white" />
      </clipPath>
    </defs>
  </svg>
)
