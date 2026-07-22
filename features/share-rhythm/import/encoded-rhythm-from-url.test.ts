import { describe, expect, it } from 'vitest'

import {
  encodedRhythmFromPathname,
  resolveEncodedRhythmParam,
} from '@/features/share-rhythm/import/encoded-rhythm-from-url'

describe('encodedRhythmFromPathname', () => {
  it('decodes percent-encoded path segments', () => {
    expect(encodedRhythmFromPathname('/share/abc%2Bdef')).toBe('abc+def')
  })

  it('returns empty string for non-share paths', () => {
    expect(encodedRhythmFromPathname('/player')).toBe('')
  })
})

describe('resolveEncodedRhythmParam', () => {
  it('prefers the pathname over a mangled useParams value', () => {
    const resolved = resolveEncodedRhythmParam('/share/raw+value', 'raw%2Bvalue')
    expect(resolved).toBe('raw+value')
  })

  it('falls back to decoding the param when pathname is missing', () => {
    expect(resolveEncodedRhythmParam('/other', 'raw%2Bvalue')).toBe('raw+value')
  })
})
