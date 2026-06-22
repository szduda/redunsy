'use client'

import {
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

import { InputChip } from '@/features/theme/input-chip'
import { InputSuggestionsPopover } from '@/features/theme/input-suggestions-popover'
import { cn } from './cn'

const base =
  'rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

const chipsShellClass = 'flex w-[200px] flex-wrap items-center gap-1 px-2 py-1.5'

type InputBaseProps = Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'defaultValue'>

export type TextInputProps = InputBaseProps & {
  value?: string | number | readonly string[]
  onChange?: ChangeEventHandler<HTMLInputElement>
  onGetSuggestions?: (value: string) => string[]
}

export type ChipsInputProps = InputBaseProps & {
  value: string[]
  onChange: (values: string[]) => void
  onGetSuggestions?: (value: string) => string[]
}

export type InputProps = TextInputProps | ChipsInputProps

const isChipsInput = (props: InputProps): props is ChipsInputProps => Array.isArray(props.value)

const appendChip = (values: string[], draft: string) => {
  const next = draft.trim()
  if (!next || values.includes(next)) return values
  return [...values, next]
}

const ChipsInput = ({
  className,
  onChange,
  onGetSuggestions,
  value,
  ...props
}: ChipsInputProps) => {
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')
  const [focused, setFocused] = useState(false)
  const [lastValue, setLastValue] = useState(value)

  if (value !== lastValue) {
    setLastValue(value)
    setDraft('')
  }

  const suggestions = (onGetSuggestions?.(draft) ?? []).filter((item) => !value.includes(item))
  const showSuggestions = focused && suggestions.length > 0

  const commitDraft = (raw: string) => {
    const nextValues = appendChip(value, raw)
    if (nextValues.length !== value.length) onChange(nextValues)
    setDraft('')
  }

  const onDraftChange = ({ target }: ChangeEvent<HTMLInputElement>) => setDraft(target.value)

  const onDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitDraft(draft)
      return
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const onSuggestionSelect = (suggestion: string) => {
    onChange(appendChip(value, suggestion))
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <>
      <div
        className={cn(base, chipsShellClass, className)}
        onClick={() => inputRef.current?.focus()}
        ref={anchorRef}
      >
        {value.map((chip) => (
          <InputChip
            key={chip}
            label={chip}
            onRemove={() => onChange(value.filter((item) => item !== chip))}
          />
        ))}
        <input
          {...props}
          className="min-w-[3ch] flex-1 border-0 bg-transparent px-1 py-0.5 outline-none"
          onBlur={() => setFocused(false)}
          onChange={onDraftChange}
          onFocus={() => setFocused(true)}
          onKeyDown={onDraftKeyDown}
          ref={inputRef}
          type="text"
          value={draft}
        />
      </div>
      {onGetSuggestions ? (
        <InputSuggestionsPopover
          anchorRef={anchorRef}
          onSelect={onSuggestionSelect}
          open={showSuggestions}
          suggestions={suggestions}
        />
      ) : null}
    </>
  )
}

const TextInput = ({ className, onChange, onGetSuggestions, value, ...props }: TextInputProps) => {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const textValue = value === undefined || value === null ? '' : String(value)
  const suggestions = onGetSuggestions?.(textValue) ?? []
  const showSuggestions = focused && suggestions.length > 0

  const onSuggestionSelect = (suggestion: string) => {
    onChange?.({
      target: { value: suggestion },
    } as ChangeEvent<HTMLInputElement>)
    anchorRef.current?.querySelector('input')?.focus()
  }

  return (
    <>
      <div className="relative" ref={anchorRef}>
        <input
          {...props}
          className={cn(base, className)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          value={value}
        />
      </div>
      {onGetSuggestions ? (
        <InputSuggestionsPopover
          anchorRef={anchorRef}
          onSelect={onSuggestionSelect}
          open={showSuggestions}
          suggestions={suggestions}
        />
      ) : null}
    </>
  )
}

export function Input(props: ChipsInputProps): ReactElement
export function Input(props: TextInputProps): ReactElement
export function Input(props: InputProps) {
  return isChipsInput(props) ? <ChipsInput {...props} /> : <TextInput {...props} />
}
