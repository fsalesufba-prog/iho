'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { FormField } from './FormField'

interface FormInputProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  className?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  autoComplete?: string
}

export function FormInput({
  name,
  label,
  description,
  placeholder,
  type = 'text',
  required,
  disabled,
  className,
  maxLength,
  minLength,
  pattern,
  autoComplete
}: FormInputProps) {
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
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          value={field.value || ''}
        />
      )}
    </FormField>
  )
}