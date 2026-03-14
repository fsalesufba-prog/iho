'use client'

import React from 'react'
import { Input } from '@/components/ui/Input'
import { FormField } from './FormField'

interface FormPhoneInputProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function FormPhoneInput({
  name,
  label,
  description,
  placeholder = '(00) 00000-0000',
  required,
  disabled,
  className
}: FormPhoneInputProps) {
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
          value={formatPhone(field.value || '')}
          onChange={(e) => field.onChange(formatPhone(e.target.value))}
          placeholder={placeholder}
          className={className}
          type="tel"
          disabled={disabled}
        />
      )}
    </FormField>
  )
}
