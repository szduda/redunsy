'use client'

import { type ReactNode, useMemo, useState } from 'react'

import { trackHasPattern } from '@/features/editor/track-has-pattern'
import { IconButton } from '@/features/groovy-player/icon-button'
import { Popover, popoverTriggerOpenClass } from '@/features/groovy-player/popover'
import { SettingsIcon } from '@/features/icons/settings-icon'
import { INSTRUMENT_LABELS } from '@/features/rhythm/rhythm-helpers'
import {
  RHYTHM_INSTRUMENTS,
  type Rhythm,
  type RhythmInstrument,
  type Track,
} from '@/features/rhythm/rhythm.types'
import { Button } from '@/features/theme/button'
import { Switch } from '@/features/theme/switch'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type InstrumentTabsProps = {
  tracks: Track[]
  focusedTrackId: string
  rhythm: Rhythm
  onFocusTrack: (trackId: string) => void
  onUpdateInstruments: (layers: RhythmInstrument[]) => void
  trailing?: ReactNode
}

const layersEqual = (left: RhythmInstrument[], right: RhythmInstrument[]) =>
  left.length === right.length && left.every((layer, index) => layer === right[index])

const InstrumentConfigPanel = ({
  activeLayers,
  close,
  rhythm,
  onUpdateInstruments,
}: {
  activeLayers: RhythmInstrument[]
  close: () => void
  rhythm: Rhythm
  onUpdateInstruments: (layers: RhythmInstrument[]) => void
}) => {
  const [draftLayers, setDraftLayers] = useState(activeLayers)

  const showWarning = useMemo(
    () =>
      RHYTHM_INSTRUMENTS.some((instrument) => {
        if (!activeLayers.includes(instrument) || draftLayers.includes(instrument)) return false
        const track = rhythm.instruments[instrument]
        return track ? trackHasPattern(track.bars) : false
      }),
    [activeLayers, draftLayers, rhythm.instruments],
  )

  const unchanged = layersEqual(draftLayers, activeLayers)
  const canUpdate = draftLayers.length > 0 && !unchanged

  const onToggle = (instrument: RhythmInstrument, checked: boolean) => {
    setDraftLayers((current) =>
      checked
        ? current.includes(instrument)
          ? current
          : [...current, instrument]
        : current.filter((layer) => layer !== instrument),
    )
  }

  const onUpdate = () => {
    if (!canUpdate) return
    onUpdateInstruments(draftLayers)
    close()
  }

  return (
    <div className="flex w-64 flex-col gap-3 p-1">
      <Text className="text-xs font-semibold tracking-widest uppercase opacity-40">
        Instruments
      </Text>
      <div className="flex flex-col gap-3">
        {RHYTHM_INSTRUMENTS.map((instrument) => (
          <Switch
            key={instrument}
            checked={draftLayers.includes(instrument)}
            label={INSTRUMENT_LABELS[instrument]}
            onChange={(checked) => onToggle(instrument, checked)}
          />
        ))}
      </div>
      <div className="flex min-h-5 justify-center">
        <Text
          className={cn(
            'text-center text-xs font-semibold text-[#af8545] transition-opacity duration-200 dark:text-yellowy-light',
            showWarning ? 'opacity-100' : 'opacity-0',
          )}
        >
          ⚠️ Some of your data will be lost
        </Text>
      </div>
      <Button disabled={!canUpdate} onClick={onUpdate} variant="filled">
        Update
      </Button>
    </div>
  )
}

export const InstrumentTabs = ({
  tracks,
  focusedTrackId,
  rhythm,
  onFocusTrack,
  onUpdateInstruments,
  trailing,
}: InstrumentTabsProps) => {
  const activeLayers = useMemo(
    () => tracks.map((track) => track.instrument as RhythmInstrument),
    [tracks],
  )

  return (
    <div className="flex items-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
      <div className="flex min-w-0 flex-1 items-center gap-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tracks.map((track) => {
          const active = track.id === focusedTrackId
          return (
            <button
              key={track.id}
              className={cn(
                'shrink-0 -mb-0.5 border-2 px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-t-zinc-200/60 border-l-zinc-200/60 border-r-zinc-200/60 border-b-editor-surface text-zinc-900 dark:border-t-zinc-800/60 dark:border-l-zinc-800/60 dark:border-r-zinc-800/60 dark:border-b-editor-surface dark:text-zinc-100'
                  : 'border-editor-surface text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
              onClick={() => onFocusTrack(track.id)}
              type="button"
            >
              {track.name}
            </button>
          )
        })}
        <div className="shrink-0">
          <Popover
            panel={({ close }) => (
              <InstrumentConfigPanel
                activeLayers={activeLayers}
                close={close}
                onUpdateInstruments={onUpdateInstruments}
                rhythm={rhythm}
              />
            )}
            panelClassName="w-auto"
            preferredDirection="bottom"
          >
            {({ open, toggle }) => (
              <IconButton
                active={open}
                aria-expanded={open}
                aria-label="Configure instruments"
                className={cn('!p-1', open && popoverTriggerOpenClass)}
                onClick={toggle}
              >
                <SettingsIcon
                  className={cn('size-4', open ? 'text-yellowy opacity-100' : 'opacity-20')}
                />
              </IconButton>
            )}
          </Popover>
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}
