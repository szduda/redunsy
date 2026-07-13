// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GarageResults } from '@/features/garage/garage-results'
import { PRIVATE_GARAGE_FILTERS } from '@/features/garage/garage-filter-presets'
import { usePaginationStore } from '@/features/garage/pagination.store'

const useGarageSnippetsMock = vi.fn()

vi.mock('@/features/garage/use-garage-snippets', () => ({
  useGarageSnippets: (...args: unknown[]) => useGarageSnippetsMock(...args),
}))

const renderWithQuery = (children: ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(createElement(QueryClientProvider, { client }, children))
}

describe('GarageResults', () => {
  afterEach(() => {
    cleanup()
    useGarageSnippetsMock.mockReset()
    usePaginationStore.setState({ page: 1, pageSize: 20 })
  })

  it('hides the heading when showHeading is false', () => {
    useGarageSnippetsMock.mockReturnValue({
      data: {
        items: [
          {
            slug: 'test-rhythm',
            title: 'Test Rhythm',
            meter: 4,
            instruments: ['snare'],
            userOwned: true,
          },
        ],
        total: 1,
      },
      isLoading: false,
      isFetching: false,
      isPlaceholderData: false,
    })

    renderWithQuery(
      <GarageResults filters={PRIVATE_GARAGE_FILTERS} searchTerm="" showHeading={false} />,
    )

    expect(screen.queryByText('Search results')).not.toBeInTheDocument()
    expect(screen.queryByText('Recently added')).not.toBeInTheDocument()
    expect(screen.getByText('Test Rhythm')).toBeInTheDocument()
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument()
  })

  it('passes explicit filters to the snippets query', () => {
    useGarageSnippetsMock.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isFetching: false,
      isPlaceholderData: false,
    })

    renderWithQuery(
      <GarageResults filters={PRIVATE_GARAGE_FILTERS} searchTerm="" showHeading={false} />,
    )

    expect(useGarageSnippetsMock).toHaveBeenCalledWith('', { filters: PRIVATE_GARAGE_FILTERS })
  })
})
