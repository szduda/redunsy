'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type BottomNavSlotContextValue = {
  setContent: (content: ReactNode) => void
}

const BottomNavSlotContext = createContext<BottomNavSlotContextValue | null>(null)

type BottomNavSlotProviderProps = {
  children: ReactNode
  onContentChange: (content: ReactNode) => void
}

export const BottomNavSlotProvider = ({ children, onContentChange }: BottomNavSlotProviderProps) => {
  const [content, setContent] = useState<ReactNode>(null)

  useEffect(() => {
    onContentChange(content)
  }, [content, onContentChange])

  return (
    <BottomNavSlotContext.Provider value={{ setContent }}>
      {children}
    </BottomNavSlotContext.Provider>
  )
}

type PageBottomNavProps = {
  children: ReactNode
}

export const PageBottomNav = ({ children }: PageBottomNavProps) => {
  const context = useContext(BottomNavSlotContext)

  useEffect(() => {
    if (!context) return undefined
    context.setContent(children)
    return () => context.setContent(null)
  }, [children, context])

  return null
}
