'use client'

import { type Ref } from 'react'

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
  playPauseRef?: Ref<HTMLButtonElement>
  stopRef?: Ref<HTMLButtonElement>
}

export const PlayerTransport = ({
  isPlaying,
  onPlayPause,
  onStop,
  onRestart,
  playPauseRef,
  stopRef,
}: PlayerTransportProps) => (
  <div className="flex gap-1 items-center">
    <KeyboardHintWrap hint={PLAYER_HINTS.playPause.key} label={PLAYER_HINTS.playPause.label}>
      <IconButton
        ref={playPauseRef}
        active
        aria-label={isPlaying ? 'Pause' : 'Play'}
        onClick={onPlayPause}
      >
        {isPlaying ? <PauseIcon className="mx-auto" /> : <PlayIcon className="mx-auto" />}
      </IconButton>
    </KeyboardHintWrap>
    <KeyboardHintWrap hint={PLAYER_HINTS.stop.key} label={PLAYER_HINTS.stop.label}>
      <IconButton ref={stopRef} active aria-label="Stop" onClick={onStop}>
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
