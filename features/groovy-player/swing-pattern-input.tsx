'use client'

import { useRef, type CSSProperties, type PointerEvent } from 'react'

import {
  cycleSwingSymbolBackward,
  cycleSwingSymbolForward,
  parseSwingSymbol,
  swingPatternWithLockedDownbeat,
} from '@/features/groovy-player/swing-pattern-cycle'
import { SwingPatternIcon } from '@/features/groovy-player/swing-pattern-icons'
import { fitSwingPattern } from '@/features/groovy-player/player.store'
import type { GrooveSymbol } from '@/lib/midinike/groove/groove-symbols'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

const LONG_PRESS_MS = 450

type SwingPatternInputProps = {
  value: string
  barSize: number
  onCommit: (value: string) => void
  className?: string
  style?: CSSProperties
}

const cellClass = (disabled: boolean) =>
  cn(
    KEYBOARD_FOCUS_VISIBLE_CLASS,
    'flex aspect-square min-w-0 flex-1 items-center justify-center rounded border p-0.5 transition-colors',
    disabled
      ? 'cursor-default border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600'
      : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-500',
  )

const updatePatternCell = (
  pattern: string,
  barSize: number,
  index: number,
  symbol: GrooveSymbol,
) => {
  const cells = [...swingPatternWithLockedDownbeat(fitSwingPattern(pattern, barSize), barSize)]
  cells[index] = symbol
  return swingPatternWithLockedDownbeat(cells.join(''), barSize)
}

export const SwingPatternInput = ({
  value,
  barSize,
  onCommit,
  className,
  style,
}: SwingPatternInputProps) => {
  const pattern = swingPatternWithLockedDownbeat(fitSwingPattern(value, barSize), barSize)
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
    onCommit(updatePatternCell(pattern, barSize, index, next))
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
      className={cn('flex w-full gap-0.5', className)}
      role="group"
      style={style}
    >
      {Array.from({ length: barSize }, (_, index) => {
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
