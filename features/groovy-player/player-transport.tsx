'use client'

import { PauseIcon } from '@/features/icons/pause-icon'
import { PlayIcon } from '@/features/icons/play-icon'
import { RestartIcon } from '@/features/icons/restart-icon'
import { StopIcon } from '@/features/icons/stop-icon'
import { IconButton } from '@/features/groovy-player/icon-button'

type PlayerTransportProps = {
  isPlaying: boolean
  onPlayPause: () => void
  onStop: () => void
  onRestart: () => void
}

export const PlayerTransport = ({
  isPlaying,
  onPlayPause,
  onStop,
  onRestart,
}: PlayerTransportProps) => (
  <div className="flex gap-1">
    <IconButton
      active
      aria-label={isPlaying ? 'Pause' : 'Play'}
      className="text-yellowy"
      dark
      ninja={false}
      onClick={onPlayPause}
    >
      {isPlaying ? <PauseIcon className="mx-auto" /> : <PlayIcon className="mx-auto" />}
    </IconButton>
    <IconButton
      active
      aria-label="Stop"
      className="text-yellowy"
      dark
      ninja={false}
      onClick={onStop}
    >
      <StopIcon className="mx-auto" />
    </IconButton>
    <IconButton
      active
      aria-label="Restart playback"
      className="text-yellowy"
      dark
      ninja={false}
      onClick={onRestart}
    >
      <RestartIcon className="mx-auto" />
    </IconButton>
  </div>
)
