import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const dbMocks = vi.hoisted(() => {
  const mockLimit = vi.fn()
  const mockWhereSelect = vi.fn(() => ({ limit: mockLimit }))
  const mockFrom = vi.fn(() => ({ where: mockWhereSelect }))
  const mockSelect = vi.fn(() => ({ from: mockFrom }))

  const mockUpdateWhere = vi.fn()
  const mockUpdateSet = vi.fn(() => ({ where: mockUpdateWhere }))
  const mockUpdate = vi.fn(() => ({ set: mockUpdateSet }))

  const mockInsertValues = vi.fn()
  const mockInsert = vi.fn(() => ({ values: mockInsertValues }))

  return {
    mockLimit,
    mockSelect,
    mockUpdate,
    mockInsert,
    mockUpdateSet,
    mockUpdateWhere,
    mockInsertValues,
  }
})

vi.mock('@/db/client', () => ({
  db: {
    select: dbMocks.mockSelect,
    update: dbMocks.mockUpdate,
    insert: dbMocks.mockInsert,
  },
}))

import { upsertPublishedRhythm } from '@/db/admin-rhythms'
import { sampleRhythm } from '@/features/admin/publish-as.test-helpers'

describe('upsertPublishedRhythm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbMocks.mockLimit.mockResolvedValue([])
    dbMocks.mockUpdateWhere.mockResolvedValue(undefined)
    dbMocks.mockInsertValues.mockResolvedValue(undefined)
  })

  it('inserts a new published row when slug is unused', async () => {
    const rhythm = sampleRhythm({ slug: 'draft-slug' })

    const result = await upsertPublishedRhythm('new-published-slug', rhythm)

    expect(result).toEqual({ created: true, slug: 'new-published-slug' })
    expect(dbMocks.mockSelect).toHaveBeenCalledOnce()
    expect(dbMocks.mockInsert).toHaveBeenCalledOnce()
    expect(dbMocks.mockUpdate).not.toHaveBeenCalled()
    expect(dbMocks.mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'new-published-slug',
        slug: 'new-published-slug',
        title: 'My Rhythm',
        published: true,
        patterns: expect.arrayContaining([
          expect.objectContaining({
            instrument: 'djembe',
            bars: ['s--ss-tt', 's--ss-tt'],
          }),
        ]),
      }),
    )
  })

  it('updates an existing row when slug already exists', async () => {
    dbMocks.mockLimit.mockResolvedValue([
      {
        id: 'existing-slug',
        slug: 'existing-slug',
        title: 'Old Title',
      },
    ])

    const rhythm = sampleRhythm({ title: 'Updated Title' })

    const result = await upsertPublishedRhythm('existing-slug', rhythm)

    expect(result).toEqual({ created: false, slug: 'existing-slug' })
    expect(dbMocks.mockSelect).toHaveBeenCalledOnce()
    expect(dbMocks.mockUpdate).toHaveBeenCalledOnce()
    expect(dbMocks.mockInsert).not.toHaveBeenCalled()
    expect(dbMocks.mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated Title',
        published: true,
        patterns: expect.arrayContaining([expect.objectContaining({ instrument: 'djembe' })]),
      }),
    )
    expect(dbMocks.mockUpdateWhere).toHaveBeenCalledOnce()
  })
})
