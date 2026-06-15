'use client'

import { SpeakerIcon } from '@/features/icons/speaker-icon'
import { SpeakerMutedIcon } from '@/features/icons/speaker-muted-icon'
import { IconButton } from '@/features/groovy-player/icon-button'
import { Popover, popoverTriggerOpenClass } from '@/features/groovy-player/popover'
import { VolumeSlider } from '@/features/groovy-player/track/volume-slider'
import { Button } from '@/features/theme/button'
import { Text } from '@/features/theme/text'
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
}: TrackVolumeProps) => (
  <div
    className={cn(
      'flex items-center rounded-lg bg-zinc-50 md:gap-1 dark:bg-zinc-900',
      compact && 'shrink-0',
      className,
    )}
  >
    <IconButton
      active={muted}
      aria-label={muted ? 'Unmute track' : 'Mute track'}
      aria-pressed={!muted}
      className="text-yellowy"
      onClick={onToggleMute}
    >
      {muted ?
        <SpeakerMutedIcon className="size-4 lg:size-5" /> :
        <SpeakerIcon className="size-4 lg:size-5" />
      }
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
            <Text variant="mono" className="uppercase text-[10px] font-medium">Volume</Text>
          </div>
        }
        panelClassName="w-auto items-center p-3 rounded-lg"
      >
        {({ open, toggle }) => (
          <Button
            aria-expanded={open}
            className={cn(
              '!rounded-l-none !border-l border-l-black font-semibold text-lg',
              open && popoverTriggerOpenClass,
            )}
            onClick={toggle}
            type="button"
            variant="subtle"
          >
            {volume}
            <span className="opacity-80 scale-90 origin-bottom-right">%</span>
          </Button>
        )}
      </Popover>
    ) : (
      <VolumeSlider muted={muted} onVolumeChange={onVolumeChange} volume={volume} />
    )}
  </div>
)
