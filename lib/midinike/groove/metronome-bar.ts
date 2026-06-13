export const metronomeBarForGrooveLength = (grooveLength: number) => {
  if (grooveLength <= 0) return ''
  const pulseIndex = Math.floor(grooveLength / 2)
  return Array.from({ length: grooveLength }, (_, index) =>
    index === 0 || index === pulseIndex ? 'x' : '-',
  ).join('')
}
