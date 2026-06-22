'use client'

import {
  useEffect,
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
  wrapperClassName?: string
  value?: string | number | readonly string[]
  onChange?: ChangeEventHandler<HTMLInputElement>
  onGetSuggestions?: (value: string) => string[]
  onSuggestionCommit?: (value: string) => void
}

export type ChipsInputProps = InputBaseProps & {
  wrapperClassName?: string
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

const wrapSuggestionIndex = (current: number, delta: 1 | -1, length: number) => {
  if (length === 0) return -1
  if (current < 0) return delta === 1 ? 0 : length - 1
  return (current + delta + length) % length
}

const handleSuggestionKeyDown = (
  event: KeyboardEvent<HTMLInputElement>,
  suggestions: string[],
  activeIndex: number,
  setActiveIndex: (index: number) => void,
  onActiveSelect: (suggestion: string) => void,
  onSuggestionCommit?: (suggestion: string) => void,
) => {
  if (!suggestions.length) return false

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    setActiveIndex(wrapSuggestionIndex(activeIndex, 1, suggestions.length))
    return true
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    setActiveIndex(wrapSuggestionIndex(activeIndex, -1, suggestions.length))
    return true
  }

  if (event.key === 'Enter' && activeIndex >= 0) {
    event.preventDefault()
    const suggestion = suggestions[activeIndex]
    onActiveSelect(suggestion)
    onSuggestionCommit?.(suggestion)
    setActiveIndex(-1)
    event.currentTarget.blur()
    return true
  }

  if (event.key === 'Escape') {
    setActiveIndex(-1)
    return true
  }

  return false
}

const ChipsInput = ({
  className,
  onBlur,
  onChange,
  onGetSuggestions,
  value,
  ...props
}: ChipsInputProps) => {
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [lastValue, setLastValue] = useState(value)

  if (value !== lastValue) {
    setLastValue(value)
    setDraft('')
  }

  const suggestions = (onGetSuggestions?.(draft) ?? []).filter((item) => !value.includes(item))
  const showSuggestions = focused && suggestions.length > 0
  const suggestionKey = suggestions.join('\u0000')

  useEffect(() => {
    setActiveIndex(-1)
  }, [draft, suggestionKey])

  const commitDraft = (raw: string) => {
    const nextValues = appendChip(value, raw)
    if (nextValues.length !== value.length) onChange(nextValues)
    setDraft('')
  }

  const onDraftChange = ({ target }: ChangeEvent<HTMLInputElement>) => setDraft(target.value)

  const onSuggestionSelect = (suggestion: string) => {
    onChange(appendChip(value, suggestion))
    setDraft('')
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const onDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      handleSuggestionKeyDown(event, suggestions, activeIndex, setActiveIndex, onSuggestionSelect)
    ) {
      return
    }
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitDraft(draft)
      return
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
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
          onBlur={(event) => {
            onBlur?.(event)
            setFocused(false)
            setActiveIndex(-1)
          }}
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
          activeIndex={activeIndex}
          anchorRef={anchorRef}
          onSelect={onSuggestionSelect}
          open={showSuggestions}
          suggestions={suggestions}
        />
      ) : null}
    </>
  )
}

const TextInput = ({
  className,
  wrapperClassName,
  onBlur,
  onChange,
  onGetSuggestions,
  onKeyDown,
  onSuggestionCommit,
  value,
  ...props
}: TextInputProps) => {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const textValue = value === undefined || value === null ? '' : String(value)
  const suggestions = onGetSuggestions?.(textValue) ?? []
  const showSuggestions = focused && suggestions.length > 0
  const suggestionKey = suggestions.join('\u0000')

  useEffect(() => {
    setActiveIndex(-1)
  }, [textValue, suggestionKey])

  const onSuggestionSelect = (suggestion: string) => {
    onChange?.({
      target: { value: suggestion },
    } as ChangeEvent<HTMLInputElement>)
    setActiveIndex(-1)
    anchorRef.current?.querySelector('input')?.focus()
  }

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      handleSuggestionKeyDown(
        event,
        suggestions,
        activeIndex,
        setActiveIndex,
        onSuggestionSelect,
        onSuggestionCommit,
      )
    ) {
      return
    }
    onKeyDown?.(event)
  }

  return (
    <>
      <div className={cn('relative w-full', wrapperClassName)} ref={anchorRef}>
        <input
          {...props}
          className={cn(base, className)}
          onBlur={(event) => {
            onBlur?.(event)
            setFocused(false)
            setActiveIndex(-1)
          }}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onKeyDown={onInputKeyDown}
          value={value}
        />
      </div>
      {onGetSuggestions ? (
        <InputSuggestionsPopover
          activeIndex={activeIndex}
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
