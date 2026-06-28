'use client'

import { useCallback, useState } from 'react'

import { FetchUrlButton, type FetchUrlButtonState } from '@/features/admin/fetch-url-button'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import { Input } from '@/features/theme/input'
import { cn } from '@/features/theme/cn'

type PublishSlugInputProps = {
  value: string
  onChange: (value: string) => void
}

const rhythmPageUrl = (slug: string) => {
  const normalized = slugFromTitle(slug.trim())
  if (!normalized) return null
  return `${window.location.origin}/rhythm/${normalized}`
}

export const PublishSlugInput = ({ value, onChange }: PublishSlugInputProps) => {
  const [state, setState] = useState<FetchUrlButtonState>('idle')
  const [status, setStatus] = useState<number | null>(null)

  const resetCheck = useCallback(() => {
    setState('idle')
    setStatus(null)
  }, [])

  const checkUrl = useCallback(async () => {
    const url = rhythmPageUrl(value)
    if (!url) {
      resetCheck()
      return
    }

    setState('loading')
    try {
      const response = await fetch(url, { method: 'HEAD', cache: 'no-store' })
      setStatus(response.status)
      setState('result')
    } catch {
      setStatus(0)
      setState('result')
    }
  }, [resetCheck, value])

  const onValueChange = (next: string) => {
    onChange(next)
    resetCheck()
  }

  return (
    <div className="relative">
      <Input
        autoComplete="off"
        className={cn('pr-10')}
        onBlur={() => void checkUrl()}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="slug"
        value={value}
      />
      <FetchUrlButton onClick={() => void checkUrl()} state={state} status={status} />
    </div>
  )
}
