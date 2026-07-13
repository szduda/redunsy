// @vitest-environment happy-dom

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useEditorKeyboard } from '@/features/editor/use-editor-keyboard'

const fireKeyDown = (key: string) => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

const fireKeyUp = (key: string) => {
  window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
}

describe('useEditorKeyboard held navigation', () => {
  const previewNavigate = vi.fn()
  const commitSelection = vi.fn()
  let unmount = () => {}

  beforeEach(() => {
    previewNavigate.mockReset()
    commitSelection.mockReset()
  })

  afterEach(() => {
    unmount()
  })

  const mountKeyboard = () => {
    const hook = renderHook(() =>
      useEditorKeyboard('djembe', {
        selection: { barIndex: 0, glyphIndex: 0 },
        selectionMode: 'note',
        previewNavigate,
        commitSelection,
        setSelectionMode: vi.fn(),
        setSound: vi.fn(),
        toggleFlam: vi.fn(),
        convertToSixteenth: vi.fn(),
        convertToTriplet: vi.fn(),
        convertToPolyrhythm: vi.fn(),
        convertToEighth: vi.fn(),
      }),
    )
    unmount = hook.unmount
    return hook
  }

  it('previews on repeated arrow keydown without committing', () => {
    mountKeyboard()

    act(() => {
      fireKeyDown('ArrowRight')
      fireKeyDown('ArrowRight')
      fireKeyDown('ArrowRight')
    })

    expect(previewNavigate).toHaveBeenCalledTimes(3)
    expect(previewNavigate).toHaveBeenCalledWith(1)
    expect(commitSelection).not.toHaveBeenCalled()
  })

  it('commits once when the arrow key is released', () => {
    mountKeyboard()

    act(() => {
      fireKeyDown('ArrowLeft')
      fireKeyDown('ArrowLeft')
      fireKeyUp('ArrowLeft')
    })

    expect(previewNavigate).toHaveBeenCalledTimes(2)
    expect(previewNavigate).toHaveBeenCalledWith(-1)
    expect(commitSelection).toHaveBeenCalledTimes(1)
  })

  it('commits on window blur after held navigation', () => {
    mountKeyboard()

    act(() => {
      fireKeyDown('ArrowRight')
      window.dispatchEvent(new Event('blur'))
    })

    expect(previewNavigate).toHaveBeenCalledTimes(1)
    expect(commitSelection).toHaveBeenCalledTimes(1)
  })

  it('commits held navigation before other editor shortcuts', () => {
    mountKeyboard()

    act(() => {
      fireKeyDown('ArrowRight')
      fireKeyDown('1')
    })

    expect(commitSelection).toHaveBeenCalledTimes(1)
  })
})
