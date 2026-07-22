'use client'

import { useEffect, useState } from 'react'

import { suggestFromOptions } from '@/features/editor/suggest-from-options'
import { GARAGE_FILTER_OPTIONS } from '@/features/garage/rhythm-index'
import { swingBarSizeForMeter, isSwingPatternEmpty } from '@/features/groovy-player/player.store'
import { SwingPatternField } from '@/features/groovy-player/swing-pattern-field'
import { slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm, RhythmMeter } from '@/features/rhythm/rhythm.types'
import { Input } from '@/features/theme/input'
import { Text } from '@/features/theme/text'
import { cn } from '@/features/theme/cn'
import { KEYBOARD_FOCUS_VISIBLE_CLASS } from '@/features/theme/keyboard-focus'

export type RhythmMetadataValues = Pick<
  Rhythm,
  | 'title'
  | 'description'
  | 'meter'
  | 'tempo'
  | 'swingPattern'
  | 'signalPattern'
  | 'rhythmGroup'
  | 'origin'
  | 'author'
  | 'tags'
> & {
  /** Present for saved rhythms; creator draft may omit until save. */
  slug?: string
}

type RhythmMetadataFormProps = {
  values: RhythmMetadataValues
  onChange: (patch: Partial<RhythmMetadataValues>) => void
  onTitleBlur?: (title: string) => void
  titlePlaceholder?: string
}

const fieldLabelClass = 'flex flex-col gap-1 text-sm'
const beatSizeOptions = [3, 4] as const
const beatSizeChipClass = (active: boolean) =>
  cn(
    KEYBOARD_FOCUS_VISIBLE_CLASS,
    'rounded-md border flex-1 px-2.5 py-1.5 text-base transition-colors',
    active
      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
      : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500',
  )

const capitalize = (value: string) =>
  value.length ? value[0].toUpperCase() + value.slice(1) : value

export const metadataSummary = (values: RhythmMetadataValues, instruments: string[] = []) => {
  const parts: string[] = [`on ${values.meter}`, `${values.tempo} bpm`]
  if (values.signalPattern.trim()) parts.push('with signal')
  if (!isSwingPatternEmpty(values.swingPattern)) parts.push('with swing')
  if (values.description.trim()) parts.push(values.description.trim())
  parts.push(
    ...values.rhythmGroup,
    ...values.origin.map(capitalize),
    ...values.author,
    ...values.tags.filter((tag) => !values.rhythmGroup.includes(tag)),
  )
  if (instruments.length) parts.push(...instruments)
  return parts.join(' · ')
}

export const RhythmMetadataForm = ({
  values,
  onChange,
  onTitleBlur,
  titlePlaceholder,
}: RhythmMetadataFormProps) => {
  const [titleDraft, setTitleDraft] = useState(values.title)
  const slugDisplay =
    values.slug?.trim() || (titleDraft.trim() ? slugFromTitle(titleDraft.trim()) : '')

  useEffect(() => {
    setTitleDraft(values.title)
  }, [values.title])

  return (
    <div className="grid grid-cols-12 gap-3">
      <label className={cn(fieldLabelClass, 'col-span-6')}>
        <Text variant="mono">Title</Text>
        <Input
          className="w-full"
          onBlur={() => {
            const trimmed = titleDraft.trim()
            if (trimmed !== values.title) onTitleBlur?.(trimmed)
            onChange({ title: trimmed })
          }}
          onChange={(event) => setTitleDraft(event.target.value)}
          placeholder={titlePlaceholder}
          value={titleDraft}
        />
      </label>

      <label className={cn(fieldLabelClass, 'col-span-6')}>
        <Text variant="mono">Slug</Text>
        <Input
          className="w-full cursor-default opacity-70"
          placeholder="auto-generated"
          readOnly
          tabIndex={-1}
          value={slugDisplay}
        />
      </label>

      <label className={cn(fieldLabelClass, 'col-span-12 mb-8 md:mb-4')}>
        <Text variant="mono">Description</Text>
        <Input
          className="w-full"
          onChange={(event) => onChange({ description: event.target.value })}
          value={values.description}
        />
      </label>

      <div className={cn(fieldLabelClass, 'col-span-6 md:col-span-3')}>
        <Text variant="mono">Meter</Text>
        <div className="flex flex-wrap gap-2">
          {beatSizeOptions.map((meter) => {
            const active = values.meter === meter
            return (
              <button
                key={meter}
                aria-pressed={active}
                className={beatSizeChipClass(active)}
                onClick={() => onChange({ meter: meter as RhythmMeter })}
                type="button"
              >
                on {meter}
              </button>
            )
          })}
        </div>
      </div>

      <label className={cn(fieldLabelClass, 'col-span-6 md:col-span-3')}>
        <Text variant="mono">Tempo</Text>
        <Input
          className="w-full"
          max={200}
          min={60}
          onChange={(event) => onChange({ tempo: Number(event.target.value) })}
          type="number"
          value={values.tempo}
        />
      </label>

      <label className={cn(fieldLabelClass, 'col-span-6 md:col-span-3')}>
        <Text variant="mono">Swing pattern</Text>
        <SwingPatternField
          barSize={swingBarSizeForMeter(values.meter)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          onCommit={(swingPattern) => onChange({ swingPattern })}
          value={values.swingPattern}
        />
      </label>
      <label className={cn(fieldLabelClass, 'col-span-6 md:col-span-3')}>
        <Text variant="mono">Signal pattern</Text>
        <Input
          className="w-full"
          onChange={(event) => onChange({ signalPattern: event.target.value })}
          value={values.signalPattern}
        />
      </label>

      <div className="col-span-12 py-2" />

      <label className={cn(fieldLabelClass, 'col-span-12 md:col-span-4')}>
        <Text variant="mono">Rhythm group</Text>
        <Input
          className="w-full"
          onChange={(rhythmGroup) => onChange({ rhythmGroup })}
          onGetSuggestions={suggestFromOptions(GARAGE_FILTER_OPTIONS.rhythmGroup)}
          value={values.rhythmGroup}
        />
      </label>

      <label className={cn(fieldLabelClass, 'col-span-6 md:col-span-4')}>
        <Text variant="mono">Origin</Text>
        <Input
          className="w-full"
          onChange={(origin) => onChange({ origin })}
          onGetSuggestions={suggestFromOptions(GARAGE_FILTER_OPTIONS.origin)}
          value={values.origin}
        />
      </label>

      <label className={cn(fieldLabelClass, 'col-span-6 md:col-span-4')}>
        <Text variant="mono">Artist</Text>
        <Input
          className="w-full"
          onChange={(author) => onChange({ author })}
          onGetSuggestions={suggestFromOptions(GARAGE_FILTER_OPTIONS.artist)}
          value={values.author}
        />
      </label>

      <label className={cn(fieldLabelClass, 'col-span-12 mb-2')}>
        <Text variant="mono">Tags</Text>
        <Input
          className="w-full"
          onChange={(tags) => onChange({ tags })}
          onGetSuggestions={suggestFromOptions(GARAGE_FILTER_OPTIONS.tags)}
          value={values.tags}
        />
      </label>
    </div>
  )
}
