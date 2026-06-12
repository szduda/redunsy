export type CanvasElement = {
  type: 'note' | 'bar'
  colour?: string
  bgColor: string
  width: number
  height: number
  top: number
  left: number
  note?: string
  barIndex?: number
  noteIndex?: number
}

export type NoteRenderer = (
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  bgColor?: string,
) => void

export type CharsRenderer = Record<string, NoteRenderer>
export type FontRenderer = Record<string, CharsRenderer>
