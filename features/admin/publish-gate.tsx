'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { hasAdminHintCookie } from '@/features/admin/admin-cookies'
import { useAdminSession } from '@/features/admin/use-admin-session'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

const PublishRhythmButton = dynamic(
  () =>
    import('@/features/admin/publish-rhythm-button').then((module) => module.PublishRhythmButton),
  { ssr: false },
)

type PublishGateProps = {
  rhythm: Rhythm
}

export const PublishGate = ({ rhythm }: PublishGateProps) => {
  const [hasHint] = useState(hasAdminHintCookie)
  const { data } = useAdminSession(hasHint)

  if (!data?.authenticated && process.env.NODE_ENV !== 'development') return null
  return <PublishRhythmButton rhythm={rhythm} />
}
