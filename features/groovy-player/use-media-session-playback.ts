'use client'

import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement

type UseMediaSessionPlaybackArgs = {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  title?: string
  artist?: string
}

export type MediaSessionControls = {
  audioRef: RefObject<HTMLAudioElement | null>
  onExternalPause: () => void
  onExternalPlay: () => void
  pause: () => void
  play: () => void
  release: () => void
}

const setMediaMetadata = (title?: string, artist?: string) => {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({
    artist: artist ?? 'Dunsy.app',
    title: title ?? 'Rhythm',
  })
}

/**
 * OS media keys control a hidden <audio> element; rhythm playback mirrors those events.
 * Callbacks should be idempotent (ignore play when playing, pause when paused).
 */
export const useMediaSessionPlayback = ({
  isPlaying,
  onPlay,
  onPause,
  title,
  artist,
}: UseMediaSessionPlaybackArgs): MediaSessionControls => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const onPlayRef = useRef(onPlay)
  const onPauseRef = useRef(onPause)

  useEffect(() => {
    onPlayRef.current = onPlay
  }, [onPlay])

  useEffect(() => {
    onPauseRef.current = onPause
  }, [onPause])

  const play = useCallback(() => {
    onPlayRef.current()
    void audioRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    onPauseRef.current()
    if (audioRef.current && !audioRef.current.paused) audioRef.current.pause()
  }, [])

  const release = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = 'none'
    navigator.mediaSession.metadata = null
  }, [])

  const onExternalPlay = useCallback(() => {
    onPlayRef.current()
  }, [])

  const onExternalPause = useCallback(() => {
    onPauseRef.current()
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  useEffect(() => {
    setMediaMetadata(title, artist)
  }, [artist, title])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'MediaPlayPause') return
      if (event.repeat || isTypingTarget(event.target)) return
      event.preventDefault()
      const audio = audioRef.current
      if (!audio) return
      if (audio.paused) void audio.play()
      else audio.pause()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  return useMemo(
    () => ({
      audioRef,
      onExternalPause,
      onExternalPlay,
      pause,
      play,
      release,
    }),
    [onExternalPause, onExternalPlay, pause, play, release],
  )
}
