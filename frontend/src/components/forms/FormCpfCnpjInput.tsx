'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import InputMask from 'react-input-mask'
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
  const { control, watch } = useFormContext()
  const value = watch(name) || ''

  const getMask = () => {
    if (type === 'cpf') return '999.999.999-99'
    if (type === 'cnpj') return '99.999.999/9999-99'
    
    // Auto detect based on length
    const numbers = value.replace(/\D/g, '')
    return numbers.length <= 11 ? '999.999.999-99' : '99.999.999/9999-99'
  }

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <InputMask
          mask={getMask()}
          value={field.value || ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          maskChar=""
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              placeholder={placeholder || (type === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00')}
              className={className}
            />
          )}
        </InputMask>
      )}
    </FormField>
  )
}