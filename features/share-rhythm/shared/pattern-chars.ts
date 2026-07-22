import { instrumentSounds } from '@/features/editor/instrument-sounds'
import { RHYTHM_INSTRUMENTS } from '@/features/rhythm/rhythm.types'

export const STRUCTURAL_PATTERN_CHARS = new Set(['-', '[', ']', '{', '}', '<', '>'])

export const GROOVE_PATTERN_CHARS = new Set(['-', '<', '(', '>', ')'])

const RHYTHM_INSTRUMENT_SET = new Set<string>(RHYTHM_INSTRUMENTS)

export const isRhythmInstrument = (value: string): value is (typeof RHYTHM_INSTRUMENTS)[number] =>
  RHYTHM_INSTRUMENT_SET.has(value)

export const allowedPatternCharsForInstrument = (instrument: string) =>
  new Set([...STRUCTURAL_PATTERN_CHARS, ...instrumentSounds(instrument)])

export const sanitizeBarPattern = (
  bar: string,
  instrument: string,
  onInvalidChar: (message: string) => void,
) =>
  [...bar]
    .filter((char) => {
      if (allowedPatternCharsForInstrument(instrument).has(char)) return true
      onInvalidChar(`Dropped invalid pattern char "${char}" for instrument "${instrument}"`)
      return false
    })
    .join('')

export const sanitizeSwingPattern = (pattern: string, onInvalidChar: (message: string) => void) =>
  [...pattern]
    .filter((char) => {
      if (GROOVE_PATTERN_CHARS.has(char)) return true
      onInvalidChar(`Dropped invalid swing pattern char "${char}"`)
      return false
    })
    .join('')
