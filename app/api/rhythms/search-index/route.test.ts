import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const indexMocks = vi.hoisted(() => ({
  getCachedRhythmSearchIndex: vi.fn(),
}))

vi.mock('@/features/garage/rhythm-search-index-cache', () => ({
  getCachedRhythmSearchIndex: indexMocks.getCachedRhythmSearchIndex,
}))

import { GET } from '@/app/api/rhythms/search-index/route'

const sampleCards = [{ slug: 'test-slug', title: 'Test', updatedAt: 1 }]

describe('GET /api/rhythms/search-index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    indexMocks.getCachedRhythmSearchIndex.mockResolvedValue(sampleCards)
  })

  it('returns the cached rhythm card index as JSON', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(sampleCards)
    expect(indexMocks.getCachedRhythmSearchIndex).toHaveBeenCalledOnce()
  })

  it('returns 500 when the cache loader fails', async () => {
    indexMocks.getCachedRhythmSearchIndex.mockRejectedValue(new Error('Database unavailable'))

    const response = await GET()

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Database unavailable' })
  })
})
