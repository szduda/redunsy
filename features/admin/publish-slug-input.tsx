'use client'

import { FetchUrlButton, type FetchUrlButtonState } from '@/features/admin/fetch-url-button'
import { useRhythmPageStatus } from '@/features/admin/use-rhythm-page-status'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import { Input } from '@/features/theme/input'
import { cn } from '@/features/theme/cn'

type PublishSlugInputProps = {
  value: string
  onChange: (value: string) => void
}

export const PublishSlugInput = ({ value, onChange }: PublishSlugInputProps) => {
  const { mutate, isPending, data: status, reset } = useRhythmPageStatus()

  const buttonState: FetchUrlButtonState = isPending
    ? 'loading'
    : status !== undefined
      ? 'result'
      : 'idle'

  const checkUrl = () => {
    if (!slugFromTitle(value.trim())) {
      reset()
      return
    }
    mutate(value)
  }

  const onValueChange = (next: string) => {
    onChange(next)
    reset()
  }

  return (
    <div className="relative">
      <Input
        autoComplete="off"
        className={cn('pr-10')}
        onBlur={checkUrl}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="slug"
        value={value}
      />
      <FetchUrlButton onClick={checkUrl} state={buttonState} status={status ?? null} />
    </div>
  )
}
