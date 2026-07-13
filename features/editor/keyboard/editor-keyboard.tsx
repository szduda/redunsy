'use client'

import { useEffect, useState } from 'react'

import { instrumentSounds, digitForSound, soundHintMeta } from '@/features/editor/instrument-sounds'

import { BarDragHintPopover } from '@/features/editor/keyboard/bar-drag-hint-popover'
import { DisabledHintButton } from '@/features/editor/keyboard/disabled-hint-button'
import {
  flamToggleActiveClass,
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
import type { SelectionMode } from '@/features/editor/use-note-editor'
import { ClearBarIcon } from '@/features/icons/clear-bar-icon'
import { FlamIcon } from '@/features/icons/flam-icon'
import { MinusIcon } from '@/features/icons/minus-icon'
import { NavArrowIcon } from '@/features/icons/nav-arrow-icon'
import { Note16Icon } from '@/features/icons/note-16-icon'
import { Note8Icon } from '@/features/icons/note-8-icon'
import { PlusIcon } from '@/features/icons/plus-icon'
import { PolyrhythmBracketIcon } from '@/features/icons/polyrhythm-bracket-icon'
import { TripletBracketIcon } from '@/features/icons/triplet-bracket-icon'
import { BOTTOM_NAV_OFFSET_CLASS, PAGE_BODY_BG_CLASS } from '@/features/layout/constants'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { KeyboardHintWrap } from '@/features/shared/keyboard-hint-wrap'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { cn } from '@/features/theme/cn'
import { PRESSABLE_CLASS } from '@/features/theme/pressable'

type EditorKeyboardProps = {
  bars: string[]
  instrument: string
  selection: NoteSelection | null
  selectionMode: SelectionMode
  flamMode: boolean
  canFlam: boolean
  flamSymbols: string[]
  onFlamToggle: () => void
  onSelectionModeChange: (mode: SelectionMode) => void
  onNavigate: (direction: -1 | 1) => void
  onRunBarModeAction: (action: 'add' | 'remove' | 'clear') => void
  onSelectSound: (sound: string) => void
  onConvertToSixteenth: () => void
  onConvertToTriplet: () => void
  onConvertToPolyrhythm: () => void
  onConvertToEighth: () => void
}

const keyButtonClass =
  'flex size-11 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50/90 dark:border-zinc-700/80 dark:bg-zinc-900/90'

const roundToggleClass =
  'flex size-11 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50/90 dark:border-zinc-700/80 dark:bg-zinc-900/90'

const modeToggleSegmentClass = (active: boolean) =>
  cn(
    'flex-1 px-2 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
      : 'text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800/80',
  )

const NO_SELECTION_HINT = 'Select a note on the canvas first'
const NO_BAR_HINT = 'Select a bar on the canvas first'
const PLAIN_ONLY_HINT = 'Only plain 8th notes can be split'
const EIGHTH_ONLY_HINT = 'Select a 16th, triplet, or polyrhythm note to merge to 8th'

export const EditorKeyboard = ({
  bars,
  instrument,
  selection,
  selectionMode,
  flamMode,
  canFlam,
  flamSymbols,
  onFlamToggle,
  onSelectionModeChange,
  onNavigate,
  onRunBarModeAction,
  onSelectSound,
  onConvertToSixteenth,
  onConvertToTriplet,
  onConvertToPolyrhythm,
  onConvertToEighth,
}: EditorKeyboardProps) => {
  const isMobile = useIsMobile()
  const fullBleed = usePlayerStore((state) => state.fullBleed)
  const isBarMode = selectionMode === 'bar'
  const hasSelection = selection !== null
  const hasBarSelection =
    hasSelection && selection.barIndex >= 0 && selection.barIndex < bars.length
  const selected = hasSelection && !isBarMode ? getSelectedFlatNote(bars, selection) : null
  const editKind = hasSelection && !isBarMode ? getSelectionEditKind(bars, selection) : null
  const tone = toneFromEditKind(editKind)

  const [lengthMode, setLengthMode] = useState<NoteLengthTone>('8th')

  const allSounds = instrumentSounds(instrument)
  const regularSounds = allSounds.filter((sound) => !flamSymbols.includes(sound) && sound !== '-')
  const visibleSounds = flamMode ? flamSymbols : regularSounds

  useEffect(() => {
    if (editKind === 'sixteenth') setLengthMode('16th')
    else if (editKind === 'triplet') setLengthMode('triplet')
    else if (editKind === 'polyrhythm') setLengthMode('polyrhythm')
    else setLengthMode('8th')
  }, [editKind, selection?.barIndex, selection?.glyphIndex])

  const navShadowStyle = noteKeyShadowStyle(tone)
  const soundShadowStyle = noteKeyShadowStyle(tone, flamMode)

  const onLengthSelect = (mode: NoteLengthTone) => {
    setLengthMode(mode)
    if (mode === '16th') onConvertToSixteenth()
    if (mode === 'triplet') onConvertToTriplet()
    if (mode === 'polyrhythm') onConvertToPolyrhythm()
    if (mode === '8th') onConvertToEighth()
  }

  const canSixteenth = hasSelection && editKind === 'plain'
  const canTriplet = hasSelection && editKind === 'plain'
  const canPolyrhythm = hasSelection && editKind === 'plain'
  const canEighth =
    hasSelection &&
    (editKind === 'sixteenth' || editKind === 'triplet' || editKind === 'polyrhythm')

  const navButtons = (
    <div className="flex gap-2">
      <DisabledHintButton
        className={cn(PRESSABLE_CLASS, keyButtonClass)}
        disabled={!hasSelection}
        hint={isBarMode ? NO_BAR_HINT : NO_SELECTION_HINT}
        label="Prev"
        onClick={() => onNavigate(-1)}
        style={hasSelection && !isBarMode ? navShadowStyle : undefined}
      >
        <NavArrowIcon className="rotate-180" />
      </DisabledHintButton>
      <DisabledHintButton
        className={cn(PRESSABLE_CLASS, keyButtonClass)}
        disabled={!hasSelection}
        hint={isBarMode ? NO_BAR_HINT : NO_SELECTION_HINT}
        label="Next"
        onClick={() => onNavigate(1)}
        style={hasSelection && !isBarMode ? navShadowStyle : undefined}
      >
        <NavArrowIcon />
      </DisabledHintButton>
    </div>
  )

  const modeToggle = (
    <KeyboardHintWrap hint="~" label="Mode">
      <div
        className="flex overflow-hidden rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 h-11 md:h-full"
        role="group"
        aria-label="Selection mode"
      >
        <button
          aria-pressed={isBarMode}
          className={cn(PRESSABLE_CLASS, modeToggleSegmentClass(isBarMode))}
          onClick={() => onSelectionModeChange('bar')}
          type="button"
        >
          bar
        </button>
        <button
          aria-pressed={!isBarMode}
          className={cn(PRESSABLE_CLASS, modeToggleSegmentClass(!isBarMode))}
          onClick={() => onSelectionModeChange('note')}
          type="button"
        >
          note
        </button>
      </div>
    </KeyboardHintWrap>
  )

  return (
    <div
      className={cn(
        'relative pointer-events-auto fixed inset-x-0 z-10 px-2 pt-2 pb-2 border-t border-zinc-300/70 dark:border-zinc-700/70',
        BOTTOM_NAV_OFFSET_CLASS,
        PAGE_BODY_BG_CLASS,
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-2',
          fullBleed ? 'md:pr-24 md:pl-4' : 'max-w-5xl',
        )}
      >
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col md:flex-row items-start justify-end md:justify-end flex-1 gap-2 md:gap-6">
            {navButtons}
            {modeToggle}
          </div>

          {isBarMode ? (
            <div className="col-span-2 flex flex-col items-end justify-end gap-2 md:order-first md:flex-row md:justify-center">
              <div className="flex gap-2">
                <DisabledHintButton
                  aria-label="Remove selected bar"
                  className={cn(PRESSABLE_CLASS, keyButtonClass)}
                  disabled={!hasBarSelection}
                  hint={NO_BAR_HINT}
                  onClick={() => onRunBarModeAction('remove')}
                >
                  <MinusIcon />
                </DisabledHintButton>
                <DisabledHintButton
                  aria-label="Add bar after selected bar"
                  className={cn(PRESSABLE_CLASS, keyButtonClass)}
                  disabled={!hasBarSelection}
                  hint={NO_BAR_HINT}
                  onClick={() => onRunBarModeAction('add')}
                >
                  <PlusIcon />
                </DisabledHintButton>
                <DisabledHintButton
                  aria-label="Clear selected bar"
                  className={cn(PRESSABLE_CLASS, keyButtonClass, 'ml-3 md:ml-6')}
                  disabled={!hasBarSelection}
                  hint={NO_BAR_HINT}
                  onClick={() => onRunBarModeAction('clear')}
                >
                  <ClearBarIcon />
                </DisabledHintButton>
              </div>
            </div>
          ) : (
            <div className="col-span-2 flex flex-col md:flex-row items-end justify-end md:justify-between gap-2 md:gap-8 xl:gap-12 md:order-first flex-1">
              <div className="flex flex-wrap justify-end gap-2">
                {visibleSounds.map((sound) => {
                  const { label, labelClassName } = soundHintMeta(instrument, sound)

                  return (
                    <DisabledHintButton
                      key={sound}
                      aria-label={`Set note to ${sound}`}
                      className={cn(
                        keyButtonClass,
                        lengthToggleActiveClass(tone, selected?.note === sound),
                      )}
                      disabled={!hasSelection}
                      hint={NO_SELECTION_HINT}
                      keyboardHint={digitForSound(instrument, sound)}
                      label={label}
                      labelClassName={labelClassName}
                      onClick={() => onSelectSound(sound)}
                      style={hasSelection ? soundShadowStyle : undefined}
                    >
                      <NoteGlyphIcon instrument={instrument} note={sound} />
                    </DisabledHintButton>
                  )
                })}
                <DisabledHintButton
                  aria-label="Set note to rest"
                  className={cn(
                    keyButtonClass,
                    lengthToggleActiveClass(tone, selected?.note === '-'),
                  )}
                  disabled={!hasSelection}
                  hint={NO_SELECTION_HINT}
                  keyboardHint="Bksp"
                  label="Rest"
                  onClick={() => onSelectSound('-')}
                  style={hasSelection ? soundShadowStyle : undefined}
                >
                  <NoteGlyphIcon instrument={instrument} note="-" />
                </DisabledHintButton>
              </div>

              <div className="flex gap-2 md:order-last">
                <DisabledHintButton
                  aria-pressed={lengthMode === '16th' || editKind === 'sixteenth'}
                  className={cn(
                    roundToggleClass,
                    lengthToggleActiveClass(
                      '16th',
                      lengthMode === '16th' || editKind === 'sixteenth',
                    ),
                  )}
                  disabled={!canSixteenth}
                  hint={!hasSelection ? NO_SELECTION_HINT : PLAIN_ONLY_HINT}
                  keyboardHint="R"
                  label="16th"
                  onClick={() => onLengthSelect('16th')}
                >
                  <Note16Icon className="size-5" />
                </DisabledHintButton>
                <DisabledHintButton
                  aria-pressed={lengthMode === 'triplet' || editKind === 'triplet'}
                  className={cn(
                    roundToggleClass,
                    lengthToggleActiveClass(
                      'triplet',
                      lengthMode === 'triplet' || editKind === 'triplet',
                    ),
                  )}
                  disabled={!canTriplet}
                  hint={!hasSelection ? NO_SELECTION_HINT : PLAIN_ONLY_HINT}
                  keyboardHint="T"
                  label="Triplet"
                  onClick={() => onLengthSelect('triplet')}
                >
                  <TripletBracketIcon className="size-5" />
                </DisabledHintButton>
                <DisabledHintButton
                  aria-pressed={lengthMode === 'polyrhythm' || editKind === 'polyrhythm'}
                  className={cn(
                    roundToggleClass,
                    lengthToggleActiveClass(
                      'polyrhythm',
                      lengthMode === 'polyrhythm' || editKind === 'polyrhythm',
                    ),
                  )}
                  disabled={!canPolyrhythm}
                  hint={!hasSelection ? NO_SELECTION_HINT : PLAIN_ONLY_HINT}
                  keyboardHint="E"
                  onClick={() => onLengthSelect('polyrhythm')}
                >
                  <PolyrhythmBracketIcon className="size-5" />
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
                  keyboardHint="Y"
                  label="8th"
                  onClick={() => onLengthSelect('8th')}
                >
                  <Note8Icon />
                </DisabledHintButton>
                <DisabledHintButton
                  aria-pressed={flamMode}
                  className={cn(roundToggleClass, flamToggleActiveClass(flamMode))}
                  disabled={!canFlam}
                  hint={!hasSelection ? NO_SELECTION_HINT : undefined}
                  keyboardHint="U"
                  label="Flam"
                  onClick={onFlamToggle}
                  style={flamToggleBackgroundStyle(tone, flamMode)}
                >
                  <FlamIcon />
                </DisabledHintButton>
              </div>
            </div>
          )}
        </div>
      </div>
      {!isMobile && isBarMode ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-full z-50 m-1 flex justify-center">
          <div className="pointer-events-auto">
            <BarDragHintPopover />
          </div>
        </div>
      ) : null}
    </div>
  )
}
