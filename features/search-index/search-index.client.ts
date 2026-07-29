import { SEARCH_INDEX_API_PATH } from '@/features/search-index/search-index.config'
import type { SearchIndexPayload } from '@/features/search-index/search-index.types'

export const fetchSearchIndex = async (cacheBustVersion?: string): Promise<SearchIndexPayload> => {
  const url = cacheBustVersion
    ? `${SEARCH_INDEX_API_PATH}?v=${encodeURIComponent(cacheBustVersion)}`
    : SEARCH_INDEX_API_PATH
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch search index (${response.status})`)
  }
  return (await response.json()) as SearchIndexPayload
}
