'use client'

import { useState } from 'react'

import { SettingsIcon } from '@/features/icons/settings-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { cn } from '@/features/theme/cn'
import { MetronomeToggle } from '@/features/groovy-player/metronome-toggle'
import { PlayerSettingsPanel } from '@/features/groovy-player/player-settings-panel'
import { PlayerTransport } from '@/features/groovy-player/player-transport'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { BOTTOM_NAV_HEIGHT_CLASS } from '@/features/layout/constants'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { SwingToggle } from '@/features/groovy-player/swing-toggle'
import { TempoSlider } from '@/features/groovy-player/tempo-slider'

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
  const fullBleed = usePlayerStore((state) => state.fullBleed)
  const isMobile = useIsMobile()

  const settingsButton = (
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
        />

        {isMobile ? settingsButton : null}

        <div className="flex items-center gap-1 md:gap-2">
          <TempoSlider />
          <MetronomeToggle />
          <SwingToggle />
        </div>
      </div>

      {!isMobile ? (
        <div
          className={cn(
            'fixed right-0 bottom-0 z-30 flex items-center pr-2 md:pr-4',
            BOTTOM_NAV_HEIGHT_CLASS,
          )}
        >
          {settingsButton}
        </div>
      ) : null}

      <PlayerSettingsPanel onClose={() => setSettingsOpen(false)} open={settingsOpen} />
    </>
  )
}
