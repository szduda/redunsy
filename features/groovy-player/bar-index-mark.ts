export const drawBarIndexLabel = (
  context: CanvasRenderingContext2D,
  centerX: number,
  bottomY: number,
  barIndex: number,
  color: string,
) => {
  context.fillStyle = color
  context.font = '7px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'bottom'
  context.fillText(String(barIndex + 1), centerX, bottomY)
}
