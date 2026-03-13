'use client'

import { useState, useCallback } from 'react'

interface ConfirmationOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: 'Confirmar ação',
    description: 'Tem certeza que deseja realizar esta ação?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'default',
    onConfirm: () => {},
    onCancel: () => {}
  })

  const confirm = useCallback((options: ConfirmationOptions) => {
    setState({
      isOpen: true,
      title: options.title || 'Confirmar ação',
      description: options.description || 'Tem certeza que deseja realizar esta ação?',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      variant: options.variant || 'default',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel || (() => {})
    })
  }, [])

  const handleConfirm = useCallback(async () => {
    await state.onConfirm()
    setState(prev => ({ ...prev, isOpen: false }))
  }, [state.onConfirm])

  const handleCancel = useCallback(() => {
    state.onCancel?.()
    setState(prev => ({ ...prev, isOpen: false }))
  }, [state.onCancel])

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    ...state,
    confirm,
    handleConfirm,
    handleCancel,
    close
  }
}

// Hook específico para confirmação de exclusão
export function useDeleteConfirmation() {
  const confirmation = useConfirmation()

  const confirmDelete = useCallback((onConfirm: () => void | Promise<void>, itemName?: string) => {
    confirmation.confirm({
      title: 'Confirmar exclusão',
      description: itemName 
        ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
        : 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      variant: 'destructive',
      onConfirm
    })
  }, [confirmation])

  return {
    ...confirmation,
    confirmDelete
  }
}