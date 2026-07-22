import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const serverMocks = vi.hoisted(() => ({
  getRhythmCardIndex: vi.fn(),
  hasBlobToken: vi.fn(),
  writeSearchIndexToBlob: vi.fn(),
  readLatestSearchIndexFromBlob: vi.fn(),
}))

vi.mock('@/db/queries', () => ({
  getRhythmCardIndex: serverMocks.getRhythmCardIndex,
}))

vi.mock('@/features/search-index/search-index.blob', () => ({
  hasBlobToken: serverMocks.hasBlobToken,
  writeSearchIndexToBlob: serverMocks.writeSearchIndexToBlob,
  readLatestSearchIndexFromBlob: serverMocks.readLatestSearchIndexFromBlob,
}))

import { rebuildSearchIndex } from '@/features/search-index/search-index.server'

describe('rebuildSearchIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    serverMocks.getRhythmCardIndex.mockResolvedValue([
      {
        slug: 'kuku',
        title: 'Kuku',
        description: '',
        meter: 4,
        instruments: ['djembe'],
        longestTrack: 1,
        author: [],
        origin: [],
        tags: [],
        rhythmGroup: [],
        swingPattern: '',
        tempo: 100,
        signalPattern: '',
        createdAt: 1,
        updatedAt: 2,
      },
    ])
  })

  it('returns not-configured when Blob token is missing', async () => {
    serverMocks.hasBlobToken.mockReturnValue(false)

    const result = await rebuildSearchIndex()

    expect(result.status).toBe('not-configured')
    expect(result.count).toBe(1)
    expect(serverMocks.writeSearchIndexToBlob).not.toHaveBeenCalled()
  })

  it('writes to Blob and returns rebuilt', async () => {
    serverMocks.hasBlobToken.mockReturnValue(true)
    serverMocks.writeSearchIndexToBlob.mockResolvedValue(undefined)

    const result = await rebuildSearchIndex()

    expect(result.status).toBe('rebuilt')
    expect(result.count).toBe(1)
    expect(serverMocks.writeSearchIndexToBlob).toHaveBeenCalledOnce()
  })

  it('returns failed when Blob write throws', async () => {
    serverMocks.hasBlobToken.mockReturnValue(true)
    serverMocks.writeSearchIndexToBlob.mockRejectedValue(new Error('blob down'))

    const result = await rebuildSearchIndex()

    expect(result.status).toBe('failed')
  })
})
