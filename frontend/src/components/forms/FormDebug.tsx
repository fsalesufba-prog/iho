'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { JsonViewer } from '@/components/data-display/JsonViewer'

interface FormDebugProps {
  showValues?: boolean
  showErrors?: boolean
  showState?: boolean
  className?: string
}

export function FormDebug({
  showValues = true,
  showErrors = true,
  showState = true,
  className
}: FormDebugProps) {
  const { watch, formState } = useFormContext()
  const values = watch()

  const debugData: any = {}

  if (showValues) {
    debugData.values = values
  }

  if (showErrors) {
    debugData.errors = formState.errors
  }

  if (showState) {
    debugData.state = {
      isDirty: formState.isDirty,
      isValid: formState.isValid,
      isSubmitting: formState.isSubmitting,
      isSubmitted: formState.isSubmitted,
      submitCount: formState.submitCount
    }
  }

  return (
    <Card className={cn('p-4 bg-muted/50', className)}>
      <h4 className="text-sm font-medium mb-2">Debug do Formulário</h4>
      <JsonViewer data={debugData} />
    </Card>
  )
}