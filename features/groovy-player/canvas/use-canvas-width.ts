import { useLayoutEffect, useState, type RefObject } from 'react'

import { getDevicePixelRatio } from './canvas-dpi'

type CanvasLayout = {
  width: number
  dpr: number
}

export const useCanvasWidth = (containerRef: RefObject<HTMLElement | null>): CanvasLayout => {
  const [layout, setLayout] = useState<CanvasLayout>({ width: 0, dpr: 1 })

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const measure = () => setLayout({ width: element.clientWidth, dpr: getDevicePixelRatio() })
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [containerRef])

  return layout
}
