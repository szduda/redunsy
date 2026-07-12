'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/features/theme/cn'

const TOAST_DURATION_MS = 5000

type ToastVariant = 'info' | 'success' | 'error'

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  pushToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantClass: Record<ToastVariant, string> = {
  info: 'border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
  error:
    'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
}

const ToastEntry = ({ toast, onDone }: { toast: ToastItem; onDone: (id: string) => void }) => {
  const [hovered, setHovered] = useState(false)
  const remainingRef = useRef(TOAST_DURATION_MS)
  const lastTickRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const schedule = useCallback(() => {
    clearTimer()
    timeoutRef.current = window.setTimeout(() => onDone(toast.id), remainingRef.current)
    lastTickRef.current = performance.now()
  }, [onDone, toast.id])

  useEffect(() => {
    schedule()
    return clearTimer
  }, [schedule])

  useEffect(() => {
    if (hovered) {
      if (lastTickRef.current !== null) {
        remainingRef.current -= performance.now() - lastTickRef.current
      }
      clearTimer()
      lastTickRef.current = null
      return
    }
    schedule()
  }, [hovered, schedule])

  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2 text-sm shadow-md transition-opacity',
        variantClass[toast.variant],
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="status"
    >
      {toast.message}
    </div>
  )
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const pushToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    setToasts((current) => [...current, { id: crypto.randomUUID(), message, variant }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div className="pointer-events-auto fixed bottom-20 right-3 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2 md:bottom-6">
              {toasts.map((toast) => (
                <ToastEntry key={toast.id} onDone={removeToast} toast={toast} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
