export const EDITOR_CANVAS_PADDING_Y = 8

export const editorCanvasPaddingX = (isMobile: boolean) => (isMobile ? 4 : 16)

export const editorCanvasInsets = (canvasWidth: number, isMobile: boolean) => {
  const paddingX = editorCanvasPaddingX(isMobile)
  const paddingY = EDITOR_CANVAS_PADDING_Y

  return {
    paddingX,
    paddingY,
    contentWidth: Math.max(0, canvasWidth - paddingX * 2),
  }
}
