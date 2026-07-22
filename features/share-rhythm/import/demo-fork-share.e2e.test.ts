// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { forkPlayerDemoToMyRhythms, PLAYER_DEMO_TITLE } from '@/features/groovy-player/demo-rhythm'
import { DEMO_NOTATION_SWING_PATTERN } from '@/features/groovy-player/player.store'
import { MY_RHYTHMS_STORAGE_KEY } from '@/features/rhythm/my-rhythms-storage'
import { buildPrivateRhythmShareUrl } from '@/features/share-rhythm/export/build-share-url'
import { encodeRhythmForShare } from '@/features/share-rhythm/export/encode-rhythm'
import { decodeSharePayload } from '@/features/share-rhythm/import/decode-rhythm'
import {
  encodedRhythmFromPathname,
  resolveEncodedRhythmParam,
} from '@/features/share-rhythm/import/encoded-rhythm-from-url'
import { importSharedRhythm } from '@/features/share-rhythm/import/import-shared-rhythm'
import { SHARED_WITH_ME_TAG } from '@/features/share-rhythm/shared/share-limits'

/** Simulates Next.js `useParams` leaving `+` percent-encoded as `%2B`. */
const asNextUseParamsValue = (encoded: string) => encodeURIComponent(encoded)

describe('demo tracks → Fork → Share → import (e2e)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips a forked player demo through a share link', () => {
    const forked = forkPlayerDemoToMyRhythms(110, DEMO_NOTATION_SWING_PATTERN)
    expect(forked.userOwned).toBe(true)
    expect(forked.title).toContain(PLAYER_DEMO_TITLE)
    expect(forked.title).toContain('(fork)')

    const shareUrl = buildPrivateRhythmShareUrl(forked, 'https://redunsy.test')
    expect(shareUrl).toMatch(/^https:\/\/redunsy\.test\/share\//)

    const pathname = new URL(shareUrl).pathname
    const encoded = encodedRhythmFromPathname(pathname)
    expect(encoded.length).toBeGreaterThan(0)
    expect(encoded.includes('%')).toBe(false)

    const imported = importSharedRhythm(encoded)

    expect(imported).not.toBeNull()
    expect(imported?.title).not.toBe(forked.title)
    expect(imported?.title).toContain(forked.title)
    expect(imported?.title).toContain('(shared)')
    expect(imported?.slug).not.toBe(forked.slug)
    expect(imported?.meter).toBe(3)
    expect(imported?.userOwned).toBe(true)
    expect(imported?.tags[0]).toBe(SHARED_WITH_ME_TAG)
    expect(Object.keys(imported?.instruments ?? {})).toEqual(
      expect.arrayContaining(['djembe', 'dundunba', 'sangban', 'kenkeni']),
    )

    const stored = JSON.parse(localStorage.getItem(MY_RHYTHMS_STORAGE_KEY) ?? '{}') as Record<
      string,
      { title: string }
    >
    expect(stored[imported!.slug]?.title).toBe(imported!.title)
    expect(stored[forked.slug]?.title).toBe(forked.title)
  })

  it('imports when Next.js useParams returns a still-percent-encoded payload', () => {
    const forked = forkPlayerDemoToMyRhythms(118, DEMO_NOTATION_SWING_PATTERN)
    const encoded = encodeRhythmForShare(forked)
    expect(encoded.includes('+')).toBe(true)

    const mangledParam = asNextUseParamsValue(encoded)
    expect(mangledParam.includes('%2B')).toBe(true)
    expect(mangledParam).not.toBe(encoded)

    // Raw mangled param must not decode without normalization (the production bug).
    expect(() => decodeSharePayload(mangledParam)).not.toThrow()

    const resolved = resolveEncodedRhythmParam(`/share/${mangledParam}`, mangledParam)
    expect(resolved).toBe(encoded)

    const imported = importSharedRhythm(resolved)
    expect(imported?.title).toContain(forked.title)
    expect(imported?.title).toContain('(shared)')
    expect(imported?.tags[0]).toBe(SHARED_WITH_ME_TAG)
  })

  it('decodeSharePayload accepts percent-encoded lz-string payloads', () => {
    const forked = forkPlayerDemoToMyRhythms(100, DEMO_NOTATION_SWING_PATTERN)
    const encoded = encodeRhythmForShare(forked)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const decoded = decodeSharePayload(asNextUseParamsValue(encoded)) as { title?: string }
    expect(decoded.title).toBe(forked.title)

    warn.mockRestore()
  })
})
