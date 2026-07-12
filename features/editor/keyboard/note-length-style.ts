import type { CSSProperties } from 'react'

import type { GlyphLocation } from '@/features/editor/notation/glyph-locations'

export type NoteLengthTone = '8th' | 'triplet' | '16th' | 'polyrhythm'

const TONE_RGB: Record<Exclude<NoteLengthTone, '8th'>, string> = {
  triplet: '46, 130, 105',
  '16th': '210, 183, 105',
  polyrhythm: '237, 60, 25',
}

export const toneFromEditKind = (editKind: GlyphLocation['kind'] | null): NoteLengthTone => {
  if (editKind === 'sixteenth') return '16th'
  if (editKind === 'triplet') return 'triplet'
  if (editKind === 'polyrhythm') return 'polyrhythm'
  return '8th'
}

export const noteKeyShadowStyle = (tone: NoteLengthTone, flamAccent = false): CSSProperties => {
  if (tone === '8th') {
    return flamAccent
      ? {
          backgroundImage:
            'linear-gradient(to top, rgba(99, 102, 241, 0.55), rgba(139, 92, 246, 0.15) 45%, transparent 70%)',
        }
      : {}
  }

  const rgb = TONE_RGB[tone]
  const shadow = [
    `0 0 4px 1px rgba(${rgb}, 0.12)`,
    `0 0 16px 3px rgba(${rgb}, 0.06)`,
    `0 0 24px 5px rgba(${rgb}, 0.02)`,
  ].join(', ')
  return flamAccent
    ? {
        boxShadow: shadow,
        backgroundImage: `linear-gradient(to top, rgba(99, 102, 241, 0.55), rgba(139, 92, 246, 0.15) 45%, transparent 70%)`,
      }
    : { boxShadow: shadow }
}

export const lengthToggleActiveClass = (tone: NoteLengthTone, active: boolean) => {
  if (!active) return ''
  if (tone === '8th') return 'bg-zinc-900/10 text-zinc-900 dark:bg-zinc-100/15 dark:text-zinc-100'
  if (tone === 'triplet') return 'bg-greeny/25 text-greeny dark:bg-greeny/20'
  if (tone === 'polyrhythm') return 'bg-redy/20 text-redy dark:bg-redy/15'
  return 'bg-yellowy/30 text-yellowy dark:bg-yellowy/20'
}

const FLAM_TOP_RGB: Record<Exclude<NoteLengthTone, '8th'>, string> = {
  triplet: '46, 130, 105',
  '16th': '210, 183, 105',
  polyrhythm: '237, 60, 25',
}

export const flamToggleBackgroundStyle = (tone: NoteLengthTone, active: boolean): CSSProperties => {
  const topRgb = tone === '8th' ? '120, 120, 120' : FLAM_TOP_RGB[tone]
  return {
    backgroundImage: active
      ? `linear-gradient(to top, rgba(99, 102, 241, 0.55), rgba(139, 92, 246, 0.2) 40%, rgba(${topRgb}, 0.35) 72%, transparent 100%)`
      : 'linear-gradient(to top, rgba(99, 102, 241, 0.45), rgba(139, 92, 246, 0.12) 55%, transparent 100%)',
  }
}

export const flamToggleActiveClass = (active: boolean) =>
  active ? 'border-indigo-400/50 ring-2 ring-indigo-300/45' : ''
