import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchRhythmPageStatus, publishRhythm } from '@/features/admin/admin-api'
import { sampleRhythm } from '@/features/admin/publish-as.test-helpers'

describe('publishRhythm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          slug: 'published-slug',
          created: true,
          url: '/rhythm/published-slug',
        }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts rhythm payload to the admin API', async () => {
    const rhythm = sampleRhythm()

    const result = await publishRhythm({ slug: 'published-slug', rhythm })

    expect(result).toEqual({
      ok: true,
      slug: 'published-slug',
      created: true,
      url: '/rhythm/published-slug',
    })
    expect(fetch).toHaveBeenCalledWith('/api/admin/rhythms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'published-slug', rhythm }),
    })
  })

  it('surfaces API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      }),
    )

    await expect(publishRhythm({ slug: 'x', rhythm: sampleRhythm() })).rejects.toThrow(
      'Unauthorized',
    )
  })
})

describe('fetchRhythmPageStatus', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('HEAD-checks the public rhythm page for an existing slug', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, ok: true }),
    )

    const status = await fetchRhythmPageStatus('existing-slug')

    expect(status).toBe(200)
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/rhythm/existing-slug', {
      method: 'HEAD',
      cache: 'no-store',
    })
  })

  it('returns 404 status for a missing slug page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 404, ok: false }),
    )

    expect(await fetchRhythmPageStatus('missing-slug')).toBe(404)
  })

  it('returns 0 when the page check fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

    expect(await fetchRhythmPageStatus('offline-slug')).toBe(0)
  })

  it('normalizes punctuation-only slug input before checking the page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 404, ok: false }),
    )

    const status = await fetchRhythmPageStatus('!!!')

    expect(status).toBe(404)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/^http:\/\/localhost:3000\/rhythm\/rhythm-[a-z0-9]+$/),
      { method: 'HEAD', cache: 'no-store' },
    )
  })
})
