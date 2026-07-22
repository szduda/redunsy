import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

import { getDevicePixelRatio } from './canvas-dpi'

type CanvasLayout = {
  width: number
  dpr: number
}

export const useCanvasWidth = (containerRef: RefObject<HTMLElement | null>): CanvasLayout => {
  const [layout, setLayout] = useState<CanvasLayout>({ width: 0, dpr: 1 })
  const layoutRef = useRef(layout)
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const applyLayout = (next: CanvasLayout) => {
      const prev = layoutRef.current
      if (prev.width === next.width && prev.dpr === next.dpr) return
      layoutRef.current = next
      setLayout(next)
    }

    const measure = () => {
      applyLayout({ width: element.clientWidth, dpr: getDevicePixelRatio() })
    }

    const scheduleMeasure = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        measure()
      })
    }

    measure()

    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(element)
    window.addEventListener('resize', scheduleMeasure)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      observer.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [containerRef])

  return layout
}
