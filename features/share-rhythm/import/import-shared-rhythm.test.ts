// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRhythm, slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import {
  flushMyRhythms,
  MY_RHYTHMS_STORAGE_KEY,
  resetMyRhythmsStorageForTests,
  writeMyRhythms,
} from '@/features/rhythm/my-rhythms-storage'
import { encodeRhythmForShare } from '@/features/share-rhythm/export/encode-rhythm'
import { importSharedRhythm } from '@/features/share-rhythm/import/import-shared-rhythm'
import { SHARED_WITH_ME_TAG } from '@/features/share-rhythm/shared/share-limits'

describe('importSharedRhythm', () => {
  beforeEach(() => {
    localStorage.clear()
    resetMyRhythmsStorageForTests()
  })

  it('imports a shared rhythm into My Library with the shared tag', () => {
    const rhythm = createRhythm({ title: 'from-friend', layers: ['djembe'], fillDjembe: true })
    const encoded = encodeRhythmForShare(rhythm)

    const imported = importSharedRhythm(encoded)
    flushMyRhythms()

    expect(imported?.slug).toBe('from-friend')
    expect(imported?.tags).toContain(SHARED_WITH_ME_TAG)
    expect(imported?.userOwned).toBe(true)

    const stored = JSON.parse(localStorage.getItem(MY_RHYTHMS_STORAGE_KEY) ?? '{}')
    expect(stored['from-friend'].title).toBe('from-friend')
  })

  it('creates a unique title and slug when the library already has that slug', () => {
    const existing = createRhythm({ title: 'share-test', layers: ['djembe'] })
    writeMyRhythms({ [existing.slug]: existing })

    const encoded = encodeRhythmForShare(createRhythm({ title: 'share-test', layers: ['djembe'] }))

    const imported = importSharedRhythm(encoded)

    expect(imported?.slug).not.toBe('share-test')
    expect(imported?.title).not.toBe('share-test')
    expect(imported?.title).toContain('share-test')
    expect(imported?.title).toContain('(shared)')
    expect(imported?.slug).toBe(slugFromTitle(imported!.title))
    expect(imported?.tags[0]).toBe(SHARED_WITH_ME_TAG)
  })

  it('returns null for corrupt share links', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(importSharedRhythm('not-a-valid-share-link')).toBeNull()
    warn.mockRestore()
  })
})
