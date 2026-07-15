// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PRIVATE_GARAGE_FILTERS } from '@/features/garage/garage-filter-presets'
import { RhythmPicker } from '@/features/editor/rhythm-picker'

const garageResultsMock = vi.fn()
garageResultsMock.mockReturnValue(<div data-testid="garage-results" />)

vi.mock('@/features/garage/garage-results', () => ({
  GarageResults: (props: unknown) => garageResultsMock(props),
}))

vi.mock('@/features/editor/editor.store', () => ({
  useEditorStore: (selector: (state: { startCreator: () => void }) => unknown) =>
    selector({ startCreator: vi.fn() }),
}))

describe('RhythmPicker', () => {
  afterEach(() => {
    cleanup()
    garageResultsMock.mockClear()
  })

  it('renders heading, browse link, and configured garage results', () => {
    render(<RhythmPicker />)

    expect(screen.getByRole('heading', { name: 'Your Rhythms' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse in Garage' })).toHaveAttribute(
      'href',
      '/garage?ownership=private',
    )
    expect(screen.getByRole('button', { name: 'New rhythm' })).toBeInTheDocument()
    expect(screen.getByTestId('garage-results')).toBeInTheDocument()

    expect(garageResultsMock.mock.calls[0]?.[0]).toEqual({
      filters: PRIVATE_GARAGE_FILTERS,
      searchTerm: '',
      showHeading: false,
    })
  })
})
