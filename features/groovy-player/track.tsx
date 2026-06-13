'use client'

import { useEffect, useState } from 'react'

import { BarsCanvas } from '@/features/groovy-player/canvas/bars-canvas'
import { previewWindowStart } from '@/features/groovy-player/demo-tracks'
import { TrackVolume } from '@/features/groovy-player/track-volume'
import { ChevronDownIcon } from '@/features/icons/chevron-down-icon'
import { ChevronUpIcon } from '@/features/icons/chevron-up-icon'
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

  useEffect(() => {
    onVolumeLevelChange?.(instrument, muted ? 0 : volume)
  }, [instrument, muted, onVolumeLevelChange, volume])

  const currentBar = trackActiveIndex(activeIndex, bars.length)
  const windowStart = previewWindowStart(currentBar, bars.length)
  const previewBars = bars.slice(windowStart, windowStart + 4)
  const previewActiveIndex =
    currentBar >= windowStart && currentBar < windowStart + previewBars.length
      ? currentBar - windowStart
      : -1

  const toggleCollapsed = () => setCollapsed((value) => !value)
  const toggleMute = () => setMuted((value) => !value)
  const onVolumeChange = (value: number) => {
    setVolume(value)
    if (value > 0) setMuted(false)
  }

  const collapseLabel = (compact = false) => (
    <button
      className={cn(
        'flex min-w-0 items-center gap-1 font-medium text-zinc-900 dark:text-zinc-100',
        compact && 'w-24 shrink-0',
      )}
      onClick={toggleCollapsed}
      type="button"
    >
      {collapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
      <span className={cn(compact && 'truncate')}>{name}</span>
    </button>
  )

  if (collapsed) {
    return (
      <section className="flex items-center gap-2 border-b border-zinc-200 py-2 dark:border-zinc-800">
        {collapseLabel(true)}
        <TrackVolume
          compact
          muted={muted}
          onToggleMute={toggleMute}
          onVolumeChange={onVolumeChange}
          volume={volume}
        />
        <div className="min-w-0 flex-1">
          <BarsCanvas
            activeIndex={previewActiveIndex}
            bars={previewBars}
            barsPerRow={4}
            id={`${id}-collapsed`}
            instrument={instrument}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-3">
        {collapseLabel()}
        <span className="font-mono text-xs pt-0.5 uppercase tracking-wide text-zinc-500">
          {instrument} · {bars.length} bar{bars.length === 1 ? '' : 's'}
        </span>
        <div className="ml-auto">
          <TrackVolume
            muted={muted}
            onToggleMute={toggleMute}
            onVolumeChange={onVolumeChange}
            volume={volume}
          />
        </div>
      </div>
      <BarsCanvas
        activeIndex={currentBar}
        bars={bars}
        barsPerRow={barsPerRow}
        id={id}
        instrument={instrument}
      />
    </section>
  )
}
