'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextData {
  toasts: ToastItem[]
  toast: (props: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

export const ToastContext = createContext<ToastContextData>({} as ToastContextData)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ duration = 5000, ...props }: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id, duration }])
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
  }, [dismiss])

  const dismissAll = useCallback(() => setToasts([]), [])

  const success = useCallback((title: string, description?: string) => toast({ title, description, variant: 'success' }), [toast])
  const error = useCallback((title: string, description?: string) => toast({ title, description, variant: 'error' }), [toast])
  const warning = useCallback((title: string, description?: string) => toast({ title, description, variant: 'warning' }), [toast])
  const info = useCallback((title: string, description?: string) => toast({ title, description, variant: 'info' }), [toast])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll, success, error, warning, info }}>
      {children}
      <div className={cn('fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none')}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto rounded-lg p-4 shadow-lg text-sm flex items-start justify-between gap-2',
              t.variant === 'success' && 'bg-green-500 text-white',
              t.variant === 'error' && 'bg-red-500 text-white',
              t.variant === 'warning' && 'bg-yellow-500 text-white',
              t.variant === 'info' && 'bg-blue-500 text-white',
              (!t.variant || t.variant === 'default') && 'bg-white text-gray-900 border'
            )}
          >
            <div>
              {t.title && <div className="font-semibold">{t.title}</div>}
              {t.description && <div className="opacity-90 text-sm mt-1">{t.description}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100 ml-2 shrink-0">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
