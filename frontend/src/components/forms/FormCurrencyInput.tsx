'use client'

import React from 'react'
<<<<<<< HEAD
import { useFormContext } from 'react-hook-form'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { Input } from '@/components/ui/Input'
import { FormField } from './FormField'

interface FormCurrencyInputProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
<<<<<<< HEAD
  min?: number
  max?: number
  step?: number
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
}

export function FormCurrencyInput({
  name,
  label,
  description,
  placeholder = 'R$ 0,00',
  required,
  disabled,
  className,
<<<<<<< HEAD
  min,
  max,
  step = 0.01
}: FormCurrencyInputProps) {
  const { control } = useFormContext()

=======
}: FormCurrencyInputProps) {
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const formatValue = (value: number | string) => {
    if (!value) return ''
    
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.'))
      : value

    if (isNaN(numericValue)) return ''

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue)
  }

  const parseValue = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.'))
    return isNaN(numericValue) ? 0 : numericValue
  }

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <Input
          {...field}
          value={formatValue(field.value)}
          onChange={(e) => {
            const parsed = parseValue(e.target.value)
            field.onChange(parsed)
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          type="text"
          inputMode="numeric"
        />
      )}
    </FormField>
  )
}