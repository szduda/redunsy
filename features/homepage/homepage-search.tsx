'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { suggestSearchTerms } from '@/features/search-index/search-index.suggestions'
import { useSearchIndex } from '@/features/search-index/use-search-index'
import { Input } from '@/features/theme/input'

export const HomepageSearch = () => {
  useSearchIndex()
  const [draft, setDraft] = useState('')
  const draftRef = useRef(draft)
  const router = useRouter()

  const commit = useCallback(
    (term?: string) => {
      const query = term ?? draftRef.current
      router.push(`/garage?search=${encodeURIComponent(query)}`)
    },
    [router],
  )

  return (
    <Input
      aria-label="Search"
      className="w-full"
      onChange={(event) => {
        draftRef.current = event.target.value
        setDraft(event.target.value)
      }}
      onGetSuggestions={suggestSearchTerms}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return
        event.preventDefault()
        commit()
        event.currentTarget.blur()
      }}
      onSuggestionCommit={commit}
      placeholder="Rhythm, artist, region..."
      type="search"
      value={draft}
    />
  )
}
