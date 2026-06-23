'use client'

import { cn } from '@/features/theme/cn'

type NoteGlyphIconProps = {
  instrument: string
  note: string
  className?: string
}

const holeClass = 'fill-zinc-50 dark:fill-zinc-900'

const renderNoteGlyph = (note: string, instrument: string) => {
  switch (note) {
    case '-':
      return <circle className="fill-current" cx="12" cy="12" r="2" />

    case 'b':
    case 'o':
      return <circle className="fill-current" cx="12" cy="12" r="7" />

    case 't':
      return (
        <>
          <circle className="fill-current" cx="12" cy="12" r="7" />
          <circle className={holeClass} cx="12" cy="12" r="4" />
        </>
      )

    case 's':
      return (
        <>
          <circle className="fill-current" cx="12" cy="12" r="7" />
          <circle className={holeClass} cx="12" cy="12" r="3" />
          <path
            className="stroke-current"
            d="M8 8 L16 16 M16 8 L8 16"
            fill="none"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </>
      )

    case 'x':
      if (instrument === 'stick') {
        return (
          <path
            className="stroke-current"
            d="M12 6 V18"
            fill="none"
            strokeLinecap="round"
            strokeWidth="3"
          />
        )
      }
      if (instrument === 'bell') {
        return (
          <path
            className="stroke-current"
            d="M7 7 L17 17 M17 7 L7 17"
            fill="none"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        )
      }
      return (
        <>
          <circle className="fill-current" cx="12" cy="12" r="7" />
          <circle className={holeClass} cx="12" cy="12" r="3" />
          <path
            className="stroke-current"
            d="M8 8 L16 16 M16 8 L8 16"
            fill="none"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </>
      )

    case 'f':
      return (
        <>
          <circle className="fill-current" cx="10" cy="10" r="5" />
          <circle className={holeClass} cx="10" cy="10" r="2" />
          <path
            className="stroke-current"
            d="M7 7 L13 13 M13 7 L7 13"
            fill="none"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
          <circle className="fill-current" cx="14" cy="14" r="5" />
          <circle className={holeClass} cx="14" cy="14" r="2" />
          <path
            className="stroke-current"
            d="M11 11 L17 17 M17 11 L11 17"
            fill="none"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </>
      )

    case 'r':
      return (
        <>
          <circle className="fill-current" cx="10" cy="10" r="5" />
          <circle className={holeClass} cx="10" cy="10" r="2.5" />
          <circle className="fill-current" cx="14" cy="14" r="5" />
          <circle className={holeClass} cx="14" cy="14" r="2.5" />
        </>
      )

    default:
      return <circle className="fill-current" cx="12" cy="12" r="2" />
  }
}

export const NoteGlyphIcon = ({ note, instrument, className }: NoteGlyphIconProps) => (
  <svg
    aria-hidden
    className={cn('size-6 text-zinc-800 dark:text-zinc-100', className)}
    viewBox="0 0 24 24"
  >
    {renderNoteGlyph(note, instrument)}
  </svg>
)
