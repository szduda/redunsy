import 'server-only'

export type IndexRefreshStatus = 'queued' | 'not-configured' | 'failed'

export const triggerDeployHook = async (): Promise<IndexRefreshStatus> => {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!url) return 'not-configured'

  try {
    const response = await fetch(url, { method: 'POST' })
    return response.ok ? 'queued' : 'failed'
  } catch {
    return 'failed'
  }
}
