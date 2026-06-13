import { useLayoutEffect, useState, type RefObject } from 'react'

export const useCanvasWidth = (containerRef: RefObject<HTMLElement | null>) => {
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const measure = () => setWidth(element.clientWidth)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [containerRef])

  return width
}
