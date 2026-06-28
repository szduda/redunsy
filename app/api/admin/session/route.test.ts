import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const sessionMocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  delete: vi.fn(),
  set: vi.fn(),
}))

vi.mock('@/lib/auth-session', () => ({
  requireAdminSession: sessionMocks.requireAdminSession,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    delete: sessionMocks.delete,
    set: sessionMocks.set,
  })),
}))

import { ADMIN_HINT_COOKIE } from '@/features/admin/admin-cookies'
import { GET } from '@/app/api/admin/session/route'

describe('GET /api/admin/session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns authenticated true for an active admin session', async () => {
    sessionMocks.requireAdminSession.mockResolvedValue({ user: { email: 'admin@gmail.com' } })

    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ authenticated: true })
    expect(sessionMocks.delete).not.toHaveBeenCalled()
  })

  it('clears the admin hint cookie when the session is missing', async () => {
    sessionMocks.requireAdminSession.mockResolvedValue(null)

    const response = await GET()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ authenticated: false })
    expect(sessionMocks.delete).toHaveBeenCalledWith(ADMIN_HINT_COOKIE)
  })

  it('clears the admin hint cookie when the session is not allowlisted', async () => {
    sessionMocks.requireAdminSession.mockResolvedValue(null)

    await GET()

    expect(sessionMocks.delete).toHaveBeenCalledWith(ADMIN_HINT_COOKIE)
  })
})
