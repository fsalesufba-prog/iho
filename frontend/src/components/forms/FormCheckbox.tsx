'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from './FormField'
import { cn } from '@/lib/utils'

interface FormCheckboxProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FormCheckbox({
  name,
  label,
  description,
  required,
  disabled,
  className
}: FormCheckboxProps) {
  const { control } = useFormContext()

  return (
    <FormField
      name={name}
      required={required}
    >
      {(field) => (
        <div className={cn('flex items-start space-x-2', className)}>
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            id={name}
          />
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      )}
    </FormField>
  )
}