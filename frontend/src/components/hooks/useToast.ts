'use client'

import { useContext } from 'react'
import { ToastContext } from '@/components/feedback/ToastProvider'

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
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

export function useToast(): ToastContextData {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const success = (title: string, description?: string) => {
    context.toast({ title, description, variant: 'success' })
  }

  const error = (title: string, description?: string) => {
    context.toast({ title, description, variant: 'error' })
  }

  const warning = (title: string, description?: string) => {
    context.toast({ title, description, variant: 'warning' })
  }

  const info = (title: string, description?: string) => {
    context.toast({ title, description, variant: 'info' })
  }

  return {
    ...context,
    success,
    error,
    warning,
    info
  }
}

// Hook para toast com confirmação
export function useConfirmToast() {
  const { toast } = useToast()

  const confirm = (props: {
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel?: () => void
  }) => {
    // Implementar toast com ações
    toast({
      title: props.title,
      description: props.description,
      duration: 10000,
      // action: ...
    })
  }

  return { confirm }
}