'use client'

import { useContext } from 'react'
import { ToastContext } from '@/components/providers/ToastProvider'

export function useToast() {
  const context = useContext(ToastContext)
  if (!context || !context.toast) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

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
    toast({
      title: props.title,
      description: props.description,
      duration: 10000,
    })
  }

  return { confirm }
}
