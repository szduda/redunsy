import type { Icon } from '@/features/icons/types'

/** Classic pyramid metronome — upright body, wind-up cap, tempo ticks, angled pendulum. */
export const MetronomeIcon: Icon = ({ className, ...props }) => (
  <svg
    aria-hidden
    className={className ?? 'size-5 shrink-0 block'}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M4.5 20.75h15" />
    <path d="M5 20.75 8.75 5.25h6.5L19 20.75" />
    <path d="M8.75 5.25h6.5" />
    <path d="M12 5.25V3.75" />
    <path d="M10.5 3.75h3" />
    <path d="M12 7.75V19" strokeOpacity={0.22} />
    <path d="M9.25 9.5h2M9.25 12.5h2.5M9.25 15.5h2.25" strokeOpacity={0.45} />
    <path d="M12 7.75 8.25 16.85" />
    <circle cx="12" cy="7.75" fill="currentColor" r="0.55" stroke="none" />
    <circle cx="8.25" cy="16.85" fill="currentColor" r="1.15" stroke="none" />
  </svg>
)
