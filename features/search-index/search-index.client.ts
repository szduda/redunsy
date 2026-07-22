import { SEARCH_INDEX_API_PATH } from '@/features/search-index/search-index.config'
import type { SearchIndexPayload } from '@/features/search-index/search-index.types'

export const fetchSearchIndex = async (): Promise<SearchIndexPayload> => {
  const response = await fetch(SEARCH_INDEX_API_PATH, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch search index (${response.status})`)
  }
  return (await response.json()) as SearchIndexPayload
}
