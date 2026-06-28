'use client'

import { useEffect, useRef, useState } from 'react'

import {
  flamDisableTarget,
  flamEnableTarget,
  flamSymbolsForInstrument,
  isFlamSymbol,
} from '@/features/editor/flam-sounds'
import { instrumentSounds } from '@/features/editor/instrument-sounds'
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
import { Note16Icon } from '@/features/icons/note-16-icon'
import { Note8Icon } from '@/features/icons/note-8-icon'
import { PlusIcon } from '@/features/icons/plus-icon'
import { TripletBracketIcon } from '@/features/icons/triplet-bracket-icon'
import { BOTTOM_NAV_OFFSET_CLASS, PAGE_BODY_BG_CLASS } from '@/features/layout/constants'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { cn } from '@/features/theme/cn'
import { PRESSABLE_CLASS } from '@/features/theme/pressable'

type EditorKeyboardProps = {
  bars: string[]
  instrument: string
  selection: NoteSelection | null
  selectionMode: SelectionMode
  onSelectionModeChange: (mode: SelectionMode) => void
  onNavigate: (direction: -1 | 1) => void
  onRunBarModeAction: (action: 'add' | 'remove' | 'clear') => void
  onSelectSound: (sound: string) => void
  onConvertToSixteenth: () => void
  onConvertToTriplet: () => void
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
const EIGHTH_ONLY_HINT = 'Select a 16th or triplet note to merge to 8th'
const BAR_DRAG_HINT = 'You can drag & drop bars to reposition'

export const EditorKeyboard = ({
  bars,
  instrument,
  selection,
  selectionMode,
  onSelectionModeChange,
  onNavigate,
  onRunBarModeAction,
  onSelectSound,
  onConvertToSixteenth,
  onConvertToTriplet,
  onConvertToEighth,
}: EditorKeyboardProps) => {
  const isMobile = useIsMobile()
  const isBarMode = selectionMode === 'bar'
  const hasSelection = selection !== null
  const hasBarSelection =
    hasSelection && selection.barIndex >= 0 && selection.barIndex < bars.length
  const selected = hasSelection && !isBarMode ? getSelectedFlatNote(bars, selection) : null
  const editKind =
    hasSelection && !isBarMode
      ? getSelectionEditKind(bars[selection.barIndex] ?? '', selection.glyphIndex)
      : null
  const tone = toneFromEditKind(editKind)

  const [lengthMode, setLengthMode] = useState<NoteLengthTone>('8th')
  const [flamMode, setFlamMode] = useState(false)
  const flamBaseNoteRef = useRef<string | null>(null)
  const flamSelectionKeyRef = useRef<string | null>(null)

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
    const selectionKey = selected == null ? null : `${selected.barIndex}:${selected.glyphIndex}`

    if (selectionKey !== flamSelectionKeyRef.current) {
      flamBaseNoteRef.current = null
      flamSelectionKeyRef.current = selectionKey
    }

    if (!selected) {
      setFlamMode(false)
      return
    }
    if (isFlamSymbol(selected.note, instrument)) {
      setFlamMode(true)
      return
    }
    if (selected.note === '-') return
    setFlamMode(false)
    flamBaseNoteRef.current = null
  }, [instrument, selected?.barIndex, selected?.glyphIndex, selected?.note])

  const navShadowStyle = noteKeyShadowStyle(tone)
  const soundShadowStyle = noteKeyShadowStyle(tone, flamMode)

  const onFlamToggle = () => {
    if (!hasSelection || !selected || !flamSymbols.length) return
    const next = !flamMode
    setFlamMode(next)
    if (next) {
      flamBaseNoteRef.current = selected.note
      if (selected.note === '-') return
      const flam = flamEnableTarget(selected.note, instrument)
      if (flam) onSelectSound(flam)
      return
    }
    if (selected.note === '-') {
      flamBaseNoteRef.current = null
      return
    }
    if (!isFlamSymbol(selected.note, instrument)) {
      flamBaseNoteRef.current = null
      return
    }
    const restore = flamDisableTarget(flamBaseNoteRef.current ?? selected.note, selected.note)
    if (restore) onSelectSound(restore)
    flamBaseNoteRef.current = null
  }

  const canFlam = hasSelection && flamSymbols.length > 0

  const onLengthSelect = (mode: NoteLengthTone) => {
    setLengthMode(mode)
    if (mode === '16th') onConvertToSixteenth()
    if (mode === 'triplet') onConvertToTriplet()
    if (mode === '8th') onConvertToEighth()
  }

  const canSixteenth = hasSelection && editKind === 'plain'
  const canTriplet = hasSelection && editKind === 'plain'
  const canEighth = hasSelection && (editKind === 'sixteenth' || editKind === 'triplet')

  const navButtons = (
    <div className="flex gap-2">
      <DisabledHintButton
        className={cn(PRESSABLE_CLASS, keyButtonClass, 'flex-1 text-lg font-mono')}
        disabled={!hasSelection}
        hint={isBarMode ? NO_BAR_HINT : NO_SELECTION_HINT}
        onClick={() => onNavigate(-1)}
        style={hasSelection && !isBarMode ? navShadowStyle : undefined}
      >
        &lt;
      </DisabledHintButton>
      <DisabledHintButton
        className={cn(PRESSABLE_CLASS, keyButtonClass, 'flex-1 text-lg font-mono')}
        disabled={!hasSelection}
        hint={isBarMode ? NO_BAR_HINT : NO_SELECTION_HINT}
        onClick={() => onNavigate(1)}
        style={hasSelection && !isBarMode ? navShadowStyle : undefined}
      >
        &gt;
      </DisabledHintButton>
    </div>
  )

  const modeToggle = (
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
  )

  return (
    <div
      className={cn(
        'pointer-events-auto fixed inset-x-0 z-10 px-2 pt-2 pb-2 border-t border-zinc-300/70 dark:border-zinc-700/70',
        BOTTOM_NAV_OFFSET_CLASS,
        PAGE_BODY_BG_CLASS,
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2">
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
                    style={hasSelection ? soundShadowStyle : undefined}
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
                  className={cn(roundToggleClass, flamToggleActiveClass(flamMode))}
                  disabled={!canFlam}
                  hint={!hasSelection ? NO_SELECTION_HINT : undefined}
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
    </div>
  )
}
