import {
  SEARCH_INDEX_LATEST_CACHE_SECONDS,
  SEARCH_INDEX_STALE_WHILE_REVALIDATE_SECONDS,
} from '@/features/search-index/search-index.config'
import {
  isSearchIndexUnavailableError,
  readSearchIndexPayload,
} from '@/features/search-index/search-index.server'

export const GET = async (request: Request) => {
  try {
    const payload = await readSearchIndexPayload()
    const etag = `"${payload.version}"`
    const cacheControl = `public, s-maxage=${SEARCH_INDEX_LATEST_CACHE_SECONDS}, stale-while-revalidate=${SEARCH_INDEX_STALE_WHILE_REVALIDATE_SECONDS}`

    if (request.headers.get('if-none-match') === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control': cacheControl,
        },
      })
    }

    return Response.json(payload, {
      headers: {
        'Cache-Control': cacheControl,
        ETag: etag,
      },
    })
  } catch (error) {
    if (isSearchIndexUnavailableError(error)) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Search index unavailable' },
        { status: 503 },
      )
    }
    const message = error instanceof Error ? error.message : 'Search index unavailable'
    return Response.json({ error: message }, { status: 500 })
  }
}
