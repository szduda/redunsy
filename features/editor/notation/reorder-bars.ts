export const reorderBar = (bars: string[], from: number, to: number) => {
  if (from === to || from < 0 || from >= bars.length) return bars
  const insertAt = Math.max(0, Math.min(to, bars.length))
  if (from === insertAt) return bars

  const next = [...bars]
  const [bar] = next.splice(from, 1)
  const adjustedInsert = from < insertAt ? insertAt - 1 : insertAt
  next.splice(adjustedInsert, 0, bar)
  return next
}

export const remapBarIndex = (index: number, from: number, to: number) => {
  if (index === from) {
    const insertAt = Math.max(0, Math.min(to, from + 1))
    return from < insertAt ? insertAt - 1 : insertAt
  }

  const insertAt = Math.max(0, Math.min(to, from + 1))
  const adjustedInsert = from < insertAt ? insertAt - 1 : insertAt

  if (from < adjustedInsert && index > from && index <= adjustedInsert) return index - 1
  if (from > adjustedInsert && index >= adjustedInsert && index < from) return index + 1
  return index
}

export const previewBarsForDrag = (bars: string[], sourceIndex: number, dropIndex: number) =>
  dropIndex === sourceIndex ? bars : reorderBar(bars, sourceIndex, dropIndex)
