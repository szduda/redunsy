import 'server-only'

import { connection } from 'next/server'

export type IndexRefreshStatus = 'queued' | 'not-configured' | 'failed'

const deployHookUrl = () => {
  const key = 'VERCEL_DEPLOY_HOOK_URL'
  return process.env[key]?.trim()
}

export const triggerDeployHook = async (): Promise<IndexRefreshStatus> => {
  await connection()
  const url = deployHookUrl()
  if (!url) return 'not-configured'

  try {
    const response = await fetch(url, { method: 'POST' })
    return response.ok ? 'queued' : 'failed'
  } catch {
    return 'failed'
  }
}
