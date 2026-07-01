import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const apiMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  upsertPublishedRhythm: vi.fn(),
  requireAdminSession: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: apiMocks.revalidatePath,
  revalidateTag: apiMocks.revalidateTag,
}))
vi.mock('@/db/admin-rhythms', () => ({ upsertPublishedRhythm: apiMocks.upsertPublishedRhythm }))
vi.mock('@/lib/auth-session', () => ({ requireAdminSession: apiMocks.requireAdminSession }))

import { POST } from '@/app/api/admin/rhythms/route'
import { sampleRhythm } from '@/features/admin/publish-as.test-helpers'

const jsonRequest = (body: unknown, host = 'localhost:3000') =>
  new Request('http://localhost:3000/api/admin/rhythms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      host,
      'x-forwarded-proto': 'http',
    },
    body: JSON.stringify(body),
  })

describe('POST /api/admin/rhythms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.requireAdminSession.mockResolvedValue({ user: { email: 'admin@gmail.com' } })
    apiMocks.upsertPublishedRhythm.mockResolvedValue({ created: true, slug: 'new-slug' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  it('rejects unauthenticated publish attempts', async () => {
    apiMocks.requireAdminSession.mockResolvedValue(null)

    const response = await POST(jsonRequest({ slug: 'new-slug', rhythm: sampleRhythm() }))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
    expect(apiMocks.upsertPublishedRhythm).not.toHaveBeenCalled()
  })

  it('creates a new published rhythm and revalidates the page', async () => {
    apiMocks.upsertPublishedRhythm.mockResolvedValue({ created: true, slug: 'brand-new-slug' })
    const rhythm = sampleRhythm()

    const response = await POST(jsonRequest({ slug: 'brand-new-slug', rhythm }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      ok: true,
      slug: 'brand-new-slug',
      created: true,
      url: '/rhythm/brand-new-slug',
    })
    expect(apiMocks.upsertPublishedRhythm).toHaveBeenCalledWith('brand-new-slug', rhythm)
    expect(apiMocks.revalidatePath).toHaveBeenCalledWith('/rhythm/brand-new-slug')
    expect(apiMocks.revalidatePath).toHaveBeenCalledWith('/garage')
    expect(apiMocks.revalidateTag).toHaveBeenCalledWith('rhythm-index', 'max')
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/rhythm/brand-new-slug', {
      cache: 'no-store',
    })
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/rhythm-index', {
      cache: 'no-store',
    })
  })

  it('updates an existing published rhythm', async () => {
    apiMocks.upsertPublishedRhythm.mockResolvedValue({ created: false, slug: 'existing-slug' })
    const rhythm = sampleRhythm({ title: 'Updated Title' })

    const response = await POST(jsonRequest({ slug: 'existing-slug', rhythm }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.created).toBe(false)
    expect(payload.slug).toBe('existing-slug')
    expect(apiMocks.upsertPublishedRhythm).toHaveBeenCalledWith('existing-slug', rhythm)
    expect(apiMocks.revalidatePath).toHaveBeenCalledWith('/rhythm/existing-slug')
  })

  it('normalizes slug input before upserting', async () => {
    const rhythm = sampleRhythm()

    await POST(jsonRequest({ slug: '  My Custom Slug  ', rhythm }))

    expect(apiMocks.upsertPublishedRhythm).toHaveBeenCalledWith('my-custom-slug', rhythm)
  })

  it('returns 400 when rhythm payload is missing', async () => {
    const response = await POST(jsonRequest({ slug: 'valid-slug' }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Missing rhythm payload' })
  })

  it('returns 400 for invalid JSON body', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/admin/rhythms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not-json',
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'Invalid JSON body' })
  })
})
