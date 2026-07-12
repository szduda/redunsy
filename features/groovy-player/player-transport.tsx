'use client'

import { PauseIcon } from '@/features/icons/pause-icon'
import { PlayIcon } from '@/features/icons/play-icon'
import { RestartIcon } from '@/features/icons/restart-icon'
import { StopIcon } from '@/features/icons/stop-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { PLAYER_HINTS } from '@/features/groovy-player/player-keyboard-hints'
import { KeyboardHintWrap } from '@/features/shared/keyboard-hint-wrap'

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
  <div className="flex gap-1 items-center">
    <KeyboardHintWrap hint={PLAYER_HINTS.playPause.key} label={PLAYER_HINTS.playPause.label}>
      <IconButton active aria-label={isPlaying ? 'Pause' : 'Play'} onClick={onPlayPause}>
        {isPlaying ? <PauseIcon className="mx-auto" /> : <PlayIcon className="mx-auto" />}
      </IconButton>
    </KeyboardHintWrap>
    <KeyboardHintWrap hint={PLAYER_HINTS.stop.key} label={PLAYER_HINTS.stop.label}>
      <IconButton active aria-label="Stop" onClick={onStop}>
        <StopIcon className="mx-auto" />
      </IconButton>
    </KeyboardHintWrap>
    <IconButton
      aria-label="Restart playback"
      className="!hidden !md:inline-flex"
      onClick={onRestart}
    >
      <RestartIcon className="mx-auto" />
    </IconButton>
  </div>
)
