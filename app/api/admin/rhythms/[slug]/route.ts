import { revalidatePath } from 'next/cache'

import { unpublishRhythm } from '@/db/admin-rhythms'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import { rebuildSearchIndex } from '@/features/search-index/search-index.server'
import { requireAdminSession } from '@/lib/auth-session'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export const DELETE = async (_request: Request, context: RouteContext) => {
  const session = await requireAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug: rawSlug } = await context.params
  const slug = slugFromTitle(rawSlug.trim())
  if (!slug) return Response.json({ error: 'Invalid slug' }, { status: 400 })

  try {
    const result = await unpublishRhythm(slug)
    if (!result) return Response.json({ error: 'Rhythm not found' }, { status: 404 })

    revalidatePath(`/rhythm/${slug}`)
    const indexRefresh = await rebuildSearchIndex()

    return Response.json({
      ok: true,
      slug,
      unpublished: true,
      indexRefresh: indexRefresh.status,
      index: {
        version: indexRefresh.version,
        generatedAt: indexRefresh.generatedAt,
        count: indexRefresh.count,
        cards: indexRefresh.cards,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unpublish failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
