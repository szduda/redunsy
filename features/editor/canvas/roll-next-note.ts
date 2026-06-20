import { darkCanvasColors } from '@/features/groovy-player/canvas/canvas-colors'
import { font } from '@/features/groovy-player/canvas/drum-font'
import { renderNote } from '@/features/groovy-player/canvas/renderers'
import type { CanvasElement } from '@/features/groovy-player/canvas/types'

const colors = darkCanvasColors

export const rollNextNote = (
  event: { button: number },
  target: { element: CanvasElement; index: number },
  props: {
    canvas: HTMLCanvasElement
    canvasElements: CanvasElement[]
    instrument: string
  },
) => {
  if (target.element.type !== 'note') return {}

  const validNotes = Object.keys(font[props.instrument] ?? font.djembe)
  const validNoteIndex = validNotes.indexOf(target.element.note ?? '-')
  const nextNoteIndex = validNoteIndex === validNotes.length - 1 ? 0 : validNoteIndex + 1
  const nextEl = {
    ...(target.element as Required<CanvasElement>),
    colour: colors.w2,
    note: event.button === 0 ? validNotes[nextNoteIndex] : '-',
  }

  const nextElements = [...props.canvasElements]
  nextElements[target.index] = nextEl
  renderNote({
    instrument: props.instrument,
    el: nextEl,
    context: props.canvas.getContext('2d')!,
  })

  return { nextElements, nextEl }
}
