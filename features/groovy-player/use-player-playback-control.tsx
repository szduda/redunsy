'use client'

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'

import { HiddenMediaAudio } from '@/features/groovy-player/hidden-media-audio'
import { useMediaSessionPlayback } from '@/features/groovy-player/use-media-session-playback'
import { useSpaceTogglePlay } from '@/features/groovy-player/use-space-toggle-play'

type UsePlayerPlaybackControlArgs = {
  artist?: string
  isPlaying: boolean
  pause: () => void
  playing: boolean
  restartPlayback: () => boolean
  sessionKey?: string | null
  startPlayback: () => boolean
  stop: () => void
  title?: string
}

export type PlayerPlaybackControl = {
  mediaAudio: ReactNode
  onRestart: () => void
  onStop: () => void
  onTogglePlayPause: () => void
}

/** Midinike transport + hidden audio + media session + keyboard / headset controls. */
export const usePlayerPlaybackControl = ({
  artist,
  isPlaying,
  pause,
  playing,
  restartPlayback,
  sessionKey,
  startPlayback,
  stop,
  title,
}: UsePlayerPlaybackControlArgs): PlayerPlaybackControl => {
  const playingRef = useRef(playing)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  const onPausePlayback = useCallback(() => {
    if (!playingRef.current) return
    playingRef.current = false
    pause()
  }, [pause])

  const onResumePlayback = useCallback(() => {
    if (playingRef.current) return
    if (startPlayback()) playingRef.current = true
  }, [startPlayback])

  const {
    audioRef,
    onExternalPause,
    onExternalPlay,
    pause: mediaPause,
    play: mediaPlay,
    release: mediaRelease,
  } = useMediaSessionPlayback({
    artist,
    isPlaying,
    onPause: onPausePlayback,
    onPlay: onResumePlayback,
    title,
  })

  const isFirstSessionKeyEffect = useRef(true)
  useEffect(() => {
    if (isFirstSessionKeyEffect.current) {
      isFirstSessionKeyEffect.current = false
      return
    }
    stop()
    mediaRelease()
  }, [mediaRelease, sessionKey, stop])

  const onTogglePlayPause = useCallback(() => {
    if (playingRef.current) mediaPause()
    else mediaPlay()
  }, [mediaPause, mediaPlay])

  const onStop = useCallback(() => {
    stop()
    mediaRelease()
  }, [mediaRelease, stop])

  useEffect(() => () => onStop(), [onStop])

  const onRestart = useCallback(() => {
    if (restartPlayback()) playingRef.current = true
    mediaPlay()
  }, [mediaPlay, restartPlayback])

  useSpaceTogglePlay(onTogglePlayPause)

  const mediaAudio = useMemo(
    () => (
      <HiddenMediaAudio
        audioRef={audioRef}
        onExternalPause={onExternalPause}
        onExternalPlay={onExternalPlay}
      />
    ),
    [audioRef, onExternalPause, onExternalPlay],
  )

  return useMemo(
    () => ({ mediaAudio, onRestart, onStop, onTogglePlayPause }),
    [mediaAudio, onRestart, onStop, onTogglePlayPause],
  )
}
