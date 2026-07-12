import { font } from '@/features/groovy-player/canvas/drum-font'

const SOUND_ORDER = ['b', 't', 's', 'c', 'd', 'f', 'r', 'g', 'j', 'o', 'x', '-']

export const instrumentSounds = (instrument: string) => {
  const keys = Object.keys(font[instrument] ?? font.djembe)
  return [...keys].sort((left, right) => {
    const leftIndex = SOUND_ORDER.indexOf(left)
    const rightIndex = SOUND_ORDER.indexOf(right)
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right)
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })
}

export const keyboardSounds = (instrument: string) =>
  instrumentSounds(instrument).filter((sound) => sound !== '-')

export const soundForDigit = (instrument: string, digit: number) => {
  if (digit < 1 || digit > 9) return null
  const sounds = keyboardSounds(instrument)
  return sounds[digit - 1] ?? null
}

export const digitForSound = (instrument: string, sound: string) => {
  const index = keyboardSounds(instrument).indexOf(sound)
  return index >= 0 ? String(index + 1) : undefined
}

export type SoundHintMeta = {
  label: string
  labelClassName?: string
}

const DJEMBE_SOUND_HINTS: Record<string, SoundHintMeta> = {
  b: { label: 'bass' },
  t: { label: 'tone' },
  s: { label: 'slap' },
  f: { label: 'slaps' },
  r: { label: 'tones' },
  g: { label: 'slaptones', labelClassName: '-translate-x-[10px]' },
  j: { label: '' },
  c: { label: 'basstones', labelClassName: '-translate-x-[10px]' },
  d: { label: '' },
}

const DUNDUN_SOUND_HINTS: Record<string, SoundHintMeta> = {
  o: { label: 'open' },
  x: { label: 'close' },
}

const DUNDUN_INSTRUMENTS = new Set(['dundunba', 'sangban', 'kenkeni', 'kenkeni2'])

export const soundHintMeta = (instrument: string, sound: string): SoundHintMeta => {
  if (instrument === 'djembe') {
    return DJEMBE_SOUND_HINTS[sound] ?? { label: sound.toUpperCase() }
  }
  if (DUNDUN_INSTRUMENTS.has(instrument)) {
    return DUNDUN_SOUND_HINTS[sound] ?? { label: sound.toUpperCase() }
  }
  return { label: sound.toUpperCase() }
}

export const soundHintLabel = (instrument: string, sound: string) =>
  soundHintMeta(instrument, sound).label
