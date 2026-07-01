import { revalidatePath } from 'next/cache'

import { upsertPublishedRhythm } from '@/db/admin-rhythms'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { requireAdminSession } from '@/lib/auth-session'
import { triggerDeployHook } from '@/lib/deploy-hook'

type PublishBody = {
  slug?: string
  rhythm?: Rhythm
}

const sanitizeSlug = (raw: string) => slugFromTitle(raw.trim())

const warmRhythmPage = async (request: Request, slug: string) => {
  const host = request.headers.get('host')
  if (!host) return
  const protocol = request.headers.get('x-forwarded-proto') ?? 'http'
  await fetch(`${protocol}://${host}/rhythm/${slug}`, { cache: 'no-store' })
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
    await warmRhythmPage(request, slug)
    const indexRefresh = await triggerDeployHook()

    return Response.json({
      ok: true,
      slug,
      created: result.created,
      url: `/rhythm/${slug}`,
      indexRefresh,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Publish failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
