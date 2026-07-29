import { SEARCH_INDEX_LOCAL_STORAGE_KEY } from '@/features/search-index/search-index.config'
import type { SearchIndexPayload } from '@/features/search-index/search-index.types'

const isPayload = (value: unknown): value is SearchIndexPayload => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.version === 'string' &&
    typeof record.generatedAt === 'number' &&
    typeof record.count === 'number' &&
    Array.isArray(record.cards)
  )
}

export const readSearchIndexLocalCache = (): SearchIndexPayload | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SEARCH_INDEX_LOCAL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return isPayload(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const writeSearchIndexLocalCache = (payload: SearchIndexPayload) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SEARCH_INDEX_LOCAL_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota / private mode — ignore; in-memory store still works.
  }
}
