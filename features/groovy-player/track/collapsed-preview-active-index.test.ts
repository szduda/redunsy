import { describe, expect, it } from 'vitest'

import { collapsedPreviewActiveIndex } from './collapsed-preview-active-index'

describe('collapsedPreviewActiveIndex', () => {
  it('maps the current bar within an unrepeated preview window', () => {
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 2,
        currentBar: 2,
        windowStart: 0,
        sourceBarCount: 4,
        previewBarCount: 4,
      }),
    ).toBe(2)

    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 5,
        currentBar: 5,
        windowStart: 4,
        sourceBarCount: 4,
        previewBarCount: 4,
      }),
    ).toBe(1)
  })

  it('walks through duplicated preview copies using the global active index', () => {
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 0,
        currentBar: 0,
        windowStart: 0,
        sourceBarCount: 2,
        previewBarCount: 4,
      }),
    ).toBe(0)
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 1,
        currentBar: 1,
        windowStart: 0,
        sourceBarCount: 2,
        previewBarCount: 4,
      }),
    ).toBe(1)
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 2,
        currentBar: 0,
        windowStart: 0,
        sourceBarCount: 2,
        previewBarCount: 4,
      }),
    ).toBe(2)
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 3,
        currentBar: 1,
        windowStart: 0,
        sourceBarCount: 2,
        previewBarCount: 4,
      }),
    ).toBe(3)
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 4,
        currentBar: 0,
        windowStart: 0,
        sourceBarCount: 2,
        previewBarCount: 4,
      }),
    ).toBe(0)
  })

  it('walks through quadruplicated single-bar previews', () => {
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 0,
        currentBar: 0,
        windowStart: 0,
        sourceBarCount: 1,
        previewBarCount: 4,
      }),
    ).toBe(0)
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 3,
        currentBar: 0,
        windowStart: 0,
        sourceBarCount: 1,
        previewBarCount: 4,
      }),
    ).toBe(3)
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 4,
        currentBar: 0,
        windowStart: 0,
        sourceBarCount: 1,
        previewBarCount: 4,
      }),
    ).toBe(0)
  })

  it('returns -1 when there is no active bar or it is outside the window', () => {
    expect(
      collapsedPreviewActiveIndex({
        activeIndex: -1,
        currentBar: -1,
        windowStart: 0,
        sourceBarCount: 2,
        previewBarCount: 4,
      }),
    ).toBe(-1)

    expect(
      collapsedPreviewActiveIndex({
        activeIndex: 6,
        currentBar: 6,
        windowStart: 0,
        sourceBarCount: 4,
        previewBarCount: 4,
      }),
    ).toBe(-1)
  })
})
