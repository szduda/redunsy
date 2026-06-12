import { useEffect, useState } from 'react'

type Props = {
  canvasId: string
  defaultWidth?: number
}

export const useCanvasWidth = ({ canvasId, defaultWidth = 280 }: Props) => {
  const [canvasWidth, setCanvasWidth] = useState(defaultWidth)

  useEffect(() => {
    const handler = () => {
      const canvas = document.getElementById(canvasId)
      if (!canvas) return
      setCanvasWidth(canvas.parentElement?.clientWidth ?? defaultWidth)
    }

    handler()
    const timeout = { id: 0 }
    const debouncedHandler = () => {
      window.clearTimeout(timeout.id)
      timeout.id = window.setTimeout(handler, 500)
    }

    window.addEventListener('resize', debouncedHandler)
    return () => window.removeEventListener('resize', debouncedHandler)
  }, [canvasId, defaultWidth])

  return canvasWidth
}
