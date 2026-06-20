export const applyBarPatternAction = (
  bars: string[],
  barSize: number,
  cursor: number,
  action: 'add' | 'remove',
) => {
  const emptyBar = '-'.repeat(barSize)

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
