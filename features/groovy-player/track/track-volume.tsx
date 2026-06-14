'use client'

import { type ChangeEvent } from 'react'

import { SpeakerIcon } from '@/features/icons/speaker-icon'
import { SpeakerMutedIcon } from '@/features/icons/speaker-muted-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { cn } from '@/features/theme/cn'

type TrackVolumeProps = {
  volume: number
  muted: boolean
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  compact?: boolean
  className?: string
}

export const TrackVolume = ({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
  compact = false,
  className,
}: TrackVolumeProps) => {
  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) =>
    onVolumeChange(Number(target.value))

  return (
    <div className={cn('flex items-center gap-2', compact && 'shrink-0', className)}>
      <IconButton
        active={!muted}
        aria-label={muted ? 'Unmute track' : 'Mute track'}
        aria-pressed={!muted}
        className="text-zinc-400"
        onClick={onToggleMute}
      >
        {muted ? <SpeakerMutedIcon className="size-5" /> : <SpeakerIcon className="size-5" />}
      </IconButton>
      {!compact ? (
        <input
          aria-label="Track volume"
          className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
          max={100}
          min={0}
          onChange={onChange}
          type="range"
          value={muted ? 0 : volume}
        />
      ) : null}
    </div>
  )
}
