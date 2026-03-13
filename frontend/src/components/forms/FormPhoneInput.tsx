'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import InputMask from 'react-input-mask'
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

export function FormPhoneInput({
  name,
  label,
  description,
  placeholder = '(00) 00000-0000',
  required,
  disabled,
  className
}: FormPhoneInputProps) {
  const { control } = useFormContext()

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <InputMask
          mask="(99) 99999-9999"
          value={field.value || ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
        >
          {(inputProps: any) => (
            <Input
              {...inputProps}
              placeholder={placeholder}
              className={className}
              type="tel"
            />
          )}
        </InputMask>
      )}
    </FormField>
  )
}