import { describe, expect, it, vi } from 'vitest'

import { createRhythm } from '@/features/rhythm/rhythm-helpers'
import { encodeRhythmForShare } from '@/features/share-rhythm/export/encode-rhythm'
import { decodeSharePayload } from '@/features/share-rhythm/import/decode-rhythm'
import { validateSharedRhythm } from '@/features/share-rhythm/import/validate-shared-rhythm'

describe('encodeRhythmForShare', () => {
  it('round-trips a rhythm through encode and decode', () => {
    const rhythm = createRhythm({ title: 'kuku', meter: 4, layers: ['djembe', 'sangban'] })
    const encoded = encodeRhythmForShare(rhythm)
    const decoded = decodeSharePayload(encoded)
    const validated = validateSharedRhythm(decoded, () => {})

    expect(validated?.title).toBe('kuku')
    expect(validated?.meter).toBe(4)
    expect(Object.keys(validated?.instruments ?? {})).toEqual(['djembe', 'sangban'])
  })
})

describe('validateSharedRhythm', () => {
  it('strips unknown properties and warns', () => {
    const warn = vi.fn()
    const rhythm = createRhythm({ title: 'safe', layers: ['djembe'], fillDjembe: true })
    const payload = {
      ...rhythm,
      evil: '<script>alert(1)</script>',
      instruments: {
        djembe: {
          ...rhythm.instruments.djembe,
          bars: ['s--ss-tt', 's--ss-tt'],
          extra: true,
        },
      },
    }

    const validated = validateSharedRhythm(payload, warn)

    expect(validated?.slug).toBe('safe')
    expect(warn).toHaveBeenCalledWith('Dropped unknown rhythm property "evil"')
    expect(warn).toHaveBeenCalledWith('Dropped unknown track property "extra"')
  })

  it('sanitizes invalid pattern characters per instrument', () => {
    const warn = vi.fn()
    const validated = validateSharedRhythm(
      {
        title: 'pattern-test',
        slug: 'pattern-test',
        description: '',
        meter: 4,
        author: [],
        origin: [],
        tags: [],
        rhythmGroup: [],
        swingPattern: '-<(-<(',
        tempo: 110,
        signalPattern: '',
        createdAt: 1,
        updatedAt: 1,
        instruments: {
          sangban: {
            id: 'sangban',
            name: 'Sangban',
            instrument: 'sangban',
            bars: ['o{o}x', 'x--o--x'],
          },
          djembe: {
            id: 'djembe',
            name: 'Djembe',
            instrument: 'djembe',
            bars: ['s--ss-tt', 's--ss-ttZ'],
          },
        },
      },
      warn,
    )

    expect(validated?.instruments.sangban.bars[0]).toBe('o{o}x')
    expect(validated?.instruments.djembe.bars[1]).toBe('s--ss-tt')
    expect(warn).toHaveBeenCalled()
  })

  it('rejects payloads without valid instrument tracks', () => {
    const validated = validateSharedRhythm({
      title: 'empty',
      meter: 4,
      instruments: {
        sangban: {
          id: 'sangban',
          name: 'Sangban',
          instrument: 'sangban',
          bars: ['@@@@'],
        },
      },
    })

    expect(validated).toBeNull()
  })

  it('rejects forbidden prototype keys', () => {
    const warn = vi.fn()
    const rhythm = createRhythm({ title: 'proto', layers: ['djembe'] })
    const payload = JSON.parse(
      `${JSON.stringify(rhythm).slice(0, -1)},"__proto__":{"polluted":true}}`,
    ) as Record<string, unknown>

    validateSharedRhythm(payload, warn)

    expect(warn).toHaveBeenCalledWith('Rejected forbidden property "__proto__"')
  })
})
