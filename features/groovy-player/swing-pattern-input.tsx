'use client'

import { useRef, type CSSProperties, type PointerEvent } from 'react'

import {
  collapseSwingPattern,
  cycleSwingSymbolBackward,
  cycleSwingSymbolForward,
  parseSwingSymbol,
  updateSwingPatternCell,
  visibleSwingCellCount,
} from '@/features/groovy-player/swing-pattern-cycle'
import { SwingPatternIcon } from '@/features/groovy-player/swing-pattern-icons'
import { fitSwingPattern } from '@/features/groovy-player/player.store'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'
import type { GrooveSymbol } from '@/lib/midinike/groove/groove-symbols'

const LONG_PRESS_MS = 450

const GROOVE_CHARS = new Set<string>(['-', '(', '<', '[', '{', ')', '>', ']', '}'])

const VISUAL_LABEL: Record<GrooveSymbol, string> = {
  '-': 'straight',
  '(': 'early 1',
  '<': 'early 2',
  '[': 'early 3',
  '{': 'early 4',
  ')': 'late 1',
  '>': 'late 2',
  ']': 'late 3',
  '}': 'late 4',
}

type SwingPatternInputBase = {
  value: string
  className?: string
  style?: CSSProperties
}

type SwingPatternInputEditable = SwingPatternInputBase & {
  inline?: false
  barSize: number
  beats?: 1 | 2
  onCommit: (value: string) => void
}

type SwingPatternInputInline = SwingPatternInputBase & {
  inline: true
  barSize?: number
  beats?: 1 | 2
  onCommit?: never
}

type SwingPatternInputProps = SwingPatternInputEditable | SwingPatternInputInline

const cellClass = (disabled: boolean) =>
  cn(
    KEYBOARD_FOCUS_VISIBLE_CLASS,
    'flex h-10 w-8 shrink-0 items-center justify-center rounded border p-0.5 transition-colors',
    disabled
      ? 'cursor-default border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600'
      : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-500',
  )

const inlineSymbols = (value: string) =>
  [...value].filter((char) => GROOVE_CHARS.has(char)).map((char) => parseSwingSymbol(char))

const InlineSwingPattern = ({
  value,
  className,
  style,
}: {
  value: string
  className?: string
  style?: CSSProperties
}) => {
  const symbols = inlineSymbols(value)
  const aria = symbols.map((symbol) => VISUAL_LABEL[symbol]).join(', ')

  return (
    <span
      aria-label={`Swing pattern: ${aria || 'empty'}`}
      className={cn(
        'inline-flex translate-y-[-0.06em] items-center gap-px align-middle',
        className,
      )}
      role="img"
      style={style}
    >
      {symbols.map((symbol, index) => (
        <span
          className="inline-flex size-[1.5em] shrink-0 items-center justify-center rounded-[3px] border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          key={`${symbol}-${index}`}
        >
          <SwingPatternIcon className="size-[1.15em]" symbol={symbol} />
        </span>
      ))}
    </span>
  )
}

const EditableSwingPattern = ({
  value,
  barSize,
  beats = 1,
  onCommit,
  className,
  style,
}: SwingPatternInputEditable) => {
  const pattern = collapseSwingPattern(fitSwingPattern(value, barSize), barSize, beats)
  const cellCount = visibleSwingCellCount(barSize, beats)
  const longPressTriggeredRef = useRef(false)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return
    clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = null
  }

  const commitCell = (index: number, direction: 'forward' | 'backward') => {
    const symbol = parseSwingSymbol(pattern[index])
    const next =
      direction === 'forward' ? cycleSwingSymbolForward(symbol) : cycleSwingSymbolBackward(symbol)
    onCommit(updateSwingPatternCell(value, barSize, beats, index, next))
  }

  const onCellPointerDown =
    (index: number) =>
    ({ pointerType }: PointerEvent<HTMLButtonElement>) => {
      if (index === 0) return
      longPressTriggeredRef.current = false
      clearLongPressTimer()
      if (pointerType === 'mouse') return
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true
        commitCell(index, 'backward')
      }, LONG_PRESS_MS)
    }

  const onCellPointerUp = () => clearLongPressTimer()

  const onCellClick = (index: number) => {
    if (index === 0 || longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }
    commitCell(index, 'forward')
  }

  const onCellContextMenu = (index: number, event: { preventDefault: () => void }) => {
    if (index === 0) return
    event.preventDefault()
    commitCell(index, 'backward')
  }

  return (
    <div
      aria-label="Swing pattern"
      className={cn('inline-flex w-fit gap-0.5', className)}
      role="group"
      style={style}
    >
      {Array.from({ length: cellCount }, (_, index) => {
        const symbol = parseSwingSymbol(pattern[index])
        const disabled = index === 0
        return (
          <button
            key={index}
            aria-label={`Swing cell ${index + 1}: ${symbol}`}
            className={cellClass(disabled)}
            disabled={disabled}
            onClick={() => onCellClick(index)}
            onContextMenu={(event) => onCellContextMenu(index, event)}
            onPointerCancel={onCellPointerUp}
            onPointerDown={onCellPointerDown(index)}
            onPointerUp={onCellPointerUp}
            type="button"
          >
            <SwingPatternIcon symbol={symbol} />
          </button>
        )
      })}
    </div>
  )
}

export const SwingPatternInput = (props: SwingPatternInputProps) =>
  props.inline ? (
    <InlineSwingPattern className={props.className} style={props.style} value={props.value} />
  ) : (
    <EditableSwingPattern {...props} />
  )
