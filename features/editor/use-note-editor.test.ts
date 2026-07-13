// @vitest-environment happy-dom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useNoteSelectionStore } from '@/features/editor/note-selection.store'
import { useNoteEditor } from '@/features/editor/use-note-editor'

const bars = ['tt', 'ss', 'bb']

describe('useNoteEditor held navigation', () => {
  beforeEach(() => {
    useNoteSelectionStore.setState({ previewSelection: null })
  })

  it('updates preview without committing on previewNavigate', () => {
    const onBarsChange = vi.fn()
    const { result } = renderHook(() => useNoteEditor('track-1', bars, 8, onBarsChange))

    expect(result.current.selection).toEqual({ barIndex: 0, glyphIndex: 0 })
    expect(useNoteSelectionStore.getState().previewSelection).toEqual({
      barIndex: 0,
      glyphIndex: 0,
    })

    act(() => {
      result.current.previewNavigate(1)
    })

    expect(useNoteSelectionStore.getState().previewSelection).toEqual({
      barIndex: 0,
      glyphIndex: 1,
    })
    expect(result.current.selection).toEqual({ barIndex: 0, glyphIndex: 0 })
  })

  it('commits preview selection once on commitSelection', () => {
    const onBarsChange = vi.fn()
    const { result } = renderHook(() => useNoteEditor('track-1', bars, 8, onBarsChange))

    act(() => {
      result.current.previewNavigate(1)
      result.current.previewNavigate(1)
    })

    expect(useNoteSelectionStore.getState().previewSelection).toEqual({
      barIndex: 1,
      glyphIndex: 0,
    })
    expect(result.current.selection).toEqual({ barIndex: 0, glyphIndex: 0 })

    act(() => {
      result.current.commitSelection()
    })

    expect(result.current.selection).toEqual({ barIndex: 1, glyphIndex: 0 })
  })

  it('syncs both values on immediate navigate', () => {
    const onBarsChange = vi.fn()
    const { result } = renderHook(() => useNoteEditor('track-1', bars, 8, onBarsChange))

    act(() => {
      result.current.navigate(1)
    })

    expect(result.current.selection).toEqual({ barIndex: 0, glyphIndex: 1 })
    expect(useNoteSelectionStore.getState().previewSelection).toEqual({
      barIndex: 0,
      glyphIndex: 1,
    })
  })

  it('syncs both values on direct note selection', () => {
    const onBarsChange = vi.fn()
    const { result } = renderHook(() => useNoteEditor('track-1', bars, 8, onBarsChange))

    act(() => {
      result.current.selectNote(2, 0)
    })

    expect(result.current.selection).toEqual({ barIndex: 2, glyphIndex: 0 })
    expect(useNoteSelectionStore.getState().previewSelection).toEqual({
      barIndex: 2,
      glyphIndex: 0,
    })
  })

  it('restores selection and mode when switching back to a track', () => {
    const onBarsChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ trackId, trackBars }: { trackId: string; trackBars: string[] }) =>
        useNoteEditor(trackId, trackBars, 8, onBarsChange),
      { initialProps: { trackId: 'track-1', trackBars: bars } },
    )

    act(() => {
      result.current.setSelectionMode('bar')
      result.current.selectBar(2)
    })

    rerender({ trackId: 'track-2', trackBars: ['aa', 'bb'] })

    expect(result.current.selectionMode).toBe('note')
    expect(result.current.selection).toEqual({ barIndex: 0, glyphIndex: 0 })

    rerender({ trackId: 'track-1', trackBars: bars })

    expect(result.current.selectionMode).toBe('bar')
    expect(result.current.selection).toEqual({ barIndex: 2, glyphIndex: 0 })
  })

  it('clamps selection to the last bar when switching to a shorter track in bar mode', () => {
    const onBarsChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ trackId, trackBars }: { trackId: string; trackBars: string[] }) =>
        useNoteEditor(trackId, trackBars, 8, onBarsChange),
      { initialProps: { trackId: 'track-2', trackBars: ['aa', 'bb', 'cc'] } },
    )

    act(() => {
      result.current.setSelectionMode('bar')
      result.current.selectBar(2)
    })

    rerender({ trackId: 'track-1', trackBars: bars })
    rerender({ trackId: 'track-2', trackBars: ['aa'] })

    expect(result.current.selectionMode).toBe('bar')
    expect(result.current.selection).toEqual({ barIndex: 0, glyphIndex: 0 })
  })

  it('clamps saved selection to the last note when a track becomes shorter', () => {
    const onBarsChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ trackId, trackBars }: { trackId: string; trackBars: string[] }) =>
        useNoteEditor(trackId, trackBars, 8, onBarsChange),
      { initialProps: { trackId: 'track-2', trackBars: ['aa', 'bb', 'cc', 'dd', 'ee'] } },
    )

    act(() => {
      result.current.selectNote(4, 0)
    })

    rerender({ trackId: 'track-1', trackBars: bars })
    rerender({ trackId: 'track-2', trackBars: ['aa', 'bb'] })

    expect(result.current.selectionMode).toBe('note')
    expect(result.current.selection).toEqual({ barIndex: 1, glyphIndex: 1 })
  })
})
