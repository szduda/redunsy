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
