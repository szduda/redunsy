'use client'

import { SpeakerIcon } from '@/features/icons/speaker-icon'
import { SpeakerMutedIcon } from '@/features/icons/speaker-muted-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { Popover, popoverTriggerOpenClass } from '@/features/groovy-player/popover'
import { VolumeSlider } from '@/features/groovy-player/track/volume-slider'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

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
  const displayVolume = muted ? 0 : volume

  return (
    <div
      className={cn(
        'flex items-center h-min rounded-lg bg-black/8 dark:bg-black/30 md:gap-1 md:border-transparent m-1',
        compact && 'shrink-0',
        className,
      )}
    >
      <IconButton
        active={muted}
        aria-label={muted ? 'Unmute track' : 'Mute track'}
        aria-pressed={!muted}
        className="!text-redy-light/80 px-4 hover:bg-white/10 rounded-r-none rounded-l-lg !scale-100 -mr-1"
        onClick={onToggleMute}
      >
        {muted ? <SpeakerMutedIcon className="size-5" /> : <SpeakerIcon className="size-5" />}
      </IconButton>

      {compact ? (
        <Popover
          panel={
            <div className="flex flex-col gap-3 items-center">
              <VolumeSlider
                muted={muted}
                onVolumeChange={onVolumeChange}
                vertical
                volume={volume}
              />
              <Text variant="mono" className="uppercase text-[10px] font-medium">
                Volume
              </Text>
            </div>
          }
          panelClassName="w-auto items-center p-3 rounded-lg"
          rootClassName="h-stretch"
        >
          {({ open, toggle }) => (
            <Button
              aria-expanded={open}
              className={cn(
                '!rounded-l-none !border-l border-l-zinc-200 font-semibold text-base dark:border-l-zinc-900 py-1 w-14 h-[37px]',
                KEYBOARD_FOCUS_VISIBLE_CLASS,
                open && popoverTriggerOpenClass,
              )}
              onClick={toggle}
              type="button"
              variant="subtle"
            >
              {displayVolume}
              <span className="opacity-80 scale-90 origin-bottom-right">%</span>
            </Button>
          )}
        </Popover>
      ) : (
        <VolumeSlider muted={muted} onVolumeChange={onVolumeChange} volume={volume} />
      )}
    </div>
  )
}
