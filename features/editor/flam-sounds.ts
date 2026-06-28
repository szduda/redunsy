export type DjembeStroke = 'b' | 't' | 's'

export type FlamDef = {
  symbol: string
  grace: DjembeStroke
  main: DjembeStroke
}

/** b/t/s flam combinations for djembe — extra symbols reuse the flam slap sample. */
export const DJEMBE_FLAMS: FlamDef[] = [
  { symbol: 'f', grace: 's', main: 's' },
  { symbol: 'r', grace: 't', main: 't' },
  { symbol: 'g', grace: 't', main: 's' },
  { symbol: 'j', grace: 's', main: 't' },
  { symbol: 'c', grace: 'b', main: 't' },
  { symbol: 'd', grace: 'b', main: 's' },
]

const flamBySymbol = Object.fromEntries(DJEMBE_FLAMS.map((flam) => [flam.symbol, flam]))

export const flamsForInstrument = (instrument: string): FlamDef[] =>
  instrument === 'djembe' ? DJEMBE_FLAMS : []

export const flamSymbolsForInstrument = (instrument: string) =>
  flamsForInstrument(instrument).map((flam) => flam.symbol)

export const isFlamSymbol = (symbol: string, instrument: string) =>
  flamSymbolsForInstrument(instrument).includes(symbol)

export const flamDefForSymbol = (symbol: string) => flamBySymbol[symbol] ?? null

export const flamMainNote = (symbol: string) => flamBySymbol[symbol]?.main ?? null

export const defaultFlamForNote = (note: string): string | null => {
  if (note === '-') return null
  if (note === 't') return 'r'
  if (note === 's') return 'f'
  return null
}

/** Symbol to restore when flam mode is turned off for the given base note. */
export const flamDisableTarget = (baseNote: string, flamSymbol: string): string | null => {
  if (baseNote === '-') return '-'
  return flamMainNote(flamSymbol)
}

/** Flam symbol to apply when flam mode is turned on. */
export const flamEnableTarget = (note: string, instrument: string): string | null => {
  if (!flamsForInstrument(instrument).length) return null
  if (note === '-') return null
  if (isFlamSymbol(note, instrument)) return note
  return defaultFlamForNote(note)
}
