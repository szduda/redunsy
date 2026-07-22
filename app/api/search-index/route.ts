import { SEARCH_INDEX_LATEST_CACHE_SECONDS } from '@/features/search-index/search-index.config'
import { readSearchIndexPayload } from '@/features/search-index/search-index.server'

export const GET = async () => {
  const payload = await readSearchIndexPayload()

  return Response.json(payload, {
    headers: {
      'Cache-Control': `public, s-maxage=${SEARCH_INDEX_LATEST_CACHE_SECONDS}, stale-while-revalidate=300`,
      ETag: `"${payload.version}"`,
    },
  })
}
