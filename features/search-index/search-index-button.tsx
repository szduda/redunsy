'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/features/admin/toasts'
import { SEARCH_INDEX_REBUILD_API_PATH } from '@/features/search-index/search-index.config'
import { applyRebuildResultLocally } from '@/features/search-index/search-index.apply'
import type { RebuildSearchIndexResult } from '@/features/search-index/search-index.types'
import { Button } from '@/features/theme/button'

const rebuildSearchIndexRequest = async (): Promise<RebuildSearchIndexResult> => {
  const response = await fetch(SEARCH_INDEX_REBUILD_API_PATH, { method: 'POST' })
  const payload = (await response.json()) as RebuildSearchIndexResult & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? 'Rebuild failed')
  return payload
}

export const SearchIndexButton = () => {
  const { pushToast } = useToast()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: rebuildSearchIndexRequest,
    retry: false,
  })

  const onRebuild = () => {
    pushToast('Rebuilding search index…')
    mutate(undefined, {
      onSuccess: async (result) => {
        pushToast(`Index rebuilt (${result.count} rhythms)`, 'success')
        const applied = await applyRebuildResultLocally(result, queryClient)
        if (!applied) {
          pushToast('Index rebuilt but local refresh failed — reload to pick it up', 'error')
        }
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
