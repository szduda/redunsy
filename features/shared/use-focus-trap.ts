'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const getFocusableElements = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
  )

type FocusTrapOptions = {
  /** Elements removed from the tab order while the trap is active (e.g. popover triggers). */
  excludeFromTabOrder?: RefObject<HTMLElement | null>
}

/** Trap Tab focus inside a container while active. Restores focus to the prior element on deactivate. */
export const useFocusTrap = (
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  { excludeFromTabOrder }: FocusTrapOptions = {},
) => {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    const getContainer = () => containerRef.current

    const getFocusable = () => {
      const container = getContainer()
      return container ? getFocusableElements(container) : []
    }

    const focusAt = (index: 'first' | 'last') => {
      const focusable = getFocusable()
      if (!focusable.length) return
      ;(index === 'first' ? focusable[0] : focusable[focusable.length - 1]).focus()
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => focusAt('first'))

    const excluded: { element: HTMLElement; tabIndex: number }[] = []
    const excludeRoot = excludeFromTabOrder?.current
    if (excludeRoot) {
      getFocusableElements(excludeRoot).forEach((element) => {
        excluded.push({ element, tabIndex: element.tabIndex })
        element.tabIndex = -1
      })
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const container = getContainer()
      if (!container) return

      const focusable = getFocusable()
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement as HTMLElement | null
      const focusInside = activeElement ? container.contains(activeElement) : false

      if (!focusInside) {
        event.preventDefault()
        focusAt(event.shiftKey ? 'last' : 'first')
        return
      }

      if (focusable.length === 1) {
        event.preventDefault()
        first.focus()
        return
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault()
        last.focus()
        return
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const onFocusIn = (event: FocusEvent) => {
      const container = getContainer()
      if (!container) return

      const target = event.target
      if (target instanceof Node && container.contains(target)) return

      event.stopPropagation()
      focusAt('first')
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocusIn, true)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocusIn, true)
      excluded.forEach(({ element, tabIndex }) => {
        element.tabIndex = tabIndex
      })
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [active, containerRef, excludeFromTabOrder])
}
