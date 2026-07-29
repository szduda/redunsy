import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const apiMocks = vi.hoisted(() => ({
  readSearchIndexPayload: vi.fn(),
}))

vi.mock('@/features/search-index/search-index.server', () => ({
  readSearchIndexPayload: apiMocks.readSearchIndexPayload,
  isSearchIndexUnavailableError: (error: unknown) =>
    error instanceof Error && error.name === 'SearchIndexUnavailableError',
}))

import { GET } from '@/app/api/search-index/route'

const unavailable = (message: string) => {
  const error = new Error(message)
  error.name = 'SearchIndexUnavailableError'
  return error
}

describe('GET /api/search-index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.readSearchIndexPayload.mockResolvedValue({
      version: 'v1',
      generatedAt: 1,
      count: 0,
      cards: [],
    })
  })

  it('returns 304 when If-None-Match matches the version ETag', async () => {
    const response = await GET(
      new Request('http://localhost/api/search-index', {
        headers: { 'if-none-match': '"v1"' },
      }),
    )

    expect(response.status).toBe(304)
    expect(response.headers.get('ETag')).toBe('"v1"')
  })

  it('returns JSON with ETag when the payload is fresh', async () => {
    const response = await GET(new Request('http://localhost/api/search-index'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.version).toBe('v1')
    expect(response.headers.get('ETag')).toBe('"v1"')
  })

  it('returns 503 when Blob is temporarily unavailable', async () => {
    apiMocks.readSearchIndexPayload.mockRejectedValue(unavailable('timeout'))

    const response = await GET(new Request('http://localhost/api/search-index'))

    expect(response.status).toBe(503)
  })
})
