'use client'

import React, { useState } from 'react'
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

import { Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirmar ação',
  description = 'Tem certeza que deseja realizar esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading || loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || loading}
            className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {(isLoading || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook personalizado para usar o ConfirmDialog
export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>>({
    onConfirm: async () => {},
  })

  const confirm = (props: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
    setConfig(props)
    setOpen(true)
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      {...config}
    />
  )

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}

// ConfirmDialog para deletar
ConfirmDialog.Delete = function DeleteConfirmDialog(props: Partial<ConfirmDialogProps>) {
  return (
    <ConfirmDialog
      title="Confirmar exclusão"
      description="Esta ação não pode ser desfeita. Todos os dados relacionados serão permanentemente removidos."
      confirmText="Excluir"
      variant="destructive"
      {...props}
    />
  )
}