import { POLYRHYTHM_SLOT_COUNT } from './polyrhythm-positions'

export const polyrhythmGroupInner = (bar: string, openIndex: number) => {
  const end = bar.indexOf('>', openIndex)
  if (end === -1) return null
  return bar.slice(openIndex + 1, end)
}

/** Editor conversion writes `<first--second-->` with notes only on slots 1 and 4. */
export const hasConvertedPolyrhythmGlue = (inner: string) =>
  inner.length >= POLYRHYTHM_SLOT_COUNT &&
  /[a-zA-Z]/.test(inner[0] ?? '') &&
  inner[1] === '-' &&
  inner[2] === '-' &&
  /[a-zA-Z]/.test(inner[3] ?? '') &&
  inner[4] === '-' &&
  inner[5] === '-'

/** Editor-anchored groups keep notes on slots 1 and 4; inner rests may be edited later. */
export const isEditorAnchoredPolyrhythmInner = (inner: string) => {
  if (inner.length < POLYRHYTHM_SLOT_COUNT) return false
  if (!/[a-zA-Z]/.test(inner[0] ?? '') || !/[a-zA-Z]/.test(inner[3] ?? '')) return false

  const betweenAnchors = `${inner.slice(1, 3)}${inner.slice(4, 6)}`
  return betweenAnchors.includes('-')
}

/** Absorb when slot 1 is a rest or already matches the glued plain note. */
export const shouldAbsorbPlainIntoPolyrhythm = (plain: string, inner: string) =>
  inner[0] === '-' || inner[0] === plain

export const absorbPlainIntoPolyrhythmInner = (plain: string, inner: string) =>
  inner[0] === '-' ? `${plain}${inner.slice(1)}` : inner

const isPolyrhythmGlueAt = (bar: string, glueIndex: number) => {
  const next = bar[glueIndex + 1]
  const prev = bar[glueIndex - 1]
  if (bar[glueIndex] !== '-' || next !== '<') return false
  if (!prev || prev === '-' || prev === '}' || prev === ']' || prev === '>') return false

  const inner = polyrhythmGroupInner(bar, glueIndex + 1)
  if (!inner || hasConvertedPolyrhythmGlue(inner) || isEditorAnchoredPolyrhythmInner(inner)) {
    return false
  }

  return true
}

export const canAbsorbPlainIntoPolyrhythm = (bar: string, plainIndex: number) => {
  const plain = bar[plainIndex]
  const glueIndex = plainIndex + 1
  const openIndex = glueIndex + 1
  if (!plain || plain === '-') return null
  if (!isPolyrhythmGlueAt(bar, glueIndex)) return null

  const inner = polyrhythmGroupInner(bar, openIndex)
  if (!inner || !shouldAbsorbPlainIntoPolyrhythm(plain, inner)) return null

  const end = bar.indexOf('>', openIndex)
  return {
    plain,
    glueIndex,
    openIndex,
    end,
    inner: absorbPlainIntoPolyrhythmInner(plain, inner),
  }
}
