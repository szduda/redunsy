'use client'

import { useState } from 'react'

import { MeterChangeModal } from '@/features/editor/meter-change-modal'
import { metadataSummary, RhythmMetadataForm } from '@/features/editor/rhythm-metadata-form'
import type { Rhythm, RhythmMeter } from '@/features/rhythm/rhythm.types'
import { tracksFromRecord } from '@/features/rhythm/rhythm-helpers'
import { CollapseLabel } from '@/features/groovy-player/track/collapse-label'
import { Text } from '@/features/theme/text'

type CollapsibleMetadataProps = {
  rhythm: Rhythm
  onChange: (patch: Partial<Rhythm>) => void
  onMeterChange: (meter: RhythmMeter, clearTrackIds: string[]) => void
  onTitleBlur: (title: string) => void
}

export const CollapsibleMetadata = ({
  rhythm,
  onChange,
  onMeterChange,
  onTitleBlur,
}: CollapsibleMetadataProps) => {
  const [open, setOpen] = useState(false)
  const [pendingMeter, setPendingMeter] = useState<RhythmMeter | null>(null)
  const tracks = tracksFromRecord(rhythm.instruments)

  const handleChange = (patch: Partial<Rhythm>) => {
    if (patch.meter !== undefined && patch.meter !== rhythm.meter && tracks.length > 0) {
      setPendingMeter(patch.meter)
      return
    }
    onChange(patch)
  }

  const closeMeterModal = () => setPendingMeter(null)

  const confirmMeterWithoutClear = () => {
    if (pendingMeter === null) return
    onMeterChange(pendingMeter, [])
    closeMeterModal()
  }

  const confirmMeterWithClear = (clearTrackIds: string[]) => {
    if (pendingMeter === null) return
    onMeterChange(pendingMeter, clearTrackIds)
    closeMeterModal()
  }

  return (
    <section className="px-2 py-2 md:px-4">
      <CollapseLabel collapsed={!open} onClick={() => setOpen((value) => !value)}>
        {rhythm.title}
      </CollapseLabel>
      {open ? (
        <div className="mt-3">
          <RhythmMetadataForm onChange={handleChange} onTitleBlur={onTitleBlur} values={rhythm} />
        </div>
      ) : (
        <Text className="mt-1 opacity-70">{metadataSummary(rhythm)}</Text>
      )}
      <MeterChangeModal
        onCancel={closeMeterModal}
        onClear={confirmMeterWithClear}
        onWhatever={confirmMeterWithoutClear}
        open={pendingMeter !== null}
        tracks={tracks}
      />
    </section>
  )
}
