import type { Icon } from '@/features/icons/types'

export const DeployIcon: Icon = (props) => (
  <svg
    aria-hidden
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.25 2.35 3.5 5.25 3.5 8.5s-1.25 6.15-3.5 8.5M12 3.5C9.75 5.85 8.5 8.75 8.5 12s1.25 6.15 3.5 8.5M5.75 6.25c1.55.85 3.7 1.35 6.25 1.35s4.7-.5 6.25-1.35M5.75 17.75c1.55-.85 3.7-1.35 6.25-1.35s4.7.5 6.25 1.35" />
  </svg>
)
