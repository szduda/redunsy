export type BeatSlot = [sampleIds: number[], sustain: number[]]
export type BeatMatrix = BeatSlot[]

export type CellHit = {
  sound: string
  sampleId: number | null
}

export type CellKind = 'eighth' | 'sixteenth' | 'triplet' | 'triplet-pair'

export type ParsedCell = {
  kind: CellKind
  hits: CellHit[]
  slotIndexes: number[]
  tripletNotes?: CellHit[]
}

export type LayerConfig = {
  instrument: string
  sounds: string[]
  lengths: ('8th' | '16th' | '8th triplet')[]
  grooves?: string[]
}

export type PlayTracks = Record<string, string[]>

export type MidinikeOptions = {
  loop?: boolean
  tempo?: number
  /** Initial swing/groove pattern; defaults to 8 straight eighths or the first layer groove. */
  initialGroove?: string
  /** When true, merged playback only recompiles when every bar cell count equals groove length. */
  strictGrooveLength?: boolean
} & {
  [key: string]: LayerConfig | boolean | number | string | undefined
}

export type MidiPlayer = {
  startPlayLoop: (
    beats: BeatMatrix,
    bpm: number,
    density: number,
    fromBeat: number,
    onBeat?: (index: number) => void,
  ) => void
  stopPlayLoop: () => void
  setDrumVolume: (drum: number, volume: number) => void
  playDrumsNow: (drums: number[]) => void
}

export type CompileGrooveInput = {
  bars: string[]
  groove: string
  soundMap?: Record<string, number | null>
}

export type CompileGrooveResult = {
  beats: BeatMatrix
  cellsPerBar: number
  cellCount: number
  preGrooveSlots: number
  swingModifier: number
  barSlotOffsets: number[]
}
