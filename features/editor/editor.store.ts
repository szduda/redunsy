import { create } from 'zustand'

import {
  defaultSwingPatternForMeter,
  DEFAULT_TEMPO,
  normalizeSwingPatternForMeter,
} from '@/features/groovy-player/player.store'
import { deleteRhythm, readMyRhythms, saveRhythm } from '@/features/rhythm/my-rhythms-storage'
import { createRhythm, slugFromTitle } from '@/features/rhythm/rhythm-helpers'
import type { Rhythm, RhythmInstrument, RhythmMeter } from '@/features/rhythm/rhythm.types'
import { updateRhythmInstrumentsMap } from '@/features/editor/update-rhythm-instruments'

export type EditorView = 'picker' | 'creator' | 'editor'

export type CreatorDraft = {
  title: string
  description: string
  author: string[]
  origin: string[]
  rhythmGroup: string[]
  meter: RhythmMeter
  tempo: number
  swingPattern: string
  signalPattern: string
  tags: string[]
  layers: RhythmInstrument[]
  fillDjembe: boolean
}

const defaultCreatorDraft = (): CreatorDraft => ({
  title: '',
  description: '',
  author: [],
  origin: [],
  rhythmGroup: [],
  meter: 4,
  tempo: DEFAULT_TEMPO,
  swingPattern: defaultSwingPatternForMeter(4),
  signalPattern: '',
  tags: [],
  layers: ['djembe'],
  fillDjembe: false,
})

const resolveSwingPattern = (current: Rhythm, patch: Partial<Rhythm>): string => {
  const meter = patch.meter ?? current.meter
  if (patch.meter !== undefined && patch.meter !== current.meter) {
    return defaultSwingPatternForMeter(meter)
  }
  return normalizeSwingPatternForMeter(patch.swingPattern ?? current.swingPattern, meter)
}

type EditorState = {
  hydrated: boolean
  view: EditorView
  creatorStep: 1 | 2 | 3
  rhythms: Record<string, Rhythm>
  activeSlug: string | null
  previousSlug: string | null
  focusedTrackId: string | null
  creatorDraft: CreatorDraft
  hydrateFromStorage: () => void
  openRhythm: (slug: string) => void
  backToPicker: () => void
  startCreator: () => void
  setCreatorStep: (step: 1 | 2 | 3) => void
  updateCreatorDraft: (patch: Partial<CreatorDraft>) => void
  finishCreator: () => void
  setFocusedTrackId: (trackId: string | null) => void
  updateActiveRhythm: (updater: (rhythm: Rhythm) => Rhythm) => void
  patchActiveRhythm: (patch: Partial<Rhythm>) => void
  updateTrackBars: (trackId: string, bars: string[]) => void
  updateRhythmInstruments: (layers: RhythmInstrument[]) => void
  removeRhythm: (slug: string) => void
}

const persistRhythm = (rhythm: Rhythm, previousSlug?: string | null) => {
  const rhythms = saveRhythm(rhythm, previousSlug ?? undefined)
  return rhythms
}

