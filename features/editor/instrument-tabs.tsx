'use client'

import { useMemo, useState } from 'react'

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
      <div className="min-h-5">
        <Text
          className={cn(
            'text-xs text-yellowy transition-opacity duration-200',
            showWarning ? 'opacity-100' : 'opacity-0',
          )}
        >
          Turning off an instrument removes its pattern permanently.
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
}: InstrumentTabsProps) => {
  const activeLayers = useMemo(
    () => tracks.map((track) => track.instrument as RhythmInstrument),
    [tracks],
  )

  return (
    <div className="flex items-end gap-0 border-b border-zinc-200/60 px-2 dark:border-zinc-800/60 md:px-4">
      {tracks.map((track) => {
        const active = track.id === focusedTrackId
        return (
          <button
            key={track.id}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
            )}
            onClick={() => onFocusTrack(track.id)}
            type="button"
          >
            {track.name}
          </button>
        )
      })}
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
            className={cn('mb-0.5 !p-1', open && popoverTriggerOpenClass)}
            onClick={toggle}
          >
            <SettingsIcon
              className={cn('size-4', open ? 'text-yellowy opacity-100' : 'opacity-20')}
            />
          </IconButton>
        )}
      </Popover>
    </div>
  )
}
