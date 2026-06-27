'use client'

import { useState } from 'react'

import { metadataSummary, RhythmMetadataForm } from '@/features/editor/rhythm-metadata-form'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { CollapseLabel } from '@/features/groovy-player/track/collapse-label'
import { Text } from '@/features/theme/text'

type CollapsibleMetadataProps = {
  rhythm: Rhythm
  onChange: (patch: Partial<Rhythm>) => void
  onTitleBlur: (title: string) => void
}

export const CollapsibleMetadata = ({
  rhythm,
  onChange,
  onTitleBlur,
}: CollapsibleMetadataProps) => {
  const [open, setOpen] = useState(false)

  return (
    <section className="border-b border-zinc-200/60 px-2 py-2 dark:border-zinc-800/60 md:px-4">
      <CollapseLabel collapsed={!open} onClick={() => setOpen((value) => !value)}>
        {rhythm.title}
      </CollapseLabel>
      {open ? (
        <div className="mt-3">
          <RhythmMetadataForm onChange={onChange} onTitleBlur={onTitleBlur} values={rhythm} />
        </div>
      ) : (
        <Text className="mt-1 opacity-70">{metadataSummary(rhythm)}</Text>
      )}
    </section>
  )
}
