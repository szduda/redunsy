import { revalidatePath, revalidateTag } from 'next/cache'

import { upsertPublishedRhythm } from '@/db/admin-rhythms'
import { RHYTHM_INDEX_CACHE_TAG } from '@/lib/cached-rhythm-index'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { requireAdminSession } from '@/lib/auth-session'

type PublishBody = {
  slug?: string
  rhythm?: Rhythm
}

const sanitizeSlug = (raw: string) => slugFromTitle(raw.trim())

const warmPath = async (request: Request, path: string) => {
  const host = request.headers.get('host')
  if (!host) return
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http'
  await fetch(`${protocol}://${host}${path}`, { cache: 'no-store' })
}

export const POST = async (request: Request) => {
  const session = await requireAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: PublishBody
  try {
    body = (await request.json()) as PublishBody
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { rhythm } = body
  if (!rhythm || typeof rhythm !== 'object') {
    return Response.json({ error: 'Missing rhythm payload' }, { status: 400 })
  }

  const slug = sanitizeSlug(body.slug ?? rhythm.slug)
  if (!slug) return Response.json({ error: 'Invalid slug' }, { status: 400 })

  try {
    const result = await upsertPublishedRhythm(slug, rhythm)
    revalidatePath(`/rhythm/${slug}`)
    revalidatePath('/garage')
    revalidateTag(RHYTHM_INDEX_CACHE_TAG, 'max')
    await warmPath(request, `/rhythm/${slug}`)
    await warmPath(request, '/api/rhythm-index')

    return Response.json({
      ok: true,
      slug,
      created: result.created,
      url: `/rhythm/${slug}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Publish failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
