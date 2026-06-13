'use client'

import { type ChangeEvent, useState } from 'react'

import { Button } from '@/features/theme/button'
import { Input } from '@/features/theme/input'
import { Text } from '@/features/theme/text'
import { useMidinike, validateBarsForGroove } from '@/lib/midinike'

const DEMO_BARS = ['ttstts', 'b--b--', '[tt]ts[tt]ts', 'b--b--', '{ttstts}ss', 'b--b--']
// ttstts|b--b--|[tt]ts[tt]ts|b--b--|{ttt}s{ttt}s|b--b--
// const DEMO_BARS = ['tt{ttt}tt{ttt}', 'b---b---', 'tt[tttt]tt[tttt]', 'b---b---']
// const DEMO_BARS = ['b---b---', 'b-[----]b-[----]', 'b-{---}b-{---}']

// const DEFAULT_GROOVE = '--------'
const DEFAULT_GROOVE = '-<(-<('

const DEFAULT_TEMPO = 110
const MIN_TEMPO = 60
const MAX_TEMPO = 200
const BAR_SEPARATOR = '|'

const numberPattern = /^\d+$/

const parseTempo = (input: string): number | null => {
  if (!numberPattern.test(input)) return null
  const value = Number(input)
  if (value < MIN_TEMPO || value > MAX_TEMPO) return null
  return value
}

const parseBarsInput = (input: string) =>
  input
    .split(BAR_SEPARATOR)
    .map((bar) => bar.trim())
    .filter((bar) => bar.length > 0)

export const TextGroovyPlayer = () => {
  const [grooveInput, setGrooveInput] = useState(DEFAULT_GROOVE)
  const [tempoInput, setTempoInput] = useState(String(DEFAULT_TEMPO))
  const [barsInput, setBarsInput] = useState(() => DEMO_BARS.join(BAR_SEPARATOR))
  const [playError, setPlayError] = useState<string | null>(null)
  const { play, pause, stop, setGroove, setTempo, playing, groove, tempo } = useMidinike({
    djembe: {
      instrument: 'djembe',
      sounds: ['b', 't', 's'],
      lengths: ['8th', '16th', '8th triplet'],
      grooves: [DEFAULT_GROOVE],
    },
    loop: true,
    tempo: DEFAULT_TEMPO,
  })

  const onSubmitGroove = () => {
    if (!grooveInput.length) return
    try {
      validateBarsForGroove(parseBarsInput(barsInput), grooveInput.length)
      setGroove(grooveInput)
      setPlayError(null)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Bars do not match groove length')
    }
  }

  const onTempoChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const { value } = target
    if (value === '' || numberPattern.test(value)) setTempoInput(value)
  }

  const onSubmitTempo = () => {
    const value = parseTempo(tempoInput)
    if (value === null) return
    setTempo(value)
  }

  const onTogglePlayPause = () => {
    if (playing) {
      pause()
      return
    }
    if (!grooveInput.length) return
    const bars = parseBarsInput(barsInput)
    if (!bars.length) return
    try {
      validateBarsForGroove(bars, grooveInput.length)
      setPlayError(null)
      play({ djembe: bars }, grooveInput)
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : 'Could not play pattern')
    }
  }

  return (
    <section className="flex w-full max-w-lg flex-col gap-3">
      <div className="flex gap-2">
        <Input
          aria-label="Groove pattern"
          onChange={({ target }) => setGrooveInput(target.value)}
          type="text"
          value={grooveInput}
          className="flex-1"
        />
        <Button disabled={!grooveInput.length} onClick={onSubmitGroove} variant="secondary">
          Submit groove
        </Button>
      </div>

      <Text variant="mono">Active groove: {groove}</Text>

      <div className="flex gap-2">
        <Input
          aria-label="Tempo"
          className="flex-1"
          inputMode="numeric"
          onChange={onTempoChange}
          placeholder={`${MIN_TEMPO}–${MAX_TEMPO}`}
          type="text"
          value={tempoInput}
        />
        <Button
          disabled={parseTempo(tempoInput) === null}
          onClick={onSubmitTempo}
          variant="secondary"
        >
          Submit tempo
        </Button>
      </div>

      <Text variant="mono">Active tempo: {tempo}</Text>

      <Text className="mt-8 font-medium uppercase opacity-50">Pattern</Text>

      <Input
        aria-label="Bar notation"
        onChange={({ target }) => setBarsInput(target.value)}
        placeholder={`Bars separated by ${BAR_SEPARATOR}`}
        type="text"
        value={barsInput}
      />

      {playError ? <Text variant="mono">{playError}</Text> : null}

      <div className="flex gap-2">
        <Button onClick={onTogglePlayPause} variant="primary">
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={stop}>Stop</Button>
      </div>
    </section>
  )
}
