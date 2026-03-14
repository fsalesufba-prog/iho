'use client'

import React from 'react'
import { Input } from '@/components/ui/Input'
import { FormField } from './FormField'

interface FormCpfCnpjInputProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  type?: 'cpf' | 'cnpj' | 'auto'
}

function formatCpf(digits: string) {
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

function formatCnpj(digits: string) {
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}

export function FormCpfCnpjInput({
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  type = 'auto'
}: FormCpfCnpjInputProps) {
  const formatValue = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (type === 'cnpj' || (type === 'auto' && digits.length > 11)) {
      return formatCnpj(digits.slice(0, 14))
    }
    return formatCpf(digits.slice(0, 11))
  }

  const getPlaceholder = () => {
    if (placeholder) return placeholder
    if (type === 'cpf') return '000.000.000-00'
    if (type === 'cnpj') return '00.000.000/0000-00'
    return '000.000.000-00'
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
          value={formatValue(field.value || '')}
          onChange={(e) => field.onChange(formatValue(e.target.value))}
          placeholder={getPlaceholder()}
          className={className}
          disabled={disabled}
        />
      )}
    </FormField>
  )
}
