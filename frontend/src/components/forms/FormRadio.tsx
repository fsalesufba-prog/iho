'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/Radio-group'
import { FormField } from './FormField'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface FormRadioProps {
  name: string
  label?: string
  description?: string
  options: Option[]
  required?: boolean
  disabled?: boolean
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function FormRadio({
  name,
  label,
  description,
  options,
  required,
  disabled,
  className,
  orientation = 'vertical'
}: FormRadioProps) {
<<<<<<< HEAD
  const { control } = useFormContext()
=======
  useFormContext()
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <RadioGroup
          onValueChange={field.onChange}
          value={field.value}
          disabled={disabled}
          className={cn(
            orientation === 'horizontal' ? 'flex space-x-4' : 'space-y-2',
            className
          )}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`${name}-${option.value}`}
                disabled={option.disabled}
              />
              <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </FormField>
  )
}