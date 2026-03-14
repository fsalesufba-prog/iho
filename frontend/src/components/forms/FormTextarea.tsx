'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from './FormField'

interface FormTextareaProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  rows?: number
  maxLength?: number
  showCount?: boolean
}

export function FormTextarea({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  rows = 4,
  maxLength,
  showCount = false
}: FormTextareaProps) {
  const { watch } = useFormContext()
  const value = watch(name) || ''

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <div className="space-y-2">
          <Textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            rows={rows}
            maxLength={maxLength}
            value={field.value || ''}
          />
          {showCount && maxLength && (
            <div className="text-xs text-muted-foreground text-right">
              {value.length} / {maxLength}
            </div>
          )}
        </div>
      )}
    </FormField>
  )
}