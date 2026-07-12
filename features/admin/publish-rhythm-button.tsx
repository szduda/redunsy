'use client'

import type { Rhythm } from '@/features/rhythm/rhythm.types'

import { PublishPopover } from '@/features/admin/publish-popover'
import { ToastProvider } from '@/features/admin/toasts'

type PublishRhythmButtonProps = {
  rhythm: Rhythm
}

export const PublishRhythmButton = ({ rhythm }: PublishRhythmButtonProps) => (
  <ToastProvider>
    <PublishPopover rhythm={rhythm} />
  </ToastProvider>
)
