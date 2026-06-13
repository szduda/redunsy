'use client'

import { type ChangeEvent } from 'react'

import { usePlayerStore } from '@/features/groovy-player/player.store'
import { Text } from '@/features/theme/text'

const MIN_TEMPO = 60
const MAX_TEMPO = 200
const TEMPO_STEP = 5

export const TempoSlider = () => {
  const tempo = usePlayerStore((state) => state.tempo)
  const setTempo = usePlayerStore((state) => state.setTempo)

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) =>
    setTempo(Number(target.value))

  return (
    <div className="flex flex-col gap-1">
      <Text variant="mono">Tempo: {tempo} BPM</Text>
      <input
        aria-label="Tempo"
        className="h-2 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
        max={MAX_TEMPO}
        min={MIN_TEMPO}
        onChange={onChange}
        step={TEMPO_STEP}
        type="range"
        value={tempo}
      />
      <div className="flex justify-between font-mono text-xs text-zinc-500">
        <span>{MIN_TEMPO}</span>
        <span>{MAX_TEMPO}</span>
      </div>
    </div>
  )
}
