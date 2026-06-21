'use client'

import { type ChangeEvent, type CSSProperties } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'

type SwingPatternFieldProps = {
  className?: string
  style?: CSSProperties
}

export const SwingPatternField = ({ className, style }: SwingPatternFieldProps) => {
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const barSize = usePlayerStore((state) => state.swingBarSize)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => setSwingPattern(target.value)

  return (
    <input
      aria-label="Swing pattern"
      className={
        className ??
        'w-full rounded-md border border-zinc-300 bg-white px-3 py-1 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'
      }
      maxLength={barSize}
      onChange={onChange}
      spellCheck={false}
      style={style}
      type="text"
      value={swingPattern}
    />
  )
}
