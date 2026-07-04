import { revalidatePath, revalidateTag } from 'next/cache'

import { upsertPublishedRhythm } from '@/db/admin-rhythms'
import { RHYTHM_SEARCH_INDEX_TAG } from '@/features/garage/rhythm-search-index-tag'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { requireAdminSession } from '@/lib/auth-session'

type PublishBody = {
  slug?: string
  rhythm?: Rhythm
}

const sanitizeSlug = (raw: string) => slugFromTitle(raw.trim())

const warmUrl = async (request: Request, path: string) => {
  const host = request.headers.get('host')
  if (!host) return
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http'
  await fetch(`${protocol}://${host}${path}`, { cache: 'no-store' })
}

const warmRhythmPage = (request: Request, slug: string) => warmUrl(request, `/rhythm/${slug}`)

const warmSearchIndex = (request: Request) => warmUrl(request, '/api/rhythms/search-index')

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
    revalidateTag(RHYTHM_SEARCH_INDEX_TAG, { expire: 0 })
    await Promise.all([warmRhythmPage(request, slug), warmSearchIndex(request)])

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
