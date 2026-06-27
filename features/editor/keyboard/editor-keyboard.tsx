'use client'

import { useEffect, useState } from 'react'

import { applyBarPatternAction } from '@/features/editor/canvas/bar-pattern-actions'
import {
  defaultFlamForNote,
  flamMainNote,
  flamSymbolsForInstrument,
  isFlamSymbol,
} from '@/features/editor/flam-sounds'
import { instrumentSounds } from '@/features/editor/instrument-sounds'
import { DisabledHintButton } from '@/features/editor/keyboard/disabled-hint-button'
import {
  flamToggleBackgroundStyle,
  lengthToggleActiveClass,
  noteKeyShadowStyle,
  toneFromEditKind,
  type NoteLengthTone,
} from '@/features/editor/keyboard/note-length-style'
import {
  getSelectedFlatNote,
  getSelectionEditKind,
} from '@/features/editor/notation/bar-note-edits'
import type { NoteSelection } from '@/features/editor/notation/bar-note-edits'
import { NoteGlyphIcon } from '@/features/editor/note-glyph-icon'
import { FlamIcon } from '@/features/icons/flam-icon'
import { Note16Icon } from '@/features/icons/note-16-icon'
import { Note8Icon } from '@/features/icons/note-8-icon'
import { TripletBracketIcon } from '@/features/icons/triplet-bracket-icon'
import { BOTTOM_NAV_OFFSET_CLASS } from '@/features/layout/constants'
import { cn } from '@/features/theme/cn'
import { PRESSABLE_CLASS } from '@/features/theme/pressable'

type EditorKeyboardProps = {
  bars: string[]
  barSize: number
  instrument: string
  selection: NoteSelection | null
  onBarsChange: (bars: string[]) => void
  onNavigate: (direction: -1 | 1) => void
  onSelectSound: (sound: string) => void
  onConvertToSixteenth: () => void
  onConvertToTriplet: () => void
  onConvertToEighth: () => void
}

const keyButtonClass =
  'flex size-11 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50/90 dark:border-zinc-700/80 dark:bg-zinc-900/90'

const roundToggleClass =
  'flex size-11 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50/90 dark:border-zinc-700/80 dark:bg-zinc-900/90'

const NO_SELECTION_HINT = 'Select a note on the canvas first'
const PLAIN_ONLY_HINT = 'Only plain 8th notes can be split'
const EIGHTH_ONLY_HINT = 'Select a 16th or triplet note to merge to 8th'
const PAUSE_FLAM_HINT = 'Flam cannot apply to a rest'

