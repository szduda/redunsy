'use client'
import { useState, type ChangeEvent, type CSSProperties, type KeyboardEvent } from 'react'

import { sanitizeSwingPattern } from '@/features/groovy-player/player.store'

type SwingPatternFieldProps = {
  value: string
  barSize: number
  onCommit: (value: string) => void
  className?: string
  style?: CSSProperties
}

const DEFAULT_CLASS =
  'w-full rounded-md border border-zinc-300 bg-white px-3 py-1 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

/**
 * Free-text groove input: the user can type any value while focused; it is only
 * validated (invalid chars dropped, fit to the bar size) on blur or Enter.
 */
export const SwingPatternField = ({
  value,
  barSize,
  onCommit,
  className,
  style,
}: SwingPatternFieldProps) => {
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)

  // Adopt external changes (e.g. another rhythm loaded) without clobbering typing.
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }

  const commit = () => {
    const next = sanitizeSwingPattern(draft, barSize)
    setDraft(next)
    setLastValue(next)
    onCommit(next)
  }

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => setDraft(target.value)

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  return (
    <input
      aria-label="Swing pattern"
      className={className ?? DEFAULT_CLASS}
      onBlur={commit}
      onChange={onChange}
      onKeyDown={onKeyDown}
      spellCheck={false}
      style={style}
      type="text"
      value={draft}
    />
  )
}
