export const YELOWY_DARK = '#f9c926'
export const YELOWY_LIGHT_MODE = '#d2b769'

export const yellowyBorderColor = (dark: boolean) => (dark ? YELOWY_DARK : YELOWY_LIGHT_MODE)

export const yellowyGapFill = (dark: boolean) =>
  dark ? 'rgba(249, 201, 38, 0.08)' : 'rgba(210, 183, 105, 0.08)'

export const yellowyOverlay = (dark: boolean, opacity: number) =>
  dark ? `rgba(249, 201, 38, ${opacity})` : `rgba(210, 183, 105, ${opacity})`

export const DRAG_SOURCE_OVERLAY_OPACITY = 0.7
export const DRAG_PREVIEW_OVERLAY_OPACITY = 0.2
