import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { authOptions } from '@/auth'

const signIn = authOptions.callbacks?.signIn
const jwt = authOptions.callbacks?.jwt
const session = authOptions.callbacks?.session

describe('authOptions', () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS

  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'admin@gmail.com'
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails
    vi.restoreAllMocks()
  })

  it('uses jwt sessions with a seven-day max age', () => {
    expect(authOptions.session).toEqual({
      strategy: 'jwt',
      maxAge: 7 * 24 * 60 * 60,
      updateAge: 0,
    })
  })

  describe('signIn callback', () => {
    it('rejects sign-in when Google returns no email', () => {
      expect(signIn?.({ user: {} } as Parameters<NonNullable<typeof signIn>>[0])).toBe(false)
      expect(console.warn).toHaveBeenCalledWith(
        '[auth] sign-in failed: missing email from Google profile',
      )
    })

    it('rejects sign-in for non-allowlisted emails', () => {
      expect(
        signIn?.({
          user: { email: 'stranger@gmail.com' },
        } as Parameters<NonNullable<typeof signIn>>[0]),
      ).toBe(false)
      expect(console.warn).toHaveBeenCalledWith(
        '[auth] sign-in rejected: stranger@gmail.com is not in ADMIN_EMAILS',
      )
    })

    it('accepts sign-in for allowlisted emails', () => {
      expect(
        signIn?.({
          user: { email: 'Admin@Gmail.com' },
        } as Parameters<NonNullable<typeof signIn>>[0]),
      ).toBe(true)
      expect(console.info).toHaveBeenCalledWith('[auth] sign-in success: admin@gmail.com')
    })
  })

  describe('jwt callback', () => {
    it('copies the user email onto the token', () => {
      const token = jwt?.({
        token: {},
        user: { email: 'admin@gmail.com' },
      } as Parameters<NonNullable<typeof jwt>>[0])

      expect(token).toEqual({ email: 'admin@gmail.com' })
    })

    it('leaves the token unchanged when no user is present', () => {
      const token = jwt?.({
        token: { email: 'admin@gmail.com' },
        user: undefined,
        account: null,
      } as unknown as Parameters<NonNullable<typeof jwt>>[0])

      expect(token).toEqual({ email: 'admin@gmail.com' })
    })
  })

  describe('session callback', () => {
    it('copies the token email onto the session user', async () => {
      const nextSession = await session?.({
        session: { user: { name: 'Admin' } },
        token: { email: 'admin@gmail.com' },
      } as Parameters<NonNullable<typeof session>>[0])

      expect(nextSession?.user?.email).toBe('admin@gmail.com')
    })

    it('leaves the session unchanged when the token has no email', () => {
      const input = { user: { name: 'Admin' } }
      const nextSession = session?.({
        session: input,
        token: {},
      } as Parameters<NonNullable<typeof session>>[0])

      expect(nextSession).toEqual({ user: { name: 'Admin' } })
    })
  })
})
