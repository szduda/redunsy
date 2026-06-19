'use client'

import { useCallback, useState } from 'react'

import { Input } from '@/features/theme/input'
import { useRouter } from 'next/navigation'

export const HomepageSearch = () => {
  const [draft, setDraft] = useState('')
  const router = useRouter()

  const commit = useCallback(() => {
    router.push(`/garage?search=${draft}`)
  }, [draft])

  return (
    <Input
      className="w-full"
      aria-label="Search grooves"
      placeholder="Search grooves…"
      type="search"
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return
        event.preventDefault()
        commit()
        event.currentTarget.blur()
      }}
    />
  )
}
