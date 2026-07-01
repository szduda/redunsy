'use client'

import { type ChangeEvent, type KeyboardEvent, type PointerEvent, type Ref } from 'react'

import { Popover, popoverTriggerOpenClass } from '@/features/groovy-player/popover'
import { usePlayerStore } from '@/features/groovy-player/player.store'
import { useIsMobile } from '@/features/shared/use-is-mobile'
import { Button } from '@/features/theme/button'
import { cn } from '@/features/theme/cn'
import { Text } from '@/features/theme/text'

const MIN_TEMPO = 60
const MAX_TEMPO = 200
const TEMPO_STEP = 5

const verticalSliderClass =
  'h-1 w-24 appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100'

const horizontalSliderClass =
  'h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100'

const clampTempo = (value: number) =>
  Math.round(Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, value)) / TEMPO_STEP) * TEMPO_STEP

const tempoFromClientY = (clientY: number, track: HTMLElement) => {
  const { top, height } = track.getBoundingClientRect()
  const ratio = 1 - (clientY - top) / height
  return clampTempo(MIN_TEMPO + ratio * (MAX_TEMPO - MIN_TEMPO))
}

type TempoSliderInputProps = {
  tempo: number
  onTempoChange: (tempo: number) => void
  className?: string
  vertical?: boolean
  focusRef?: Ref<HTMLInputElement>
}

const TempoMinMaxLabels = ({ vertical = false }: { vertical?: boolean }) => (
  <div
    className={cn(
      'font-mono text-xs text-zinc-500',
      vertical
        ? 'flex h-24 flex-col-reverse justify-between text-right'
        : 'flex w-full justify-between',
    )}
  >
    <span>{MIN_TEMPO}</span>
    <span>{MAX_TEMPO}</span>
  </div>
)

const VerticalTempoSlider = ({
  tempo,
  onTempoChange,
  className,
}: Omit<TempoSliderInputProps, 'vertical'>) => {
  const setTempoFromPointer = ({
    currentTarget,
    clientY,
    pointerId,
  }: PointerEvent<HTMLDivElement>) => {
    if (!currentTarget.hasPointerCapture(pointerId)) return
    onTempoChange(tempoFromClientY(clientY, currentTarget))
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    onTempoChange(tempoFromClientY(event.clientY, event.currentTarget))
  }

  const onKeyDown = ({ key }: KeyboardEvent<HTMLDivElement>) => {
    if (key === 'ArrowUp' || key === 'ArrowRight') onTempoChange(clampTempo(tempo + TEMPO_STEP))
    if (key === 'ArrowDown' || key === 'ArrowLeft') onTempoChange(clampTempo(tempo - TEMPO_STEP))
  }

  return (
    <div
      aria-label="Tempo"
      aria-orientation="vertical"
      aria-valuemax={MAX_TEMPO}
      aria-valuemin={MIN_TEMPO}
      aria-valuenow={tempo}
      className="flex h-24 w-8 touch-none cursor-pointer items-center justify-center"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={setTempoFromPointer}
      role="slider"
      tabIndex={0}
    >
      <input
        aria-hidden
        className={cn('pointer-events-none', verticalSliderClass, '-rotate-90', className)}
        max={MAX_TEMPO}
        min={MIN_TEMPO}
        readOnly
        step={TEMPO_STEP}
        tabIndex={-1}
        type="range"
        value={tempo}
      />
    </div>
  )
}

const VerticalTempoSliderWithLabels = ({
  tempo,
  onTempoChange,
}: Omit<TempoSliderInputProps, 'vertical' | 'className'>) => (
  <div className="flex items-center gap-2">
    <TempoMinMaxLabels vertical />
    <VerticalTempoSlider onTempoChange={onTempoChange} tempo={tempo} />
  </div>
)

const TempoSliderInput = ({
  tempo,
  onTempoChange,
  className,
  vertical = false,
  focusRef,
}: TempoSliderInputProps) => {
  if (vertical)
    return <VerticalTempoSlider className={className} onTempoChange={onTempoChange} tempo={tempo} />

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) =>
    onTempoChange(Number(target.value))

  return (
    <input
      ref={focusRef}
      aria-label="Tempo"
      className={cn('cursor-pointer', horizontalSliderClass, className)}
      max={MAX_TEMPO}
      min={MIN_TEMPO}
      onChange={onChange}
      step={TEMPO_STEP}
      type="range"
      value={tempo}
    />
  )
}

const DesktopTempoSlider = ({
  tempo,
  onTempoChange,
  focusRef,
}: Omit<TempoSliderInputProps, 'vertical' | 'className'> & {
  focusRef?: Ref<HTMLInputElement>
}) => (
  <div className="flex w-40 flex-col items-end gap-1 pr-5">
    <Text variant="mono" className="font-bold">
      {tempo} BPM
    </Text>
    <TempoSliderInput
      className="w-full"
      focusRef={focusRef}
      onTempoChange={onTempoChange}
      tempo={tempo}
    />
    <TempoMinMaxLabels />
  </div>
)

const MobileTempoSlider = ({
  tempo,
  onTempoChange,
}: Omit<TempoSliderInputProps, 'vertical' | 'className' | 'focusRef'>) => (
  <Popover
    panel={
      <div className="flex flex-col items-center gap-3">
        <VerticalTempoSliderWithLabels onTempoChange={onTempoChange} tempo={tempo} />
        <Text variant="mono" className="text-[10px] font-medium uppercase">
          Tempo
        </Text>
      </div>
    }
    panelClassName="w-auto items-center rounded-lg p-3"
  >
    {({ open, toggle }) => (
      <Button
        aria-expanded={open}
        aria-label={`Tempo ${tempo} BPM`}
        className={cn('flex-col mr-1.5', open && popoverTriggerOpenClass)}
        onClick={toggle}
        type="button"
        variant="subtle"
      >
        <Text
          variant="mono"
          className={cn(
            'translate-y-1 text-[20px] font-black leading-none',
            open ? '!text-yellowy' : '!text-zinc-500 dark:!text-white',
          )}
        >
          {tempo}
        </Text>
        <Text
          variant="mono"
          className={cn(
            'w-full translate-y-1 text-right text-xs font-bold uppercase tracking-widest',
            open ? 'text-yellowy' : 'text-inherit',
          )}
        >
          BPM
        </Text>
      </Button>
    )}
  </Popover>
)

export const TempoSlider = ({
  focusRef,
}: {
  focusRef?: Ref<HTMLInputElement | HTMLButtonElement>
} = {}) => {
  const isMobile = useIsMobile()
  const tempo = usePlayerStore((state) => state.tempo)
  const setTempo = usePlayerStore((state) => state.setTempo)

  return isMobile ? (
    <MobileTempoSlider onTempoChange={setTempo} tempo={tempo} />
  ) : (
    <DesktopTempoSlider
      focusRef={focusRef as Ref<HTMLInputElement>}
      onTempoChange={setTempo}
      tempo={tempo}
    />
  )
}
