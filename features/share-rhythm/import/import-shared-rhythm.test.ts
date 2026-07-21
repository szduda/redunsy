// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRhythm } from '@/features/rhythm/rhythm-helpers'
import { MY_RHYTHMS_STORAGE_KEY } from '@/features/rhythm/my-rhythms-storage'
import { encodeRhythmForShare } from '@/features/share-rhythm/export/encode-rhythm'
import { importSharedRhythm } from '@/features/share-rhythm/import/import-shared-rhythm'
import { SHARED_WITH_ME_TAG } from '@/features/share-rhythm/shared/share-limits'

describe('importSharedRhythm', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('imports a shared rhythm into My Library with the shared tag', () => {
    const rhythm = createRhythm({ title: 'from-friend', layers: ['djembe'], fillDjembe: true })
    const encoded = encodeRhythmForShare(rhythm)

    const imported = importSharedRhythm(encoded)

    expect(imported?.slug).toBe('from-friend')
    expect(imported?.tags).toContain(SHARED_WITH_ME_TAG)
    expect(imported?.userOwned).toBe(true)

    const stored = JSON.parse(localStorage.getItem(MY_RHYTHMS_STORAGE_KEY) ?? '{}')
    expect(stored['from-friend'].title).toBe('from-friend')
  })

  it('creates a unique slug when the library already has that slug', () => {
    const existing = createRhythm({ title: 'kuku', layers: ['djembe'] })
    localStorage.setItem(MY_RHYTHMS_STORAGE_KEY, JSON.stringify({ [existing.slug]: existing }))

    const encoded = encodeRhythmForShare(createRhythm({ title: 'kuku', layers: ['djembe'] }))

    const imported = importSharedRhythm(encoded)

    expect(imported?.slug).not.toBe('kuku')
    expect(imported?.slug.length).toBeGreaterThan(0)
  })

  it('returns null for corrupt share links', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(importSharedRhythm('not-a-valid-share-link')).toBeNull()
    warn.mockRestore()
  })
})
