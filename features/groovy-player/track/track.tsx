'use client'

import { useEffect, useState } from 'react'

import { BarsCanvas } from '@/features/groovy-player/canvas/bars-canvas'
import { previewWindowStart } from '@/features/groovy-player/demo-tracks'
import { TrackVolume } from '@/features/groovy-player/track/track-volume'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { CollapseLabel } from './collapse-label'
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
  const [collapsed, setCollapsed] = useState(false)
  const [volume, setVolume] = useState(50)
  const [muted, setMuted] = useState(false)

  const isMobile = useIsMobile()
  const collapsedBarsPerRow = isMobile ? 2 : 4

  useEffect(() => {
    onVolumeLevelChange?.(instrument, muted ? 0 : volume)
  }, [instrument, muted, onVolumeLevelChange, volume])

  const currentBar = trackActiveIndex(activeIndex, bars.length)
  const windowStart = previewWindowStart(currentBar, bars.length, collapsedBarsPerRow)
  const previewBars = bars.slice(windowStart, windowStart + collapsedBarsPerRow)
  const previewActiveIndex =
    currentBar >= windowStart && currentBar < windowStart + previewBars.length
      ? currentBar - windowStart
      : -1

  const compact = !isMobile && collapsed

  return (
    <section className={cn("flex justify-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 py-1 lg:py-2", compact ? 'pr-1 md:pr-2 lg:pr-4' : 'flex-col')}>
      <div className="flex items-center justify-between gap-2 lg:gap-3 flex-wrap px-1 md:px-2 lg:px-4">
        <CollapseLabel collapsed={collapsed} onClick={() => setCollapsed((value) => !value)}>
          {name}
        </CollapseLabel>

        <div className="md:flex-1 flex justify-end">
          <TrackVolume
            compact={collapsed || isMobile}
            muted={muted}
            onToggleMute={() => setMuted((value) => !value)}
            onVolumeChange={(value: number) => {
              setVolume(value)
              if (value > 0) setMuted(false)
            }}
            volume={volume}
          />
        </div>

        {!compact &&
          <span className="font-mono text-xs uppercase tracking-wide text-zinc-500">
            {instrument} · {bars.length} bar{bars.length === 1 ? '' : 's'}
          </span>
        }

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
