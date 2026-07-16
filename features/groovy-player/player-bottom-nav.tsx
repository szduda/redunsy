'use client'

import { useCallback, useRef, useState } from 'react'

import { SettingsIcon } from '@/features/icons/settings-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { cn } from '@/features/theme/cn'
import { focusFromKeyboard } from '@/features/theme/keyboard-focus'
import { MetronomeToggle } from '@/features/groovy-player/metronome-toggle'
import { PLAYER_HINTS } from '@/features/groovy-player/player-keyboard-hints'
import { PlayerSettingsPanel } from '@/features/groovy-player/player-settings-panel'
import { PlayerTransport } from '@/features/groovy-player/player-transport'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { BOTTOM_NAV_HEIGHT_CLASS } from '@/features/layout/constants'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { useIsTablet } from '@/features/shared/use-is-tablet'
import { KeyboardHintWrap } from '@/features/shared/keyboard-hint-wrap'
import { SwingToggle } from '@/features/groovy-player/swing-toggle'
import { TempoSlider } from '@/features/groovy-player/tempo-slider'
import { usePlayerKeyboard } from '@/features/groovy-player/use-player-keyboard'
import { useSpaceTogglePlay } from '@/features/groovy-player/use-space-toggle-play'

type PlayerBottomNavProps = {
  isPlaying: boolean
  onPlayPause: () => void
  onRestart: () => void
  onStop: () => void
}

export const PlayerBottomNav = ({
  isPlaying,
  onPlayPause,
  onRestart,
  onStop,
}: PlayerBottomNavProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsTriggerRef = useRef<HTMLSpanElement>(null)
  const fullBleed = usePlayerStore((state) => state.fullBleed)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const useInlineSettings = isMobile || isTablet
  const tempoFocusRef = useRef<HTMLInputElement | HTMLButtonElement>(null)
  const playPauseRef = useRef<HTMLButtonElement>(null)
  const stopRef = useRef<HTMLButtonElement>(null)
  const metronomeRef = useRef<HTMLButtonElement>(null)
  const swingRef = useRef<HTMLButtonElement>(null)

  const focusPlayPause = useCallback(() => focusFromKeyboard(playPauseRef.current), [])
  const focusStop = useCallback(() => focusFromKeyboard(stopRef.current), [])
  const focusMetronome = useCallback(() => focusFromKeyboard(metronomeRef.current), [])
  const focusSwing = useCallback(() => focusFromKeyboard(swingRef.current), [])
  const focusTempo = useCallback(() => focusFromKeyboard(tempoFocusRef.current), [])

  useSpaceTogglePlay({ onToggle: onPlayPause, focusPlayPause })

  usePlayerKeyboard({
    onStop,
    focusTempo,
    focusStop,
    focusMetronome,
    focusSwing,
  })

  const settingsButton = (
    <span ref={settingsTriggerRef} className="inline-flex">
      <IconButton
        active={settingsOpen}
        aria-expanded={settingsOpen}
        aria-label="Player settings"
        onClick={() => setSettingsOpen((value) => !value)}
      >
        <SettingsIcon
          className={cn('size-6', settingsOpen ? 'text-yellowy opacity-100' : 'opacity-20')}
        />
      </IconButton>
    </span>
  )

  return (
    <>
      <div
        className={cn(
          'mx-auto flex h-full w-full items-center justify-between gap-2 px-2 py-2',
          fullBleed ? 'md:pr-24 md:pl-4' : 'max-w-4xl md:px-0',
        )}
      >
        <PlayerTransport
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onRestart={onRestart}
          onStop={onStop}
          playPauseRef={playPauseRef}
          stopRef={stopRef}
        />

        {useInlineSettings ? settingsButton : null}

        <div className="flex items-center gap-1 md:gap-2">
          <KeyboardHintWrap hint={PLAYER_HINTS.tempo.key} label={PLAYER_HINTS.tempo.label}>
            <TempoSlider focusRef={tempoFocusRef} />
          </KeyboardHintWrap>
          <KeyboardHintWrap hint={PLAYER_HINTS.metronome.key} label={PLAYER_HINTS.metronome.label}>
            <MetronomeToggle focusRef={metronomeRef} />
          </KeyboardHintWrap>
          <KeyboardHintWrap hint={PLAYER_HINTS.swing.key} label={PLAYER_HINTS.swing.label}>
            <SwingToggle focusRef={swingRef} />
          </KeyboardHintWrap>
        </div>
      </div>

      {!useInlineSettings ? (
        <div
          className={cn(
            'fixed right-0 bottom-0 z-30 flex items-center pr-2 md:pr-4',
            BOTTOM_NAV_HEIGHT_CLASS,
          )}
        >
          {settingsButton}
        </div>
      ) : null}

      <PlayerSettingsPanel
        excludeRef={settingsTriggerRef}
        onClose={() => setSettingsOpen(false)}
        open={settingsOpen}
      />
    </>
  )
}
