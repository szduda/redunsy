'use client'

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

export const BOTTOM_NAV_PORTAL_ID = 'bottom-nav-portal'

type BottomNavSlotContextValue = {
  setHasBottomNav: (visible: boolean) => void
}

const BottomNavSlotContext = createContext<BottomNavSlotContextValue | null>(null)

type BottomNavSlotProviderProps = {
  children: ReactNode
  onHasBottomNavChange: (visible: boolean) => void
}

export const BottomNavSlotProvider = ({ children, onHasBottomNavChange }: BottomNavSlotProviderProps) => (
  <BottomNavSlotContext.Provider value={{ setHasBottomNav: onHasBottomNavChange }}>
    {children}
  </BottomNavSlotContext.Provider>
)

export const BottomNavPortalTarget = () => (
  <div id={BOTTOM_NAV_PORTAL_ID} className="h-full w-full" />
)

type PageBottomNavProps = {
  children: ReactNode
}

export const PageBottomNav = ({ children }: PageBottomNavProps) => {
  const context = useContext(BottomNavSlotContext)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setPortalTarget(document.getElementById(BOTTOM_NAV_PORTAL_ID))
  }, [])

  useEffect(() => {
    if (!context) return undefined
    context.setHasBottomNav(true)
    return () => context.setHasBottomNav(false)
  }, [context])

  if (!portalTarget) return null

  return createPortal(children, portalTarget)
}
