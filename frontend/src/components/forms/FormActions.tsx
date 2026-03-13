'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormActionsProps {
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
  showCancel?: boolean
}

export function FormActions({
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  onCancel,
  loading = false,
  disabled = false,
  className,
  showCancel = true
}: FormActionsProps) {
  const { formState } = useFormContext()
  const isSubmitting = formState.isSubmitting || loading

  return (
    <div className={cn('flex justify-end space-x-2', className)}>
      {showCancel && onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || disabled}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || disabled}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  )
}