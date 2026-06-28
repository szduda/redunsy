// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_HINT_COOKIE, hasAdminHintCookie } from '@/features/admin/admin-cookies'

describe('hasAdminHintCookie', () => {
  beforeEach(() => {
    document.cookie = `${ADMIN_HINT_COOKIE}=; Max-Age=0; path=/`
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.cookie = `${ADMIN_HINT_COOKIE}=; Max-Age=0; path=/`
  })

  it('returns false when the hint cookie is absent', () => {
    document.cookie = 'other=value; path=/'

    expect(hasAdminHintCookie()).toBe(false)
  })

  it('returns true when the hint cookie is present', () => {
    document.cookie = `${ADMIN_HINT_COOKIE}=1; path=/`

    expect(hasAdminHintCookie()).toBe(true)
  })

  it('matches only the configured cookie name', () => {
    vi.spyOn(document, 'cookie', 'get').mockReturnValue('other=value; not_redunsy_admin_hint=1')

    expect(hasAdminHintCookie()).toBe(false)
  })
})
