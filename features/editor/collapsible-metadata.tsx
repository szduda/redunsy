'use client'

import { useState } from 'react'

import { suggestFromOptions } from '@/features/editor/suggest-from-options'
import { GARAGE_FILTER_OPTIONS } from '@/features/garage/rhythm-index'
import { swingBarSizeForMeter, isSwingPatternEmpty } from '@/features/groovy-player/player.store'
import { SwingPatternField } from '@/features/groovy-player/swing-pattern-field'
import type { Rhythm } from '@/features/rhythm/rhythm.types'
import { CollapseLabel } from '@/features/groovy-player/track/collapse-label'
import { Input } from '@/features/theme/input'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'

type CollapsibleMetadataProps = {
  rhythm: Rhythm
  onChange: (patch: Partial<Rhythm>) => void
}

const fieldLabelClass = 'flex flex-col gap-1 text-sm'
const selectClass =
  'rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950'

const capitalize = (value: string) =>
  value.length ? value[0].toUpperCase() + value.slice(1) : value

const collapsedMetadataSummary = (rhythm: Rhythm) => {
  const parts: string[] = [`on ${rhythm.meter}`, `${rhythm.tempo} bpm`]
  if (rhythm.signalPattern.trim()) parts.push('with signal')
  if (!isSwingPatternEmpty(rhythm.swingPattern)) parts.push('with swing')
  parts.push(
    ...rhythm.rhythmGroup,
    ...rhythm.origin.map(capitalize),
    ...rhythm.author,
    ...rhythm.tags.filter((tag) => !rhythm.rhythmGroup.includes(tag)),
  )
  return parts.join(' · ')
}

export const CollapsibleMetadata = ({ rhythm, onChange }: CollapsibleMetadataProps) => {
  const [open, setOpen] = useState(false)

  return (
    <section className="border-b border-zinc-200/60 px-2 py-2 dark:border-zinc-800/60 md:px-4">
      <CollapseLabel collapsed={!open} onClick={() => setOpen((value) => !value)}>
        {rhythm.title}
      </CollapseLabel>
      {open ? (
        <div className="mt-3 grid grid-cols-12 gap-3">
          <label className={cn(fieldLabelClass, 'col-span-12')}>
            <Text variant="mono">Title</Text>
            <Input
              onChange={(event) => onChange({ title: event.target.value })}
              value={rhythm.title}
              className="w-full"
            />
          </label>

          <label className={cn(fieldLabelClass, 'col-span-12 mb-8')}>
            <Text variant="mono">Description</Text>
            <Input
              onChange={(event) => onChange({ description: event.target.value })}
              value={rhythm.description}
              className="w-full"
            />
          </label>

          <label className={cn(fieldLabelClass, 'col-span-3')}>
            <Text variant="mono">Beat size</Text>
            <select
              className={cn(selectClass, 'w-full')}
              onChange={(event) => onChange({ meter: Number(event.target.value) as 3 | 4 })}
              value={rhythm.meter}
            >
              <option value={4}>4</option>
              <option value={3}>3</option>
            </select>
          </label>

          <label className={cn(fieldLabelClass, 'col-span-3')}>
            <Text variant="mono">Tempo</Text>
            <Input
              max={200}
              min={60}
              onChange={(event) => onChange({ tempo: Number(event.target.value) })}
              type="number"
              value={rhythm.tempo}
              className="w-full"
            />
          </label>

          <label className={cn(fieldLabelClass, 'col-span-3')}>
            <Text variant="mono">Swing pattern</Text>
            <SwingPatternField
              barSize={swingBarSizeForMeter(rhythm.meter)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              onCommit={(swingPattern) => onChange({ swingPattern })}
              value={rhythm.swingPattern}
            />
          </label>
          <label className={cn(fieldLabelClass, 'col-span-3')}>
            <Text variant="mono">Signal pattern</Text>
            <Input
              onChange={(event) => onChange({ signalPattern: event.target.value })}
              value={rhythm.signalPattern}
            />
          </label>

          <label className={cn(fieldLabelClass, 'col-span-4')}>
            <Text variant="mono">Rhythm group</Text>
            <Input
              className="w-full"
              onChange={(rhythmGroup) => onChange({ rhythmGroup })}
              onGetSuggestions={suggestFromOptions(GARAGE_FILTER_OPTIONS.rhythmGroup)}
              value={rhythm.rhythmGroup}
            />
          </label>

          <label className={cn(fieldLabelClass, 'col-span-4')}>
            <Text variant="mono">Origin</Text>
            <Input
              className="w-full"
              onChange={(origin) => onChange({ origin })}
              onGetSuggestions={suggestFromOptions(GARAGE_FILTER_OPTIONS.origin)}
              value={rhythm.origin}
            />
          </label>

          <label className={cn(fieldLabelClass, 'col-span-4')}>
            <Text variant="mono">Artist</Text>
            <Input
              className="w-full"
              onChange={(author) => onChange({ author })}
              onGetSuggestions={suggestFromOptions(GARAGE_FILTER_OPTIONS.artist)}
              value={rhythm.author}
            />
          </label>

          <label className={cn(fieldLabelClass, 'col-span-12 mt-8 mb-2')}>
            <Text variant="mono">Tags</Text>
            <Input
              className="w-full"
              onChange={(tags) => onChange({ tags })}
              onGetSuggestions={suggestFromOptions(GARAGE_FILTER_OPTIONS.tags)}
              value={rhythm.tags}
            />
          </label>
        </div>
      ) : (
        <Text className="mt-1 opacity-70">{collapsedMetadataSummary(rhythm)}</Text>
      )}
    </section>
  )
}
