'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const getFocusableElements = (containers: HTMLElement[]) =>
  containers.flatMap((container) =>
    [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
      (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
    ),
  )

/** Trap Tab focus inside containers while active. Restores focus to the prior element on deactivate. */
export const useFocusTrap = (
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  additionalRef?: RefObject<HTMLElement | null>,
) => {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    const getContainers = () => {
      const containers = [containerRef.current, additionalRef?.current].filter(
        (container): container is HTMLElement => container !== null,
      )
      return containers
    }

    const focusFirst = () => {
      const [first] = getFocusableElements(getContainers())
      first?.focus()
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(focusFirst)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const containers = getContainers()
      if (!containers.length) return

      const focusable = getFocusableElements(containers)
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement as HTMLElement | null
      const focusInside = activeElement
        ? containers.some((container) => container.contains(activeElement))
        : false

      if (!focusInside) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
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

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown, true)
      previousFocusRef.current?.focus({ preventScroll: true })
    }
  }, [active, additionalRef, containerRef])
}
