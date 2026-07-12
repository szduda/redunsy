import { afterEach, describe, expect, it, vi } from 'vitest'

import { hasAdminHintCookie } from '@/features/admin/admin-cookies'

describe('hasAdminHintCookie (server)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when document is unavailable', () => {
    vi.stubGlobal('document', undefined)

    expect(hasAdminHintCookie()).toBe(false)
  })
})
