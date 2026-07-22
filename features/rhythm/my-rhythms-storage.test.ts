import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Rhythm } from '@/features/rhythm/rhythm.types'

const storage = new Map<string, string>()

const stubBrowser = () => {
  storage.clear()
  const addEventListener = vi.fn()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
  })
  vi.stubGlobal('window', {
    addEventListener,
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
    },
  })
  vi.stubGlobal('document', {
    visibilityState: 'visible',
    addEventListener,
  })
}

const sampleRhythm = (slug: string, title = slug): Rhythm => ({
  slug,
  title,
  description: '',
  meter: 4,
  author: [],
  origin: [],
  tags: [],
  rhythmGroup: [],
  swingPattern: '--------',
  tempo: 110,
  signalPattern: '',
  createdAt: 1,
  updatedAt: 1,
  instruments: {
    djembe: { id: 'djembe', name: 'Djembe', instrument: 'djembe', bars: ['--------'] },
  },
})

describe('my-rhythms-storage debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubBrowser()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('coalesces rapid saveRhythm writes and flushes after debounce', async () => {
    const {
      MY_RHYTHMS_STORAGE_KEY,
      flushMyRhythms,
      readMyRhythms,
      resetMyRhythmsStorageForTests,
      saveRhythm,
    } = await import('@/features/rhythm/my-rhythms-storage')
    resetMyRhythmsStorageForTests()

    saveRhythm(sampleRhythm('a'))
    saveRhythm({ ...sampleRhythm('a'), description: 'edit-1' })
    saveRhythm({ ...sampleRhythm('a'), description: 'edit-2' })

    expect(readMyRhythms().a?.description).toBe('edit-2')
    expect(storage.has(MY_RHYTHMS_STORAGE_KEY)).toBe(false)

    vi.advanceTimersByTime(299)
    expect(storage.has(MY_RHYTHMS_STORAGE_KEY)).toBe(false)

    vi.advanceTimersByTime(1)
    const persisted = JSON.parse(storage.get(MY_RHYTHMS_STORAGE_KEY) ?? '{}') as Record<
      string,
      Rhythm
    >
    expect(persisted.a?.description).toBe('edit-2')

    flushMyRhythms()
  })

  it('writes immediately on delete and slug rename', async () => {
    const { MY_RHYTHMS_STORAGE_KEY, deleteRhythm, resetMyRhythmsStorageForTests, saveRhythm } =
      await import('@/features/rhythm/my-rhythms-storage')
    resetMyRhythmsStorageForTests()

    saveRhythm(sampleRhythm('old'))
    vi.advanceTimersByTime(300)

    saveRhythm(sampleRhythm('new', 'New'), 'old')
    const afterRename = JSON.parse(storage.get(MY_RHYTHMS_STORAGE_KEY) ?? '{}') as Record<
      string,
      Rhythm
    >
    expect(afterRename.old).toBeUndefined()
    expect(afterRename.new?.slug).toBe('new')

    deleteRhythm('new')
    const afterDelete = JSON.parse(storage.get(MY_RHYTHMS_STORAGE_KEY) ?? '{}') as Record<
      string,
      Rhythm
    >
    expect(afterDelete.new).toBeUndefined()
  })

  it('flushMyRhythms persists pending saves before unload', async () => {
    const { MY_RHYTHMS_STORAGE_KEY, flushMyRhythms, resetMyRhythmsStorageForTests, saveRhythm } =
      await import('@/features/rhythm/my-rhythms-storage')
    resetMyRhythmsStorageForTests()

    saveRhythm(sampleRhythm('pending'))
    expect(storage.has(MY_RHYTHMS_STORAGE_KEY)).toBe(false)

    flushMyRhythms()
    const persisted = JSON.parse(storage.get(MY_RHYTHMS_STORAGE_KEY) ?? '{}') as Record<
      string,
      Rhythm
    >
    expect(persisted.pending?.slug).toBe('pending')
  })
})
