export type PopoverDirection = 'top' | 'bottom' | 'left' | 'right'

export const POPOVER_GAP_PX = 4
export const POPOVER_MARGIN_PX = 8

export type TriggerRect = Pick<DOMRect, 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height'>

export type PanelPosition = {
  top: number
  left: number
  transform: string
}

export type PanelSize = {
  width: number
  height: number
}

export type ViewportSize = {
  width: number
  height: number
}

type PanelBounds = {
  left: number
  top: number
  right: number
  bottom: number
}

const OPPOSITE_DIRECTION: Record<PopoverDirection, PopoverDirection> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

export const getPanelPosition = (
  direction: PopoverDirection,
  trigger: TriggerRect,
): PanelPosition => {
  switch (direction) {
    case 'bottom':
      return {
        top: trigger.bottom + POPOVER_GAP_PX,
        left: trigger.left + trigger.width / 2,
        transform: 'translateX(-50%)',
      }
    case 'top':
      return {
        top: trigger.top - POPOVER_GAP_PX,
        left: trigger.left + trigger.width / 2,
        transform: 'translate(-50%, -100%)',
      }
    case 'left':
      return {
        top: trigger.top + trigger.height / 2,
        left: trigger.left - POPOVER_GAP_PX,
        transform: 'translate(-100%, -50%)',
      }
    case 'right':
      return {
        top: trigger.top + trigger.height / 2,
        left: trigger.right + POPOVER_GAP_PX,
        transform: 'translateY(-50%)',
      }
  }
}

export const getPanelBounds = (
  direction: PopoverDirection,
  position: PanelPosition,
  panel: PanelSize,
): PanelBounds => {
  const { top, left } = position
  const { width, height } = panel

  switch (direction) {
    case 'bottom':
      return { left: left - width / 2, top, right: left + width / 2, bottom: top + height }
    case 'top':
      return { left: left - width / 2, top: top - height, right: left + width / 2, bottom: top }
    case 'left':
      return { left: left - width, top: top - height / 2, right: left, bottom: top + height / 2 }
    case 'right':
      return { left, top: top - height / 2, right: left + width, bottom: top + height / 2 }
  }
}

export const clampPanelPosition = (
  direction: PopoverDirection,
  position: PanelPosition,
  panel: PanelSize,
  viewport: ViewportSize,
): PanelPosition => {
  const bounds = getPanelBounds(direction, position, panel)
  let dx = 0
  let dy = 0

  if (bounds.left < POPOVER_MARGIN_PX) dx = POPOVER_MARGIN_PX - bounds.left
  if (bounds.right > viewport.width - POPOVER_MARGIN_PX) {
    dx = viewport.width - POPOVER_MARGIN_PX - bounds.right
  }
  if (bounds.top < POPOVER_MARGIN_PX) dy = POPOVER_MARGIN_PX - bounds.top
  if (bounds.bottom > viewport.height - POPOVER_MARGIN_PX) {
    dy = viewport.height - POPOVER_MARGIN_PX - bounds.bottom
  }

  return {
    ...position,
    left: position.left + dx,
    top: position.top + dy,
  }
}

export const resolveDirection = (
  preferred: PopoverDirection,
  trigger: TriggerRect,
  panel: PanelSize,
  viewport: ViewportSize,
): PopoverDirection => {
  const space = {
    top: trigger.top - POPOVER_MARGIN_PX,
    bottom: viewport.height - trigger.bottom - POPOVER_MARGIN_PX,
    left: trigger.left - POPOVER_MARGIN_PX,
    right: viewport.width - trigger.right - POPOVER_MARGIN_PX,
  }

  const size = {
    top: panel.height,
    bottom: panel.height,
    left: panel.width,
    right: panel.width,
  }

  const fits = (direction: PopoverDirection) => space[direction] >= size[direction]

  const fitsInViewport = (direction: PopoverDirection) => {
    const position = clampPanelPosition(
      direction,
      getPanelPosition(direction, trigger),
      panel,
      viewport,
    )
    const bounds = getPanelBounds(direction, position, panel)
    return (
      bounds.left >= POPOVER_MARGIN_PX &&
      bounds.right <= viewport.width - POPOVER_MARGIN_PX &&
      bounds.top >= POPOVER_MARGIN_PX &&
      bounds.bottom <= viewport.height - POPOVER_MARGIN_PX
    )
  }

  if (fits(preferred) && fitsInViewport(preferred)) return preferred

  const opposite = OPPOSITE_DIRECTION[preferred]
  if (fits(opposite) && fitsInViewport(opposite)) return opposite

  const candidates: PopoverDirection[] = ['bottom', 'top', 'right', 'left']
  const fullyVisible = candidates.find((direction) => fits(direction) && fitsInViewport(direction))
  if (fullyVisible) return fullyVisible

  return space[preferred] >= space[opposite] ? preferred : opposite
}

export const resolvePopoverStyle = (
  trigger: TriggerRect,
  panel: PanelSize,
  preferredDirection: PopoverDirection,
  viewport: ViewportSize,
): PanelPosition => {
  const direction = resolveDirection(preferredDirection, trigger, panel, viewport)
  const position = getPanelPosition(direction, trigger)
  return clampPanelPosition(direction, position, panel, viewport)
}
