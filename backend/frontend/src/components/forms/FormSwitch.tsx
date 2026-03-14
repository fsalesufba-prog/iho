'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Switch } from '@/components/ui/Switch'
import { FormField } from './FormField'
import { cn } from '@/lib/utils'

interface FormSwitchProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FormSwitch({
  name,
  label,
  description,
  required,
  disabled,
  className
}: FormSwitchProps) {
  const { control } = useFormContext()

  return (
    <FormField
      name={name}
      required={required}
    >
      {(field) => (
        <div className={cn('flex items-center justify-between', className)}>
          <div className="space-y-0.5">
            {label && (
              <Label className="text-base">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        </div>
      )}
    </FormField>
  )
}