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
})
