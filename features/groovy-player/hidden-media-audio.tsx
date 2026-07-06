'use client'

import type { RefObject } from 'react'

export const SILENT_LOOP_SRC = '/media/silent-loop.wav'

type HiddenMediaAudioProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  onExternalPause: () => void
  onExternalPlay: () => void
}

/** Off-screen looped audio so macOS / Bluetooth route media keys to this tab. */
export const HiddenMediaAudio = ({
  audioRef,
  onExternalPause,
  onExternalPlay,
}: HiddenMediaAudioProps) => (
  <audio
    ref={audioRef}
    aria-hidden
    className="pointer-events-none fixed h-px w-px opacity-0"
    loop
    playsInline
    preload="auto"
    src={SILENT_LOOP_SRC}
    style={{ left: -9999, top: 0 }}
    onPause={onExternalPause}
    onPlay={onExternalPlay}
  />
)
