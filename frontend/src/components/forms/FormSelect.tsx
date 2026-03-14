'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { FormField } from './FormField'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  options: Option[]
  required?: boolean
  disabled?: boolean
  className?: string
}

export function FormSelect({
  name,
  label,
  description,
  placeholder = 'Selecione...',
  options,
  required,
  disabled,
  className
}: FormSelectProps) {
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
        <Select
          onValueChange={field.onChange}
          value={field.value}
          disabled={disabled}
        >
          <SelectTrigger className={className}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  )
}