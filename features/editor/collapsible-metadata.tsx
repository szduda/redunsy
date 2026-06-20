'use client'

import { useState } from 'react'

import { swingBarSizeForMeter } from '@/features/groovy-player/player.store'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { CollapseLabel } from '@/features/groovy-player/track/collapse-label'
import { Input } from '@/features/theme/input'
import { Text } from '@/features/theme/text'

type CollapsibleMetadataProps = {
  rhythm: Rhythm
  onChange: (patch: Partial<Rhythm>) => void
}

export const CollapsibleMetadata = ({ rhythm, onChange }: CollapsibleMetadataProps) => {
  const [open, setOpen] = useState(false)

  return (
    <section className="border-b border-zinc-200/60 px-2 py-2 dark:border-zinc-800/60 md:px-4">
      <CollapseLabel collapsed={!open} onClick={() => setOpen((value) => !value)}>
        {rhythm.title}
      </CollapseLabel>
      {open ? (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <Text variant="mono">Title</Text>
            <Input onChange={(event) => onChange({ title: event.target.value })} value={rhythm.title} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <Text variant="mono">Author</Text>
            <Input onChange={(event) => onChange({ author: event.target.value })} value={rhythm.author} />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <Text variant="mono">Description</Text>
            <Input
              onChange={(event) => onChange({ description: event.target.value })}
              value={rhythm.description}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <Text variant="mono">Beat size</Text>
            <select
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              onChange={(event) => onChange({ meter: Number(event.target.value) as 3 | 4 })}
              value={rhythm.meter}
            >
              <option value={4}>4</option>
              <option value={3}>3</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <Text variant="mono">Tempo</Text>
            <Input
              max={200}
              min={60}
              onChange={(event) => onChange({ tempo: Number(event.target.value) })}
              type="number"
              value={rhythm.tempo}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <Text variant="mono">Swing pattern</Text>
            <Input
              maxLength={swingBarSizeForMeter(rhythm.meter)}
              onChange={(event) => onChange({ swingPattern: event.target.value })}
              value={rhythm.swingPattern}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <Text variant="mono">Signal pattern</Text>
            <Input
              onChange={(event) => onChange({ signalPattern: event.target.value })}
              value={rhythm.signalPattern}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <Text variant="mono">Tags (comma separated)</Text>
            <Input
              onChange={(event) =>
                onChange({
                  tags: event.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
              value={rhythm.tags.join(', ')}
            />
          </label>
        </div>
      ) : (
        <Text className="mt-1 opacity-70">
          {rhythm.meter}/4 · {rhythm.tempo} bpm · {Object.keys(rhythm.instruments).join(' · ')}
        </Text>
      )}
    </section>
  )
}
