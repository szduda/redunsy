import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchAdminSession } from '@/features/admin/admin-api'

describe('fetchAdminSession', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ authenticated: true }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns authenticated true when the session endpoint succeeds', async () => {
    await expect(fetchAdminSession()).resolves.toEqual({ authenticated: true })
    expect(fetch).toHaveBeenCalledWith('/api/admin/session')
  })

  it('returns authenticated false when the session endpoint fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    )

    await expect(fetchAdminSession()).resolves.toEqual({ authenticated: false })
  })

  it('returns authenticated false for non-ok responses such as 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )

    await expect(fetchAdminSession()).resolves.toEqual({ authenticated: false })
  })
})
