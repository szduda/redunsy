'use client'

import { GARAGE_FILTER_OPTIONS } from '@/features/garage/mock-snippets'
import {
  GarageFilterChipList,
  GarageFilterSection,
} from '@/features/garage/garage-filter-section'
import { useGarageFiltersStore } from '@/features/garage/garage-filters.store'

const METER_LABELS = ['on 3', 'on 4'] as const

const meterLabel = (value: 3 | 4) => `on ${value}` as (typeof METER_LABELS)[number]

const meterFromLabel = (label: string): 3 | 4 => (label === 'on 3' ? 3 : 4)

export const GarageFilters = () => {
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

  return (
    <div className="flex flex-col gap-5">
      <GarageFilterSection title="Meter">
        <GarageFilterChipList
          selected={meter.map(meterLabel)}
          values={METER_LABELS}
          onToggle={(label) => toggleMeter(meterFromLabel(label))}
        />
      </GarageFilterSection>

      <GarageFilterSection title="Instruments">
        <GarageFilterChipList
          selected={instruments}
          values={GARAGE_FILTER_OPTIONS.instruments}
          onToggle={toggleInstrument}
        />
      </GarageFilterSection>

      <GarageFilterSection title="Artist">
        <GarageFilterChipList selected={artist} values={GARAGE_FILTER_OPTIONS.artist} onToggle={toggleArtist} />
      </GarageFilterSection>

      <GarageFilterSection title="Origin">
        <GarageFilterChipList selected={origin} values={GARAGE_FILTER_OPTIONS.origin} onToggle={toggleOrigin} />
      </GarageFilterSection>

      <GarageFilterSection title="Tags">
        <GarageFilterChipList selected={tags} values={GARAGE_FILTER_OPTIONS.tags} onToggle={toggleTag} />
      </GarageFilterSection>
    </div>
  )
}
