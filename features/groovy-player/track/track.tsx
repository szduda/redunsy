'use client'

import { useState } from 'react'

import { BarsCanvas } from '@/features/groovy-player/canvas/bars-canvas'
import { previewWindowStart } from '@/features/groovy-player/demo-tracks'
import { TrackVolume } from '@/features/groovy-player/track/track-volume'
import { useTrackVolume } from '@/features/groovy-player/track/use-track-volume'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { CollapseLabel } from './collapse-label'
import { repeatBarsToFillCols } from './repeat-bars-to-fill-cols'
import { cn } from '@/features/theme/cn'

type TrackProps = {
  id: string
  name: string
  instrument: string
  bars: string[]
  activeIndex?: number
  barsPerRow: number
  onVolumeLevelChange?: (instrument: string, level: number) => void
}

const MIN_EXPANDABLE_BARS = 3

const trackActiveIndex = (activeIndex: number | undefined, barCount: number) =>
  activeIndex !== undefined && activeIndex >= 0 ? activeIndex % barCount : -1

export const Track = ({
  id,
  name,
  instrument,
  bars,
  activeIndex = -1,
  barsPerRow,
  onVolumeLevelChange,
}: TrackProps) => {
  const isShortTrack = bars.length < MIN_EXPANDABLE_BARS
  const [collapsed, setCollapsed] = useState(isShortTrack)
  const { volume, muted, onVolumeChange, onToggleMute } = useTrackVolume(
    instrument,
    onVolumeLevelChange,
  )

  const isMobile = useIsMobile()
  const collapsedBarsPerRow = isMobile ? 2 : 4

  const currentBar = trackActiveIndex(activeIndex, bars.length)
  const windowStart = previewWindowStart(currentBar, bars.length, collapsedBarsPerRow)
  const sourcePreviewBars = bars.slice(windowStart, windowStart + collapsedBarsPerRow)
  const previewBars = repeatBarsToFillCols(sourcePreviewBars, collapsedBarsPerRow)
  const previewActiveIndex =
    currentBar >= windowStart && currentBar < windowStart + sourcePreviewBars.length
      ? (currentBar - windowStart) % previewBars.length
      : -1

  const compact = !isMobile && collapsed

  return (
    <section
      className={cn(
        'bg-greeny-dark/10 dark:bg-transparent flex justify-center gap-2 border-b last:border-b-0 border-zinc-200/60 dark:border-zinc-800/60',
        compact ? 'pr-1 md:pr-2 lg:pr-4' : 'flex-col',
      )}
    >
      <div className="flex items-center justify-between gap-2 lg:gap-3 flex-wrap px-1 md:px-2 lg:px-4">
        <CollapseLabel
          collapsed={collapsed}
          disabled={isShortTrack}
          onClick={() => setCollapsed((value) => !value)}
          className={cn(compact ? 'w-24' : 'lg:w-auto flex-1')}
        >
          {name}
        </CollapseLabel>

        <div className="md:flex-1 flex justify-end">
          <TrackVolume
            compact={collapsed || isMobile}
            muted={muted}
            onToggleMute={onToggleMute}
            onVolumeChange={onVolumeChange}
            volume={volume}
          />
        </div>

        {!compact && (
          <span className="font-mono text-xs uppercase tracking-wide text-zinc-500">
            {instrument} · {bars.length} bar{bars.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <BarsCanvas
        activeIndex={collapsed ? previewActiveIndex : currentBar}
        bars={collapsed ? previewBars : bars}
        barsPerRow={collapsed ? collapsedBarsPerRow : barsPerRow}
        id={id}
        instrument={instrument}
      />
    </section>
  )
}