export const EditorKeyboard = ({
  bars,
  barSize,
  instrument,
  selection,
  onBarsChange,
  onNavigate,
  onSelectSound,
  onConvertToSixteenth,
  onConvertToTriplet,
  onConvertToEighth,
}: EditorKeyboardProps) => {
  const hasSelection = selection !== null
  const selected = hasSelection ? getSelectedFlatNote(bars, selection) : null
  const editKind = hasSelection
    ? getSelectionEditKind(bars[selection.barIndex] ?? '', selection.glyphIndex)
    : null
  const tone = toneFromEditKind(editKind)

  const [lengthMode, setLengthMode] = useState<NoteLengthTone>('8th')
  const [flamMode, setFlamMode] = useState(false)

  const flamSymbols = flamSymbolsForInstrument(instrument)
  const allSounds = instrumentSounds(instrument)
  const regularSounds = allSounds.filter((sound) => !flamSymbols.includes(sound) && sound !== '-')
  const visibleSounds = flamMode ? flamSymbols : regularSounds

  useEffect(() => {
    if (editKind === 'sixteenth') setLengthMode('16th')
    else if (editKind === 'triplet') setLengthMode('triplet')
    else setLengthMode('8th')
  }, [editKind, selection?.barIndex, selection?.glyphIndex])

  useEffect(() => {
    if (selected && isFlamSymbol(selected.note, instrument)) setFlamMode(true)
  }, [instrument, selected?.note])

  const shadowStyle = noteKeyShadowStyle(tone, flamMode)
  const barCursor = selection?.barIndex ?? -1

  const runBarAction = (action: 'add' | 'remove') => {
    const result = applyBarPatternAction(bars, barSize, barCursor, action)
    onBarsChange(result.bars)
  }

  const onFlamToggle = () => {
    if (!hasSelection || !selected) return
    const next = !flamMode
    setFlamMode(next)
    if (next) {
      if (selected.note === '-') return
      const flam = isFlamSymbol(selected.note, instrument)
        ? selected.note
        : defaultFlamForNote(selected.note)
      if (flam) onSelectSound(flam)
      return
    }
    const main = flamMainNote(selected.note)
    if (main) onSelectSound(main)
  }

  const onLengthSelect = (mode: NoteLengthTone) => {
    setLengthMode(mode)
    if (mode === '16th') onConvertToSixteenth()
    if (mode === 'triplet') onConvertToTriplet()
    if (mode === '8th') onConvertToEighth()
  }

  const canSixteenth = hasSelection && editKind === 'plain'
  const canTriplet = hasSelection && editKind === 'plain'
  const canEighth = hasSelection && (editKind === 'sixteenth' || editKind === 'triplet')

  return (
    <div
      className={cn(
        'pointer-events-auto fixed inset-x-0 z-40 px-2 pb-2',
        BOTTOM_NAV_OFFSET_CLASS,
      )}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 xl:max-w-5xl">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <DisabledHintButton
                className={cn(PRESSABLE_CLASS, keyButtonClass, 'flex-1 text-sm font-medium')}
                onClick={() => runBarAction('remove')}
              >
                − bar
              </DisabledHintButton>
              <DisabledHintButton
                className={cn(PRESSABLE_CLASS, keyButtonClass, 'flex-1 text-sm font-medium')}
                onClick={() => runBarAction('add')}
              >
                + bar
              </DisabledHintButton>
            </div>
            <div className="flex gap-2">
              <DisabledHintButton
                className={cn(PRESSABLE_CLASS, keyButtonClass, 'flex-1 text-lg font-mono')}
                disabled={!hasSelection}
                hint={NO_SELECTION_HINT}
                onClick={() => onNavigate(-1)}
                style={hasSelection ? shadowStyle : undefined}
              >
                &lt;
              </DisabledHintButton>
              <DisabledHintButton
                className={cn(PRESSABLE_CLASS, keyButtonClass, 'flex-1 text-lg font-mono')}
                disabled={!hasSelection}
                hint={NO_SELECTION_HINT}
                onClick={() => onNavigate(1)}
                style={hasSelection ? shadowStyle : undefined}
              >
                &gt;
              </DisabledHintButton>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <DisabledHintButton
                aria-pressed={lengthMode === '16th' || editKind === 'sixteenth'}
                className={cn(
                  roundToggleClass,
                  lengthToggleActiveClass('16th', lengthMode === '16th' || editKind === 'sixteenth'),
                )}
                disabled={!canSixteenth}
                hint={!hasSelection ? NO_SELECTION_HINT : PLAIN_ONLY_HINT}
                onClick={() => onLengthSelect('16th')}
              >
                <Note16Icon className="size-5" />
              </DisabledHintButton>
              <DisabledHintButton
                aria-pressed={lengthMode === 'triplet' || editKind === 'triplet'}
                className={cn(
                  roundToggleClass,
                  lengthToggleActiveClass('triplet', lengthMode === 'triplet' || editKind === 'triplet'),
                )}
                disabled={!canTriplet}
                hint={!hasSelection ? NO_SELECTION_HINT : PLAIN_ONLY_HINT}
                onClick={() => onLengthSelect('triplet')}
              >
                <TripletBracketIcon className="size-5" />
              </DisabledHintButton>
              <DisabledHintButton
                aria-pressed={lengthMode === '8th' && editKind === 'plain'}
                className={cn(
                  roundToggleClass,
                  lengthToggleActiveClass(
                    '8th',
                    lengthMode === '8th' && (editKind === 'plain' || editKind === null),
                  ),
                )}
                disabled={!canEighth}
                hint={!hasSelection ? NO_SELECTION_HINT : EIGHTH_ONLY_HINT}
                onClick={() => onLengthSelect('8th')}
              >
                <Note8Icon />
              </DisabledHintButton>
              <DisabledHintButton
                aria-pressed={flamMode}
                className={cn(roundToggleClass, flamMode && 'border-indigo-400/50')}
                disabled={!hasSelection || selected?.note === '-'}
                hint={
                  !hasSelection ? NO_SELECTION_HINT : selected?.note === '-' ? PAUSE_FLAM_HINT : undefined
                }
                onClick={onFlamToggle}
                style={flamToggleBackgroundStyle(tone, flamMode)}
              >
                <FlamIcon />
              </DisabledHintButton>
            </div>

            <div className="flex flex-wrap gap-2">
              {visibleSounds.map((sound) => (
                <DisabledHintButton
                  key={sound}
                  aria-label={`Set note to ${sound}`}
                  className={cn(
                    keyButtonClass,
                    selected?.note === sound && 'border-zinc-400 ring-2 ring-zinc-400/30',
                  )}
                  disabled={!hasSelection}
                  hint={NO_SELECTION_HINT}
                  onClick={() => onSelectSound(sound)}
                  style={hasSelection ? shadowStyle : undefined}
                >
                  <NoteGlyphIcon instrument={instrument} note={sound} />
                </DisabledHintButton>
              ))}
              <DisabledHintButton
                aria-label="Set note to rest"
                className={cn(
                  keyButtonClass,
                  selected?.note === '-' && 'border-zinc-400 ring-2 ring-zinc-400/30',
                )}
                disabled={!hasSelection}
                hint={NO_SELECTION_HINT}
                onClick={() => onSelectSound('-')}
                style={hasSelection ? shadowStyle : undefined}
              >
                <NoteGlyphIcon instrument={instrument} note="-" />
              </DisabledHintButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
