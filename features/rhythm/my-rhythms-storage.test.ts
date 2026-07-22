import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Rhythm } from '@/features/rhythm/rhythm.types'

const storage = new Map<string, string>()
const windowListeners = new Map<string, Set<EventListener>>()

const stubBrowser = () => {
  storage.clear()
  windowListeners.clear()
  const addEventListener = vi.fn((type: string, listener: EventListener) => {
    const set = windowListeners.get(type) ?? new Set()
    set.add(listener)
    windowListeners.set(type, set)
  })
  const localStorageStub = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
  }
  vi.stubGlobal('localStorage', localStorageStub)
  vi.stubGlobal('window', {
    addEventListener,
    localStorage: localStorageStub,
  })
  vi.stubGlobal('document', {
    visibilityState: 'visible',
    addEventListener: vi.fn(),
  })
}

const dispatchStorage = (key: string | null) => {
  const event = { key } as StorageEvent
  windowListeners.get('storage')?.forEach((listener) => listener(event))
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

  it('flushMyRhythms no-ops when cache is not dirty', async () => {
    const setItem = vi.fn((key: string, value: string) => {
      storage.set(key, value)
    })
    const localStorageStub = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem,
      removeItem: (key: string) => {
        storage.delete(key)
      },
    }
    vi.stubGlobal('localStorage', localStorageStub)
    vi.stubGlobal('window', {
      ...(window as object),
      addEventListener: window.addEventListener,
      localStorage: localStorageStub,
    })

    const { flushMyRhythms, resetMyRhythmsStorageForTests, saveRhythm, writeMyRhythms } =
      await import('@/features/rhythm/my-rhythms-storage')
    resetMyRhythmsStorageForTests()

    saveRhythm(sampleRhythm('clean'))
    vi.advanceTimersByTime(300)
    expect(setItem).toHaveBeenCalled()
    setItem.mockClear()

    flushMyRhythms()
    expect(setItem).not.toHaveBeenCalled()

    writeMyRhythms({ clean: { ...sampleRhythm('clean'), description: 'synced' } })
    expect(setItem).toHaveBeenCalledTimes(1)
    setItem.mockClear()

    flushMyRhythms()
    expect(setItem).not.toHaveBeenCalled()
  })

  it('storage event flushes dirty local edits before invalidating cache', async () => {
    const {
      MY_RHYTHMS_STORAGE_KEY,
      readMyRhythms,
      resetMyRhythmsStorageForTests,
      saveRhythm,
    } = await import('@/features/rhythm/my-rhythms-storage')
    resetMyRhythmsStorageForTests()

    saveRhythm({ ...sampleRhythm('a'), description: 'local-pending' })
    expect(readMyRhythms().a?.description).toBe('local-pending')
    expect(storage.has(MY_RHYTHMS_STORAGE_KEY)).toBe(false)

    storage.set(
      MY_RHYTHMS_STORAGE_KEY,
      JSON.stringify({ a: { ...sampleRhythm('a'), description: 'from-other-tab' } }),
    )
    dispatchStorage(MY_RHYTHMS_STORAGE_KEY)

    // Local dirty write wins (flushed before invalidate); cache reloads from storage.
    expect(readMyRhythms().a?.description).toBe('local-pending')

    vi.advanceTimersByTime(300)
    const persisted = JSON.parse(storage.get(MY_RHYTHMS_STORAGE_KEY) ?? '{}') as Record<
      string,
      Rhythm
    >
    expect(persisted.a?.description).toBe('local-pending')
  })
})
