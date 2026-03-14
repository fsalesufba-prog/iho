'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'

interface ConfirmationOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

interface ConfirmationContextData {
  confirm: (options: ConfirmationOptions) => void
  isOpen: boolean
}

const ConfirmationContext = createContext<ConfirmationContextData>({} as ConfirmationContextData)

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions>({
    title: 'Confirmar ação',
    description: 'Tem certeza que deseja realizar esta ação?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'default',
    onConfirm: () => {},
    onCancel: () => {},
  })

  const confirm = useCallback((confirmOptions: ConfirmationOptions) => {
    setOptions({
      title: confirmOptions.title || 'Confirmar ação',
      description: confirmOptions.description || 'Tem certeza que deseja realizar esta ação?',
      confirmText: confirmOptions.confirmText || 'Confirmar',
      cancelText: confirmOptions.cancelText || 'Cancelar',
      variant: confirmOptions.variant || 'default',
      onConfirm: confirmOptions.onConfirm,
      onCancel: confirmOptions.onCancel || (() => {}),
    })
    setIsOpen(true)
  }, [])

  const handleConfirm = async () => {
    await options.onConfirm()
    setIsOpen(false)
  }

  const handleCancel = () => {
    options.onCancel?.()
    setIsOpen(false)
  }

  return (
    <ConfirmationContext.Provider value={{ confirm, isOpen }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{options.cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={options.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {options.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmationContext.Provider>
  )
}

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider')
  }
  return context
}