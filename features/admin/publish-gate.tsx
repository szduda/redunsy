'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { hasAdminHintCookie } from '@/features/admin/admin-cookies'
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
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (!hasAdminHintCookie()) return

    fetch('/api/admin/session')
      .then((response) => response.json())
      .then((payload: { authenticated?: boolean }) =>
        setAuthenticated(payload.authenticated === true),
      )
      .catch(() => setAuthenticated(false))
  }, [])

  if (!authenticated) return null
  return <PublishRhythmButton rhythm={rhythm} />
}
