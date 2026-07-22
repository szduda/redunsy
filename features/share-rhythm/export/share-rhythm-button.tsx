'use client'

import { useCallback, useState } from 'react'

import {
  buildPrivateRhythmShareUrl,
  buildPublicRhythmShareUrl,
} from '@/features/share-rhythm/export/build-share-url'
import { copyTextToClipboard } from '@/features/share-rhythm/export/copy-share-link'
import { ShareIcon } from '@/features/icons/share-icon'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'

type ShareRhythmButtonProps = {
  rhythm: Rhythm
}

export const ShareRhythmButton = ({ rhythm }: ShareRhythmButtonProps) => {
  const [copied, setCopied] = useState(false)

  const onShare = useCallback(async () => {
    try {
      const url = rhythm.userOwned
        ? buildPrivateRhythmShareUrl(rhythm)
        : buildPublicRhythmShareUrl()
      await copyTextToClipboard(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.warn('Could not copy share link', error)
    }
  }, [rhythm])

  return (
    <Button className="!justify-start" onClick={onShare} variant="subtle">
      <ShareIcon className="mr-1 size-4" />
      {copied ? 'Copied!' : 'Share'}
    </Button>
  )
}
