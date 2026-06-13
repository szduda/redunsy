import { type Icon } from '@/features/icons/types'

export const SpeakerMutedIcon: Icon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
    <path
      d="M11 5 6 9H3v6h3l5 4V5z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path d="m22 9-6 6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    <path d="m16 9 6 6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
)
