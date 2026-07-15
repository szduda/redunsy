export const PLAYER_CANVAS_PADDING_Y = 8
export const PLAYER_CANVAS_PADDING_Y_MOBILE = 4

export const playerCanvasInsets = (canvasWidth: number, isMobile: boolean) => {
  const paddingY = isMobile ? PLAYER_CANVAS_PADDING_Y_MOBILE : PLAYER_CANVAS_PADDING_Y

  return {
    paddingY,
    contentWidth: canvasWidth,
  }
}
