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

/** Default double-stroke flam when enabling flam on a plain note. */
export const defaultFlamForNote = (note: string): string | null => {
  if (note === 't') return 'r'
  if (note === 's') return 'f'
  return null
}
