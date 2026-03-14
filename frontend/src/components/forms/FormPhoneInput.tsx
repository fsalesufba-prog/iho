'use client'

import React from 'react'
<<<<<<< HEAD
import { useFormContext } from 'react-hook-form'
import InputMask from 'react-input-mask'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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

<<<<<<< HEAD
=======
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
export function FormPhoneInput({
  name,
  label,
  description,
  placeholder = '(00) 00000-0000',
  required,
  disabled,
  className
}: FormPhoneInputProps) {
<<<<<<< HEAD
  const { control } = useFormContext()

=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
<<<<<<< HEAD
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
=======
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
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
