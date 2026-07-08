'use client'

import { type ChangeEvent, type KeyboardEvent, type PointerEvent } from 'react'

import { cn } from '@/features/theme/cn'

type VolumeSliderProps = {
  volume: number
  muted: boolean
  onVolumeChange: (volume: number) => void
  className?: string
  vertical?: boolean
}

const horizontalSliderClass =
  'h-1 w-24 mr-3 appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100'

const clampVolume = (value: number) => Math.round(Math.min(100, Math.max(0, value)))

const volumeFromClientY = (clientY: number, track: HTMLElement) => {
  const { top, height } = track.getBoundingClientRect()
  return clampVolume(((top + height - clientY) / height) * 100)
}

const VerticalVolumeSlider = ({
  volume,
  muted,
  onVolumeChange,
  className,
}: Omit<VolumeSliderProps, 'vertical'>) => {
  const displayVolume = muted ? 0 : volume

  const setVolumeFromPointer = ({
    currentTarget,
    clientY,
    pointerId,
  }: PointerEvent<HTMLDivElement>) => {
    if (!currentTarget.hasPointerCapture(pointerId)) return
    onVolumeChange(volumeFromClientY(clientY, currentTarget))
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    onVolumeChange(volumeFromClientY(event.clientY, event.currentTarget))
  }

  const onKeyDown = ({ key }: KeyboardEvent<HTMLDivElement>) => {
    if (key === 'ArrowUp' || key === 'ArrowRight') onVolumeChange(clampVolume(displayVolume + 1))
    if (key === 'ArrowDown' || key === 'ArrowLeft') onVolumeChange(clampVolume(displayVolume - 1))
  }

  return (
    <div
      aria-label="Track volume"
      aria-orientation="vertical"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={displayVolume}
      className="flex h-24 w-8 touch-none cursor-pointer items-center justify-center"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={setVolumeFromPointer}
      role="slider"
      tabIndex={0}
    >
      <input
        aria-hidden
        className={cn('pointer-events-none', horizontalSliderClass, '-rotate-90', className)}
        key={muted ? 'muted' : 'unmuted'}
        max={100}
        min={0}
        readOnly
        tabIndex={-1}
        type="range"
        value={displayVolume}
      />
    </div>
  )
}

export const VolumeSlider = ({
  volume,
  muted,
  onVolumeChange,
  className,
  vertical = false,
}: VolumeSliderProps) => {
  if (vertical) {
    return (
      <VerticalVolumeSlider
        className={className}
        muted={muted}
        onVolumeChange={onVolumeChange}
        volume={volume}
      />
    )
  }

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) =>
    onVolumeChange(Number(target.value))

  return (
    <input
      aria-label="Track volume"
      className={cn('cursor-pointer', horizontalSliderClass, className)}
      key={muted ? 'muted' : 'unmuted'}
      max={100}
      min={0}
      onChange={onChange}
      onInput={onChange}
      step={1}
      type="range"
      value={muted ? 0 : volume}
    />
  )
}
