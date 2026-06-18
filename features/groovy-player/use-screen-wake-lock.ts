'use client'

import { useEffect, useRef } from 'react'

type UseScreenWakeLockArgs = {
  enabled: boolean
  active: boolean
}

export const useScreenWakeLock = ({ enabled, active }: UseScreenWakeLockArgs) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled || !active) {
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
      return undefined
    }

    if (!('wakeLock' in navigator)) return undefined

    let cancelled = false

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return
      try {
        await wakeLockRef.current?.release().catch(() => {})
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        wakeLockRef.current = null
      }
    }

    void acquire()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [active, enabled])
}
