import { rebuildSearchIndex } from '@/features/search-index/search-index.server'
import { requireAdminSession } from '@/lib/auth-session'

export const POST = async () => {
  const session = await requireAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await rebuildSearchIndex()
    return Response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rebuild failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
