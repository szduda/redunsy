import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const apiMocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  rebuildSearchIndex: vi.fn(),
}))

vi.mock('@/lib/auth-session', () => ({ requireAdminSession: apiMocks.requireAdminSession }))
vi.mock('@/features/search-index/search-index.server', () => ({
  rebuildSearchIndex: apiMocks.rebuildSearchIndex,
}))

import { POST } from '@/app/api/admin/search-index/rebuild/route'

describe('POST /api/admin/search-index/rebuild', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.requireAdminSession.mockResolvedValue({ user: { email: 'admin@gmail.com' } })
  })

  it('returns 401 when unauthenticated', async () => {
    apiMocks.requireAdminSession.mockResolvedValue(null)
    const response = await POST()
    expect(response.status).toBe(401)
  })

  it('returns 200 with cards when rebuilt', async () => {
    apiMocks.rebuildSearchIndex.mockResolvedValue({
      status: 'rebuilt',
      version: 'v1',
      generatedAt: 1,
      count: 2,
      cards: [],
    })

    const response = await POST()
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ status: 'rebuilt', cards: [] })
  })

  it('returns 503 when Blob is not configured', async () => {
    apiMocks.rebuildSearchIndex.mockResolvedValue({
      status: 'not-configured',
      version: 'v1',
      generatedAt: 1,
      count: 2,
      cards: [],
    })

    const response = await POST()
    expect(response.status).toBe(503)
  })

  it('returns 502 when Blob write fails', async () => {
    apiMocks.rebuildSearchIndex.mockResolvedValue({
      status: 'failed',
      version: 'v1',
      generatedAt: 1,
      count: 2,
      cards: null,
    })

    const response = await POST()
    expect(response.status).toBe(502)
  })
})
