/** Keyboard-only focus ring for player/editor interactive controls (not text fields). */
export const KEYBOARD_FOCUS_VISIBLE_CLASS =
  'outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-yellowy-light/50 focus-visible:outline-offset-2'

/** Focus an element and show the keyboard focus ring after a shortcut. */
export const focusFromKeyboard = (element: HTMLElement | null | undefined) => {
  if (!element) return
  element.focus({ preventScroll: true, focusVisible: true } as FocusOptions)
}
