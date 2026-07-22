import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const apiMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  unpublishRhythm: vi.fn(),
  requireAdminSession: vi.fn(),
  rebuildSearchIndex: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: apiMocks.revalidatePath }))
vi.mock('@/db/admin-rhythms', () => ({ unpublishRhythm: apiMocks.unpublishRhythm }))
vi.mock('@/lib/auth-session', () => ({ requireAdminSession: apiMocks.requireAdminSession }))
vi.mock('@/features/search-index/search-index.server', () => ({
  rebuildSearchIndex: apiMocks.rebuildSearchIndex,
}))

import { DELETE } from '@/app/api/admin/rhythms/[slug]/route'

describe('DELETE /api/admin/rhythms/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.requireAdminSession.mockResolvedValue({ user: { email: 'admin@gmail.com' } })
    apiMocks.unpublishRhythm.mockResolvedValue({ slug: 'kuku', unpublished: true })
    apiMocks.rebuildSearchIndex.mockResolvedValue({
      status: 'rebuilt',
      version: 'v2',
      generatedAt: 2,
      count: 9,
    })
  })

  it('rejects unauthenticated requests', async () => {
    apiMocks.requireAdminSession.mockResolvedValue(null)

    const response = await DELETE(new Request('http://localhost/api/admin/rhythms/kuku'), {
      params: Promise.resolve({ slug: 'kuku' }),
    })

    expect(response.status).toBe(401)
    expect(apiMocks.unpublishRhythm).not.toHaveBeenCalled()
  })

  it('soft-unpublishes and rebuilds the search index', async () => {
    const response = await DELETE(new Request('http://localhost/api/admin/rhythms/kuku'), {
      params: Promise.resolve({ slug: 'kuku' }),
    })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      slug: 'kuku',
      unpublished: true,
      indexRefresh: 'rebuilt',
      index: { version: 'v2', generatedAt: 2, count: 9 },
    })
    expect(apiMocks.unpublishRhythm).toHaveBeenCalledWith('kuku')
    expect(apiMocks.revalidatePath).toHaveBeenCalledWith('/rhythm/kuku')
    expect(apiMocks.rebuildSearchIndex).toHaveBeenCalledOnce()
  })

  it('returns 404 when the rhythm is missing', async () => {
    apiMocks.unpublishRhythm.mockResolvedValue(null)

    const response = await DELETE(new Request('http://localhost/api/admin/rhythms/missing'), {
      params: Promise.resolve({ slug: 'missing' }),
    })

    expect(response.status).toBe(404)
    expect(apiMocks.rebuildSearchIndex).not.toHaveBeenCalled()
  })
})
