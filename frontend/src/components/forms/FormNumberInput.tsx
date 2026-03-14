'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Minus, Plus } from 'lucide-react'
import { FormField } from './FormField'
import { cn } from '@/lib/utils'

interface FormNumberInputProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  min?: number
  max?: number
  step?: number
  showControls?: boolean
}

export function FormNumberInput({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  min,
  max,
  step = 1,
  showControls = false
}: FormNumberInputProps) {
  const { setValue, watch } = useFormContext()
  const value = watch(name) || 0

  const increment = () => {
    const newValue = (value || 0) + step
    if (max === undefined || newValue <= max) {
      setValue(name, newValue)
    }
  }

  const decrement = () => {
    const newValue = (value || 0) - step
    if (min === undefined || newValue >= min) {
      setValue(name, newValue)
    }
  }

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <div className={cn('flex', showControls && 'gap-2')}>
          {showControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={decrement}
              disabled={disabled || (min !== undefined && (value || 0) <= min)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
          
          <Input
            {...field}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            className={cn(showControls && 'text-center', className)}
            min={min}
            max={max}
            step={step}
            value={field.value || ''}
          />

          {showControls && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={increment}
              disabled={disabled || (max !== undefined && (value || 0) >= max)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </FormField>
  )
}