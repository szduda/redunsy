// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest'

import { createRhythm } from '@/features/rhythm/rhythm-helpers'
import {
  buildPrivateRhythmShareUrl,
  buildPublicRhythmShareUrl,
} from '@/features/share-rhythm/export/build-share-url'
import { copyTextToClipboard } from '@/features/share-rhythm/export/copy-share-link'

describe('build-share-url', () => {
  it('builds a private share URL with encoded rhythm payload', () => {
    const rhythm = createRhythm({ title: 'mine', layers: ['djembe'] })
    const url = buildPrivateRhythmShareUrl(rhythm, 'https://redunsy.test')

    expect(url).toMatch(/^https:\/\/redunsy\.test\/share\//)
    const segment = new URL(url).pathname.slice('/share/'.length)
    // Path segment is URI-encoded so lz-string `+` survives Next.js params / chat apps.
    expect(segment.includes('+')).toBe(false)
    expect(decodeURIComponent(segment).length).toBeGreaterThan(0)
  })

  it('uses the current page URL for public rhythms', () => {
    vi.stubGlobal('location', { href: 'https://redunsy.test/rhythm/kuku' })
    expect(buildPublicRhythmShareUrl()).toBe('https://redunsy.test/rhythm/kuku')
    vi.unstubAllGlobals()
  })
})

describe('copyTextToClipboard', () => {
  it('writes text through the clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await copyTextToClipboard('https://redunsy.test/share/abc')

    expect(writeText).toHaveBeenCalledWith('https://redunsy.test/share/abc')
    vi.unstubAllGlobals()
  })
})
