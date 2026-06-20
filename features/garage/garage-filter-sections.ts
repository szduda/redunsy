'use client'

import { useMemo } from 'react'

import { useGarageFiltersStore } from '@/features/garage/garage-filters.store'
import { useGarageFilterOptions } from '@/features/garage/use-garage-filter-options'
import type { RhythmMeter } from '@/features/rhythm/rhythm.types'

export type GarageFilterSectionId = 'meter' | 'instruments' | 'artist' | 'origin' | 'tags'

export type GarageFilterSection = {
  id: GarageFilterSectionId
  title: string
  values: readonly string[]
  selected: string[]
  onToggle: (value: string) => void
  formatLabel?: (value: string) => string
}

const meterLabel = (value: RhythmMeter) => `on ${value}`

const meterFromLabel = (label: string): RhythmMeter => (label === 'on 3' ? 3 : 4)

const artistChipLabel = (value: string) => (value ? value : 'Various Artists')

export const useGarageFilterSections = (): GarageFilterSection[] => {
  const options = useGarageFilterOptions()
  const meter = useGarageFiltersStore((state) => state.meter)
  const instruments = useGarageFiltersStore((state) => state.instruments)
  const artist = useGarageFiltersStore((state) => state.artist)
  const origin = useGarageFiltersStore((state) => state.origin)
  const tags = useGarageFiltersStore((state) => state.tags)
  const toggleMeter = useGarageFiltersStore((state) => state.toggleMeter)
  const toggleInstrument = useGarageFiltersStore((state) => state.toggleInstrument)
  const toggleArtist = useGarageFiltersStore((state) => state.toggleArtist)
  const toggleOrigin = useGarageFiltersStore((state) => state.toggleOrigin)
  const toggleTag = useGarageFiltersStore((state) => state.toggleTag)

  const meterLabels = options.meter.map(meterLabel)

  return useMemo(() => {
    const sections: GarageFilterSection[] = []

    if (meterLabels.length) {
      sections.push({
        id: 'meter',
        title: 'Meter',
        values: meterLabels,
        selected: meter.map(meterLabel),
        onToggle: (label) => toggleMeter(meterFromLabel(label)),
      })
    }

    if (options.instruments.length) {
      sections.push({
        id: 'instruments',
        title: 'Instruments',
        values: options.instruments,
        selected: instruments,
        onToggle: (value) => toggleInstrument(value as typeof instruments[number]),
      })
    }

    if (options.artist.length) {
      sections.push({
        id: 'artist',
        title: 'Artist',
        values: options.artist,
        selected: artist,
        onToggle: toggleArtist,
        formatLabel: artistChipLabel,
      })
    }

    if (options.origin.length) {
      sections.push({
        id: 'origin',
        title: 'Origin',
        values: options.origin,
        selected: origin,
        onToggle: toggleOrigin,
      })
    }

    if (options.tags.length) {
      sections.push({
        id: 'tags',
        title: 'Tags',
        values: options.tags,
        selected: tags,
        onToggle: toggleTag,
      })
    }

    return sections
  }, [
    artist,
    instruments,
    meter,
    meterLabels,
    options.artist,
    options.instruments,
    options.origin,
    options.tags,
    origin,
    tags,
    toggleArtist,
    toggleInstrument,
    toggleMeter,
    toggleOrigin,
    toggleTag,
  ])
}
