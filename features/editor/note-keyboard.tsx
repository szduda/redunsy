'use client'

import {
  getSelectedFlatNote,
  getSelectionEditKind,
} from '@/features/editor/notation/bar-note-edits'
import type { NoteSelection } from '@/features/editor/notation/bar-note-edits'
import { instrumentSounds } from '@/features/editor/instrument-sounds'
import { NoteGlyphIcon } from '@/features/editor/note-glyph-icon'
import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'

type NoteKeyboardProps = {
  bars: string[]
  instrument: string
  selection: NoteSelection | null
  onSelectSound: (sound: string) => void
  onConvertToSixteenth: () => void
  onConvertToTriplet: () => void
  onConvertToEighth: () => void
}

const noSelectionClass = 'pointer-events-none opacity-30 saturate-0'

export const NoteKeyboard = ({
  bars,
  instrument,
  selection,
  onSelectSound,
  onConvertToSixteenth,
  onConvertToTriplet,
  onConvertToEighth,
}: NoteKeyboardProps) => {
  const hasSelection = selection !== null
  const selected = hasSelection ? getSelectedFlatNote(bars, selection) : null
  const editKind = hasSelection
    ? getSelectionEditKind(bars[selection.barIndex] ?? '', selection.glyphIndex)
    : null
  const sounds = instrumentSounds(instrument)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-zinc-200/60 px-1 py-3 dark:border-zinc-800/60 md:px-0',
        !hasSelection && noSelectionClass,
      )}
    >
      <div className="flex flex-wrap gap-2">
        {sounds.map((sound) => (
          <button
            key={sound}
            aria-disabled={!hasSelection}
            aria-label={`Set note to ${sound}`}
            className={cn(
              'flex size-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition-colors hover:border-yellowy hover:bg-yellowy/10 dark:border-zinc-700 dark:bg-zinc-900',
              selected?.note === sound && 'border-yellowy ring-2 ring-yellowy/40',
            )}
            onClick={() => hasSelection && onSelectSound(sound)}
            type="button"
          >
            <NoteGlyphIcon instrument={instrument} note={sound} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!hasSelection || editKind !== 'plain'}
          onClick={onConvertToSixteenth}
          variant="outlined"
        >
          16th
        </Button>
        <Button
          disabled={!hasSelection || editKind !== 'plain'}
          onClick={onConvertToTriplet}
          variant="outlined"
        >
          Triplet
        </Button>
        <Button
          disabled={!hasSelection || (editKind !== 'sixteenth' && editKind !== 'triplet')}
          onClick={onConvertToEighth}
          variant="outlined"
        >
          8th
        </Button>
      </div>
    </div>
  )
}
