import { describe, expect, it } from 'vitest'

import { baseTitleFromFork, publishSlugFromRhythm } from '@/features/admin/publish-slug'
import {
  rhythmInstrumentList,
  rhythmToPatterns,
  rhythmToPublishedRow,
} from '@/features/admin/rhythm-to-row'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

const sampleRhythm = (): Rhythm => ({
  slug: 'my-rhythm-abc12',
  title: 'My Rhythm',
  description: 'A test rhythm',
  meter: 4,
  author: ['Ada'],
  origin: ['Guinea'],
  tags: ['test'],
  rhythmGroup: ['solo'],
  swingPattern: '--------',
  tempo: 110,
  signalPattern: '',
  createdAt: 1,
  updatedAt: 2,
  userOwned: true,
  instruments: {
    djembe: {
      id: 'djembe',
      name: 'Djembe',
      instrument: 'djembe',
      bars: ['s--ss-tt', 's--ss-tt'],
    },
  },
})

describe('publishSlugFromRhythm', () => {
  it('uses base title slug for forked rhythms', () => {
    const rhythm = { ...sampleRhythm(), title: 'Kon solo (fork)', slug: 'kon-solo-fork' }
    expect(publishSlugFromRhythm(rhythm)).toBe('kon-solo')
  })

  it('uses current slug for non-fork titles', () => {
    expect(publishSlugFromRhythm(sampleRhythm())).toBe('my-rhythm-abc12')
  })
})

describe('baseTitleFromFork', () => {
  it('strips fork suffix with optional hash', () => {
    expect(baseTitleFromFork('Rhythm (fork abc)')).toBe('Rhythm')
    expect(baseTitleFromFork('Rhythm (fork)')).toBe('Rhythm')
  })
})

describe('rhythmToPublishedRow', () => {
  it('maps editor rhythm into publishable row shape', () => {
    const rhythm = sampleRhythm()
    const row = rhythmToPublishedRow('published-slug', rhythm)

    expect(row.slug).toBe('published-slug')
    expect(row.title).toBe('My Rhythm')
    expect(row.instruments).toEqual(['djembe'])
    expect(row.patterns).toHaveLength(1)
    expect(row.patterns[0]?.bars).toEqual(['s--ss-tt', 's--ss-tt'])
    expect(row.patterns[0]?.pattern).toBe('s--ss-tts--ss-tt')
  })
})

describe('rhythmInstrumentList', () => {
  it('deduplicates known instruments', () => {
    const patterns = rhythmToPatterns(sampleRhythm())
    expect(rhythmInstrumentList(patterns)).toEqual(['djembe'])
  })
})
