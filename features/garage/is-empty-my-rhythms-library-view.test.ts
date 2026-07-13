// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest'

import { PRIVATE_GARAGE_FILTERS } from '@/features/garage/garage-filter-presets'
import { isEmptyMyRhythmsLibraryView } from '@/features/garage/is-empty-my-rhythms-library-view'

const listMyRhythmsMock = vi.fn()

vi.mock('@/features/rhythm/my-rhythms-storage', () => ({
  listMyRhythms: () => listMyRhythmsMock(),
}))

describe('isEmptyMyRhythmsLibraryView', () => {
  it('is true for private ownership with an empty local library', () => {
    listMyRhythmsMock.mockReturnValue([])

    expect(isEmptyMyRhythmsLibraryView(PRIVATE_GARAGE_FILTERS, '')).toBe(true)
  })

  it('is false when the local library has rhythms', () => {
    listMyRhythmsMock.mockReturnValue([{ slug: 'mine' }])

    expect(isEmptyMyRhythmsLibraryView(PRIVATE_GARAGE_FILTERS, '')).toBe(false)
  })

  it('is false when a search term is present', () => {
    listMyRhythmsMock.mockReturnValue([])

    expect(isEmptyMyRhythmsLibraryView(PRIVATE_GARAGE_FILTERS, 'kuku')).toBe(false)
  })

  it('is false when non-ownership filters are active', () => {
    listMyRhythmsMock.mockReturnValue([])

    expect(
      isEmptyMyRhythmsLibraryView({ ...PRIVATE_GARAGE_FILTERS, meter: [4] }, ''),
    ).toBe(false)
  })
})
