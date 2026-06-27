'use client'

import { flamDefForSymbol } from '@/features/editor/flam-sounds'
import { cn } from '@/features/theme/cn'

type NoteGlyphIconProps = {
  instrument: string
  note: string
  className?: string
}

const holeClass = 'fill-zinc-50 dark:fill-zinc-900'

const strokeGlyph = (stroke: string, cx: number, cy: number, radius: number) => {
  if (stroke === 'b') return <circle className="fill-current" cx={cx} cy={cy} r={radius} />
  if (stroke === 't') {
    return (
      <>
        <circle className="fill-current" cx={cx} cy={cy} r={radius} />
        <circle className={holeClass} cx={cx} cy={cy} r={radius * 0.55} />
      </>
    )
  }
  return (
    <>
      <circle className="fill-current" cx={cx} cy={cy} r={radius} />
      <circle className={holeClass} cx={cx} cy={cy} r={radius * 0.55} />
      <path
        className="stroke-current"
        d={`M${cx - radius * 0.55} ${cy - radius * 0.55} L${cx + radius * 0.55} ${cy + radius * 0.55} M${cx + radius * 0.55} ${cy - radius * 0.55} L${cx - radius * 0.55} ${cy + radius * 0.55}`}
        fill="none"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </>
  )
}

const renderFlamGlyph = (grace: string, main: string) => (
  <>
    {strokeGlyph(grace, 10, 10, 5)}
    {strokeGlyph(main, 14, 14, 5)}
  </>
)

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
          <circle className={holeClass} cx="12" cy="12" r="4" />
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
          <circle className={holeClass} cx="12" cy="12" r="4" />
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
    case 'r': {
      const flam = flamDefForSymbol(note)
      return flam ? renderFlamGlyph(flam.grace, flam.main) : null
    }

    default: {
      const flam = flamDefForSymbol(note)
      if (flam) return renderFlamGlyph(flam.grace, flam.main)
      return <circle className="fill-current" cx="12" cy="12" r="2" />
    }
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
