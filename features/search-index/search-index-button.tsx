'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SEARCH_INDEX_REBUILD_API_PATH } from '@/features/search-index/search-index.config'
import { writeSearchIndexLocalCache } from '@/features/search-index/search-index.local-cache'
import { fetchSearchIndex } from '@/features/search-index/search-index.client'
import { useSearchIndexStore } from '@/features/search-index/search-index.store'
import type { RebuildSearchIndexResult } from '@/features/search-index/search-index.types'
import { useToast } from '@/features/admin/toasts'
import { Button } from '@/features/theme/button'

const rebuildSearchIndexRequest = async (): Promise<RebuildSearchIndexResult> => {
  const response = await fetch(SEARCH_INDEX_REBUILD_API_PATH, { method: 'POST' })
  const payload = (await response.json()) as RebuildSearchIndexResult & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? 'Rebuild failed')
  return payload
}

export const SearchIndexButton = () => {
  const { pushToast } = useToast()
  const setIndex = useSearchIndexStore((state) => state.setIndex)
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: rebuildSearchIndexRequest,
    retry: false,
  })

  const onRebuild = () => {
    pushToast('Rebuilding search index…')
    mutate(undefined, {
      onSuccess: async (result) => {
        if (result.status === 'rebuilt') {
          pushToast(`Index rebuilt (${result.count} rhythms)`, 'success')
          try {
            const live = await fetchSearchIndex()
            setIndex(live)
            writeSearchIndexLocalCache(live)
            await queryClient.invalidateQueries({ queryKey: ['garage-snippets'] })
          } catch {
            pushToast('Index rebuilt but local refresh failed — reload to pick it up', 'error')
          }
          return
        }
        if (result.status === 'not-configured') {
          pushToast('Blob not configured (set BLOB_READ_WRITE_TOKEN)', 'error')
          return
        }
        pushToast('Search index rebuild failed', 'error')
      },
      onError: (error) => {
        pushToast(error instanceof Error ? error.message : 'Rebuild failed', 'error')
      },
    })
  }

  return (
    <Button
      disabled={isPending}
      onClick={onRebuild}
      variant="subtle"
      className="!justify-start w-full"
    >
      {isPending ? 'Rebuilding index…' : 'Rebuild search index'}
    </Button>
  )
}
