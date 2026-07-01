import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const foladminMocks = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
  redirect: vi.fn(),
  set: vi.fn(),
}))

vi.mock('@/lib/auth-session', () => ({
  requireAdminSession: foladminMocks.requireAdminSession,
}))

vi.mock('next/navigation', () => ({
  redirect: foladminMocks.redirect,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    set: foladminMocks.set,
  })),
}))

import { ADMIN_HINT_COOKIE } from '@/features/admin/admin-cookies'
import { GET } from '@/app/foladmin/route'

describe('GET /foladmin', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.clearAllMocks()
    foladminMocks.redirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`)
    })
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    vi.restoreAllMocks()
  })

  it('redirects unauthenticated visitors to Google sign-in', async () => {
    foladminMocks.requireAdminSession.mockResolvedValue(null)

    await expect(GET()).rejects.toThrow('REDIRECT:/api/auth/signin/google?callbackUrl=/foladmin')
    expect(foladminMocks.set).not.toHaveBeenCalled()
    expect(console.info).toHaveBeenCalledWith(
      '[auth] /foladmin: no active admin session, redirecting to Google sign-in',
    )
  })

  it('sets the admin hint cookie and redirects authenticated admins to the editor', async () => {
    foladminMocks.requireAdminSession.mockResolvedValue({ user: { email: 'admin@gmail.com' } })
    process.env.NODE_ENV = 'development'

    await expect(GET()).rejects.toThrow('REDIRECT:/editor')

    expect(console.info).toHaveBeenCalledWith(
      '[auth] /foladmin: admin session active for admin@gmail.com',
    )
    expect(foladminMocks.set).toHaveBeenCalledWith(ADMIN_HINT_COOKIE, '1', {
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: false,
    })
    expect(foladminMocks.redirect).toHaveBeenCalledWith('/editor')
  })

  it('marks the hint cookie secure in production', async () => {
    foladminMocks.requireAdminSession.mockResolvedValue({ user: { email: 'admin@gmail.com' } })
    process.env.NODE_ENV = 'production'

    await expect(GET()).rejects.toThrow('REDIRECT:/editor')

    expect(foladminMocks.set).toHaveBeenCalledWith(
      ADMIN_HINT_COOKIE,
      '1',
      expect.objectContaining({ secure: true }),
    )
  })
})
