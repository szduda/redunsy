import type { CSSProperties } from 'react'

import type { GlyphLocation } from '@/features/editor/notation/glyph-locations'

export type NoteLengthTone = '8th' | 'triplet' | '16th'

const TONE_RGB: Record<NoteLengthTone, string> = {
  '8th': '46, 130, 105',
  triplet: '210, 183, 105',
  '16th': '237, 60, 25',
}

export const toneFromEditKind = (editKind: GlyphLocation['kind'] | null): NoteLengthTone => {
  if (editKind === 'sixteenth') return '16th'
  if (editKind === 'triplet') return 'triplet'
  return '8th'
}

export const noteKeyShadowStyle = (tone: NoteLengthTone, flamAccent = false): CSSProperties => {
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
  if (tone === '8th') return 'bg-greeny/25 text-greeny dark:bg-greeny/20'
  if (tone === 'triplet') return 'bg-yellowy/30 text-yellowy dark:bg-yellowy/20'
  return 'bg-redy/20 text-redy dark:bg-redy/15'
}

const FLAM_TOP_RGB: Record<NoteLengthTone, string> = {
  '8th': '46, 130, 105',
  triplet: '210, 183, 105',
  '16th': '237, 60, 25',
}

export const flamToggleBackgroundStyle = (
  tone: NoteLengthTone,
  active: boolean,
): CSSProperties => ({
  backgroundImage: active
    ? `linear-gradient(to top, rgba(99, 102, 241, 0.55), rgba(139, 92, 246, 0.2) 40%, rgba(${FLAM_TOP_RGB[tone]}, 0.35) 72%, transparent 100%)`
    : 'linear-gradient(to top, rgba(99, 102, 241, 0.45), rgba(139, 92, 246, 0.12) 55%, transparent 100%)',
})
