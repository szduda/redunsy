import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { createElement, type ReactElement, type ReactNode } from 'react'

import { ToastProvider } from '@/features/admin/toasts'
import type { Rhythm } from '@/features/rhythm/rhythm.types'

export const sampleRhythm = (overrides: Partial<Rhythm> = {}): Rhythm => ({
  slug: 'my-rhythm-abc12',
  title: 'My Rhythm',
  description: 'A test rhythm',
  meter: 4,
  author: ['Ada'],
  origin: ['Guinea'],
  tags: ['test'],
  rhythmGroup: ['solo'],
  swingPattern: '--------',
  tempo: 110,
  signalPattern: '',
  createdAt: 1,
  updatedAt: 2,
  userOwned: true,
  instruments: {
    djembe: {
      id: 'djembe',
      name: 'Djembe',
      instrument: 'djembe',
      bars: ['s--ss-tt', 's--ss-tt'],
    },
  },
  ...overrides,
})

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

type ProviderProps = {
  children: ReactNode
}

export const renderWithPublishProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const client = createTestQueryClient()

  const Wrapper = ({ children }: ProviderProps) =>
    createElement(
      QueryClientProvider,
      { client },
      createElement(ToastProvider, null, children),
    )

  return render(ui, { wrapper: Wrapper, ...options })
}

/** Popover positioning reads layout metrics from the DOM. */
export const stubPopoverLayoutMetrics = () => {
  Element.prototype.getBoundingClientRect = () =>
    ({
      left: 100,
      top: 100,
      width: 80,
      height: 24,
      right: 180,
      bottom: 124,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    }) as DOMRect

  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 256,
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 120,
  })
}
