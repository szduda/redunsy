import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

export type AdminSessionResponse = {
  authenticated: boolean
}

export const fetchAdminSession = async (): Promise<AdminSessionResponse> => {
  const response = await fetch('/api/admin/session')
  if (!response.ok) return { authenticated: false }
  return (await response.json()) as AdminSessionResponse
}

export type PublishRhythmInput = {
  slug: string
  rhythm: Rhythm
}

export type PublishRhythmResponse = {
  ok: true
  slug: string
  created: boolean
  url: string
}

export const publishRhythm = async ({
  slug,
  rhythm,
}: PublishRhythmInput): Promise<PublishRhythmResponse> => {
  const response = await fetch('/api/admin/rhythms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, rhythm }),
  })
  const payload = (await response.json()) as PublishRhythmResponse & { error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Publish failed')
  }

  return payload
}

export const fetchRhythmPageStatus = async (slug: string): Promise<number> => {
  const normalized = slugFromTitle(slug.trim())
  if (!normalized) throw new Error('Invalid slug')

  const url = `${window.location.origin}/rhythm/${normalized}`

  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    return response.status
  } catch {
    return 0
  }
}
