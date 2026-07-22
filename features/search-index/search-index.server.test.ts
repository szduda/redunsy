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

vi.mock('@/features/search-index/search-index.seed', () => ({
  loadSeedPayload: vi.fn(async () => ({
    version: 'seed',
    generatedAt: 0,
    count: 0,
    cards: [],
  })),
  metaFromPayload: (payload: { version: string; generatedAt: number; count: number }) => ({
    version: payload.version,
    generatedAt: payload.generatedAt,
    count: payload.count,
  }),
  toSearchIndexPayload: (cards: unknown[], version: string, generatedAt = Date.now()) => ({
    version,
    generatedAt,
    count: cards.length,
    cards,
  }),
}))

import { loadSeedPayload } from '@/features/search-index/search-index.seed'
import {
  isSearchIndexUnavailableError,
  readSearchIndexPayload,
  rebuildSearchIndex,
} from '@/features/search-index/search-index.server'

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

  it('returns not-configured with cards when Blob token is missing', async () => {
    serverMocks.hasBlobToken.mockReturnValue(false)

    const result = await rebuildSearchIndex()

    expect(result.status).toBe('not-configured')
    expect(result.count).toBe(1)
    expect(result.cards).toHaveLength(1)
    expect(serverMocks.writeSearchIndexToBlob).not.toHaveBeenCalled()
  })

  it('writes to Blob and returns rebuilt with cards', async () => {
    serverMocks.hasBlobToken.mockReturnValue(true)
    serverMocks.writeSearchIndexToBlob.mockResolvedValue(undefined)

    const result = await rebuildSearchIndex()

    expect(result.status).toBe('rebuilt')
    expect(result.count).toBe(1)
    expect(result.cards).toHaveLength(1)
    expect(serverMocks.writeSearchIndexToBlob).toHaveBeenCalledOnce()
  })

  it('returns failed with null cards when Blob write throws', async () => {
    serverMocks.hasBlobToken.mockReturnValue(true)
    serverMocks.writeSearchIndexToBlob.mockRejectedValue(new Error('blob down'))

    const result = await rebuildSearchIndex()

    expect(result.status).toBe('failed')
    expect(result.cards).toBeNull()
  })
})

describe('readSearchIndexPayload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns Blob payload when present', async () => {
    serverMocks.readLatestSearchIndexFromBlob.mockResolvedValue({
      status: 'ok',
      payload: { version: 'v1', generatedAt: 10, count: 0, cards: [] },
    })

    await expect(readSearchIndexPayload()).resolves.toEqual({
      version: 'v1',
      generatedAt: 10,
      count: 0,
      cards: [],
    })
    expect(loadSeedPayload).not.toHaveBeenCalled()
  })

  it('falls back to seed when Blob is not configured', async () => {
    serverMocks.readLatestSearchIndexFromBlob.mockResolvedValue({ status: 'missing-token' })

    await expect(readSearchIndexPayload()).resolves.toMatchObject({ version: 'seed' })
    expect(loadSeedPayload).toHaveBeenCalledOnce()
  })

  it('throws on transient Blob errors instead of serving seed', async () => {
    serverMocks.readLatestSearchIndexFromBlob.mockResolvedValue({
      status: 'error',
      message: 'timeout',
    })

    await expect(readSearchIndexPayload()).rejects.toSatisfy(isSearchIndexUnavailableError)
    expect(loadSeedPayload).not.toHaveBeenCalled()
  })
})