export const useEditorStore = create<EditorState>((set, get) => ({
  hydrated: false,
  view: 'picker',
  creatorStep: 1,
  rhythms: {},
  activeSlug: null,
  previousSlug: null,
  focusedTrackId: null,
  creatorDraft: defaultCreatorDraft(),
  hydrateFromStorage: () => {
    const rhythms = readMyRhythms()
    const entries = Object.values(rhythms)
    set({
      hydrated: true,
      rhythms,
      view: entries.length === 0 ? 'creator' : 'picker',
      activeSlug: null,
      focusedTrackId: null,
      creatorStep: 1,
      creatorDraft: defaultCreatorDraft(),
    })
  },
  openRhythm: (slug) => {
    const rhythms = readMyRhythms()
    const rhythm = rhythms[slug]
    if (!rhythm) return
    const state = get()
    const alreadyEditing = state.view === 'editor' && state.activeSlug === slug
    set({
      rhythms,
      view: 'editor',
      activeSlug: slug,
      previousSlug: slug,
      focusedTrackId: alreadyEditing
        ? state.focusedTrackId
        : (Object.keys(rhythm.instruments)[0] ?? null),
    })
  },
  backToPicker: () =>
    set({
      view: 'picker',
      activeSlug: null,
      focusedTrackId: null,
    }),
  startCreator: () =>
    set({
      view: 'creator',
      creatorStep: 1,
      activeSlug: null,
      creatorDraft: defaultCreatorDraft(),
    }),
  setCreatorStep: (creatorStep) => set({ creatorStep }),
  updateCreatorDraft: (patch) =>
    set((state) => {
      const draft = { ...state.creatorDraft, ...patch }
      if (patch.meter !== undefined && patch.meter !== state.creatorDraft.meter) {
        draft.swingPattern = defaultSwingPatternForMeter(patch.meter)
      } else if (patch.swingPattern !== undefined) {
        draft.swingPattern = normalizeSwingPatternForMeter(patch.swingPattern, draft.meter)
      }
      return { creatorDraft: draft }
    }),
  finishCreator: () => {
    const { creatorDraft } = get()
    const title = creatorDraft.title.trim() || undefined
    const rhythm = createRhythm({
      title,
      description: creatorDraft.description.trim(),
      author: creatorDraft.author,
      origin: creatorDraft.origin,
      rhythmGroup: creatorDraft.rhythmGroup,
      meter: creatorDraft.meter,
      layers: creatorDraft.layers,
      tempo: creatorDraft.tempo,
      swingPattern: creatorDraft.swingPattern,
      signalPattern: creatorDraft.signalPattern,
      tags: creatorDraft.tags,
      fillDjembe: creatorDraft.fillDjembe,
    })
    const rhythms = persistRhythm(rhythm)
    set({
      rhythms,
      view: 'editor',
      activeSlug: rhythm.slug,
      previousSlug: rhythm.slug,
      focusedTrackId: Object.keys(rhythm.instruments)[0] ?? null,
      creatorStep: 1,
      creatorDraft: defaultCreatorDraft(),
    })
  },
  setFocusedTrackId: (focusedTrackId) => set({ focusedTrackId }),
  updateActiveRhythm: (updater) => {
    const { activeSlug, rhythms } = get()
    if (!activeSlug) return
    const current = rhythms[activeSlug]
    if (!current) return
    const next = {
      ...updater(current),
      updatedAt: Date.now(),
      userOwned: true,
    }
    next.swingPattern = normalizeSwingPatternForMeter(next.swingPattern, next.meter)
    const rhythmsNext = persistRhythm(next, activeSlug)
    set({ rhythms: rhythmsNext, activeSlug: next.slug, previousSlug: next.slug })
  },
  patchActiveRhythm: (patch) => {
    const { activeSlug, previousSlug, rhythms } = get()
    if (!activeSlug) return
    const current = rhythms[activeSlug]
    if (!current) return
    const nextTitle = patch.title ?? current.title
    const nextSlug = patch.title ? slugFromTitle(nextTitle) : current.slug
    const next = {
      ...current,
      ...patch,
      title: nextTitle,
      slug: nextSlug,
      swingPattern: resolveSwingPattern(current, patch),
      updatedAt: Date.now(),
      userOwned: true,
    }
    const rhythmsNext = persistRhythm(next, previousSlug)
    set({ rhythms: rhythmsNext, activeSlug: next.slug, previousSlug: next.slug })
  },
  updateTrackBars: (trackId, bars) => {
    get().updateActiveRhythm((rhythm) => ({
      ...rhythm,
      instruments: {
        ...rhythm.instruments,
        [trackId]: { ...rhythm.instruments[trackId], bars },
      },
    }))
  },
  updateRhythmInstruments: (layers) => {
    if (layers.length === 0) return
    const { focusedTrackId } = get()
    get().updateActiveRhythm((rhythm) => ({
      ...rhythm,
      instruments: updateRhythmInstrumentsMap(rhythm.instruments, layers, rhythm.meter),
    }))
    if (!focusedTrackId || !layers.includes(focusedTrackId as RhythmInstrument)) {
      set({ focusedTrackId: layers[0] ?? null })
    }
  },
  removeRhythm: (slug) => {
    const rhythms = deleteRhythm(slug)
    const entries = Object.values(rhythms)
    set({
      rhythms,
      view: entries.length ? 'picker' : 'creator',
      activeSlug: null,
      focusedTrackId: null,
      previousSlug: null,
    })
  },
}))
