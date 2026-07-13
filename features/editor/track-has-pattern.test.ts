import { describe, expect, it } from 'vitest'

import { barHasPattern, trackHasPattern } from '@/features/editor/track-has-pattern'

describe('trackHasPattern', () => {
  it('returns false for empty bars', () => {
    expect(trackHasPattern(['--------', '--------'])).toBe(false)
  })

  it('returns true when any bar has notes', () => {
    expect(trackHasPattern(['--------', 's--ss-tt'])).toBe(true)
  })
})

describe('barHasPattern', () => {
  it('treats all-dash bars as empty', () => {
    expect(barHasPattern('--------')).toBe(false)
  })

  it('detects note characters', () => {
    expect(barHasPattern('s--ss-tt')).toBe(true)
  })
})
