const emptyBarForSize = (barSize: number) => '-'.repeat(barSize)

export const applyBarPatternAction = (
  bars: string[],
  barSize: number,
  cursor: number,
  action: 'add' | 'remove',
) => {
  const emptyBar = emptyBarForSize(barSize)

  if (action === 'add') {
    const insertAt = cursor < 0 ? bars.length : cursor
    const nextBars = [...bars.slice(0, insertAt), emptyBar, ...bars.slice(insertAt)]
    const nextCursor = cursor >= 0 ? cursor + 1 : cursor
    return { bars: nextBars, cursor: nextCursor }
  }

  if (cursor < 0) {
    if (bars.length <= 1) return { bars: [emptyBar], cursor }
    return { bars: bars.slice(0, -1), cursor }
  }

  if (cursor > 0) {
    const removeAt = cursor - 1
    const nextBars = bars.filter((_, index) => index !== removeAt)
    return { bars: nextBars.length ? nextBars : [emptyBar], cursor: cursor - 1 }
  }

  return { bars, cursor }
}

export const applyBarModeAction = (
  bars: string[],
  barSize: number,
  barIndex: number,
  action: 'add' | 'remove' | 'clear',
) => {
  const emptyBar = emptyBarForSize(barSize)

  if (action === 'clear') {
    if (barIndex < 0 || barIndex >= bars.length) return { bars, barIndex }
    const nextBars = [...bars]
    nextBars[barIndex] = emptyBar
    return { bars: nextBars, barIndex }
  }

  if (action === 'add') {
    if (barIndex < 0) {
      return { bars: [...bars, emptyBar], barIndex: bars.length }
    }
    const insertAt = barIndex + 1
    const nextBars = [...bars.slice(0, insertAt), emptyBar, ...bars.slice(insertAt)]
    return { bars: nextBars, barIndex }
  }

  if (barIndex < 0) return { bars, barIndex }

  if (bars.length <= 1) {
    return { bars: [emptyBar], barIndex: 0 }
  }

  const nextBars = bars.filter((_, index) => index !== barIndex)
  const nextBarIndex = Math.min(barIndex, nextBars.length - 1)
  return { bars: nextBars, barIndex: nextBarIndex }
}
