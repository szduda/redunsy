'use client'

import { type ChangeEvent } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { Text } from '@/features/theme/text'

export const SwingPatternInput = () => {
  const swingPattern = usePlayerStore((state) => state.swingPattern)
  const setSwingPattern = usePlayerStore((state) => state.setSwingPattern)

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => setSwingPattern(target.value)

  return (
    <div className='flex flex-col gap-1'>
      <Text variant="mono">Swing pattern</Text>
      <div
        className=
        'flex w-[140px] overflow-hidden rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950 font-mono font-semibold tracking-wide'
      >
        <input
          aria-label="Swing pattern"
          className='w-full min-w-0 border-0 bg-transparent px-3 py-1 font-mono text-sm outline-none'
          onChange={onChange}
          spellCheck={false}
          type="text"
          value={swingPattern}
          maxLength={9}
          placeholder='--------'
        />
        <span
          aria-label="Swing pattern length"
          className="flex shrink-0 items-center border-l border-zinc-300 px-3 font-mono text-xs text-zinc-500 dark:border-zinc-700"
        >
          {swingPattern.length}
        </span>
      </div>
    </div>
  )
}
