import { rebuildSearchIndex } from '@/features/search-index/search-index.server'
import { requireAdminSession } from '@/lib/auth-session'

export const POST = async () => {
  const session = await requireAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await rebuildSearchIndex()
    if (result.status === 'failed') {
      return Response.json({ ...result, error: 'Blob write failed' }, { status: 502 })
    }
    if (result.status === 'not-configured') {
      return Response.json(
        { ...result, error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 503 },
      )
    }
    return Response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rebuild failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
