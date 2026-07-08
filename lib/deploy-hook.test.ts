import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const connectionMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('next/server', () => ({
  connection: connectionMock,
}))

import { triggerDeployHook } from '@/lib/deploy-hook'

describe('triggerDeployHook', () => {
  const originalUrl = process.env.VERCEL_DEPLOY_HOOK_URL

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
  })

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.VERCEL_DEPLOY_HOOK_URL
    else process.env.VERCEL_DEPLOY_HOOK_URL = originalUrl
    vi.unstubAllGlobals()
  })

  it('returns not-configured when the deploy hook URL is unset', async () => {
    delete process.env.VERCEL_DEPLOY_HOOK_URL

    await expect(triggerDeployHook()).resolves.toBe('not-configured')
    expect(connectionMock).toHaveBeenCalledOnce()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('queues a redeploy when the hook URL is configured', async () => {
    process.env.VERCEL_DEPLOY_HOOK_URL = 'https://api.vercel.com/v1/integrations/deploy/test'

    await expect(triggerDeployHook()).resolves.toBe('queued')
    expect(fetch).toHaveBeenCalledWith('https://api.vercel.com/v1/integrations/deploy/test', {
      method: 'POST',
    })
  })

  it('returns failed when the hook request is rejected', async () => {
    process.env.VERCEL_DEPLOY_HOOK_URL = 'https://api.vercel.com/v1/integrations/deploy/test'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    await expect(triggerDeployHook()).resolves.toBe('failed')
  })
})
