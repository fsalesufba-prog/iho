'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toast, ToastProvider as ToastPrimitiveProvider } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextData {
  toasts: Toast[]
  toast: (props: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ duration = 5000, ...props }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    setToasts((prev) => [...prev, { ...props, id, duration }])

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      <ToastPrimitiveProvider>
        {children}
        <ToastViewport />
        {toasts.map(({ id, ...props }) => (
          <Toast key={id} {...props} onClose={() => dismiss(id)} />
        ))}
      </ToastPrimitiveProvider>
    </ToastContext.Provider>
  )
}

// Componente ToastViewport
function ToastViewport() {
  return (
    <div
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]'
      )}
    />
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}