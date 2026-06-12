'use client'

import { type ChangeEvent, createElement } from 'react'

import { useGroovyPlayerStore } from './groovy-player.store'

export const GroovyPlayer = () => {
  const input = useGroovyPlayerStore((state) => state.input)
  const setInput = useGroovyPlayerStore((state) => state.setInput)

  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => setInput(target.value)

  return createElement(
    'section',
    { className: 'flex w-full max-w-md gap-2' },
    createElement('input', {
      'aria-label': 'Groovy player input',
      className:
        'flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100',
      onChange,
      type: 'text',
      value: input,
    }),
    createElement(
      'button',
      {
        className:
          'rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300',
        type: 'button',
      },
      'Play',
    ),
  )
}
