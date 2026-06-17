import { drawCircle, drawCross, drawRing } from './drawing'
import { colors } from './renderers'

import type { CanvasElement, CharsRenderer, FontRenderer, NoteRenderer } from './types'

const getR = (el: CanvasElement) => {
  const r = Math.min(el.width, el.height) / 2
  const padding = r < 15 ? 1 : 3
  return r - padding
}

const soundLowRenderer: NoteRenderer = (ctx, el) => drawCircle(ctx, el, getR(el))

const soundMidRenderer: NoteRenderer = (ctx, el, bgColor = el.bgColor) =>
  drawRing(ctx, el, getR(el), getR(el) / 2.5, bgColor)

const soundHighRenderer: NoteRenderer = (ctx, el, bgColor = el.bgColor) => {
  drawRing(ctx, el, getR(el), getR(el) / 3, bgColor)
  drawCross(ctx, el, getR(el) + 1, getR(el) / 3.5)
}

const stickRenderer: NoteRenderer = (ctx, el) => {
  const x = el.left + el.width / 2
  const padding = el.height < 30 ? 2 : 4
  ctx.strokeStyle = el.colour ?? colors.w2
  ctx.lineWidth = el.width / 4
  ctx.beginPath()
  ctx.moveTo(x, el.top + padding)
  ctx.lineTo(x, el.top + el.height - padding)
  ctx.stroke()
}

type FlamRenderer = (notes: [NoteRenderer, NoteRenderer]) => NoteRenderer

const flamRenderer: FlamRenderer = (notes) => (ctx, el, bgColor = el.bgColor) => {
  const top = el.top - getR(el) * 0.2
  const left = el.left - getR(el) * 0.1
  const [leftRenderer, rightRenderer] = notes
  leftRenderer(
    ctx,
    {
      ...el,
      top,
      left,
      height: el.height * 0.8,
      width: el.width * 0.8,
    },
    bgColor,
  )
  rightRenderer(ctx, { ...el, top: el.top + 1, left: el.left + 1 }, bgColor)
}

const ttFlamRenderer: NoteRenderer = flamRenderer([soundMidRenderer, soundMidRenderer])
const ssFlamRenderer: NoteRenderer = flamRenderer([soundHighRenderer, soundHighRenderer])

const pauseSymbol: CharsRenderer = {
  '-': (ctx, el) => drawCircle(ctx, el, el.height / 30),
}

const dundunSymbols: CharsRenderer = {
  ...pauseSymbol,
  o: soundLowRenderer,
  x: soundHighRenderer,
}

export const font: FontRenderer = {
  dundunba: dundunSymbols,
  sangban: dundunSymbols,
  kenkeni: dundunSymbols,
  kenkeni2: dundunSymbols,
  djembe: {
    ...pauseSymbol,
    b: soundLowRenderer,
    t: soundMidRenderer,
    s: soundHighRenderer,
    r: ttFlamRenderer,
    f: ssFlamRenderer,
  },
  bell: {
    ...pauseSymbol,
    x: (ctx, el) => drawCross(ctx, el, getR(el) + 4, getR(el) / 3.5),
  },
  stick: {
    ...pauseSymbol,
    x: stickRenderer,
  },
}
