'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Loader2 } from 'lucide-react'

interface PromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (value: string) => Promise<void> | void
  title?: string
  description?: string
  label?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export function PromptDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Digite um valor',
  description,
  label,
  placeholder,
  defaultValue = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm(value)
      setValue('')
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {label && <Label>{label}</Label>}
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || loading || !value.trim()}
          >
            {(isLoading || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook personalizado para usar o PromptDialog
export function usePromptDialog() {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<Omit<PromptDialogProps, 'open' | 'onOpenChange'>>({
    onConfirm: async () => {},
  })

  const prompt = (props: Omit<PromptDialogProps, 'open' | 'onOpenChange'>) => {
    setConfig(props)
    setOpen(true)
  }

  const PromptDialogComponent = () => (
    <PromptDialog
      open={open}
      onOpenChange={setOpen}
      {...config}
    />
  )

  return { prompt, PromptDialog: PromptDialogComponent }
}