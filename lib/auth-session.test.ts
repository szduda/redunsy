import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const authMocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: authMocks.getServerSession,
}))

import { getAdminSession, requireAdminSession } from '@/lib/auth-session'

describe('getAdminSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates to getServerSession with auth options', async () => {
    const session = { user: { email: 'admin@gmail.com' } }
    authMocks.getServerSession.mockResolvedValue(session)

    await expect(getAdminSession()).resolves.toBe(session)
    expect(authMocks.getServerSession).toHaveBeenCalledOnce()
  })
})

describe('requireAdminSession', () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_EMAILS = 'admin@gmail.com,editor@example.com'
  })

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails
  })

  it('returns null when there is no session', async () => {
    authMocks.getServerSession.mockResolvedValue(null)

    await expect(requireAdminSession()).resolves.toBeNull()
  })

  it('returns null when the session has no email', async () => {
    authMocks.getServerSession.mockResolvedValue({ user: {} })

    await expect(requireAdminSession()).resolves.toBeNull()
  })

  it('returns null when the email is not allowlisted', async () => {
    authMocks.getServerSession.mockResolvedValue({ user: { email: 'stranger@gmail.com' } })

    await expect(requireAdminSession()).resolves.toBeNull()
  })

  it('returns the session for an allowlisted email', async () => {
    const session = { user: { email: 'admin@gmail.com' } }
    authMocks.getServerSession.mockResolvedValue(session)

    await expect(requireAdminSession()).resolves.toBe(session)
  })

  it('matches allowlisted emails case-insensitively', async () => {
    const session = { user: { email: 'Editor@Example.com' } }
    authMocks.getServerSession.mockResolvedValue(session)

    await expect(requireAdminSession()).resolves.toBe(session)
  })
})
