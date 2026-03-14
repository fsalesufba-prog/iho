'use client'

import React from 'react'
import {
  FormField as UIFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/Form'
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  children: (field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>) => React.ReactNode
  className?: string
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  label,
  description,
  required,
  children,
  className
}: FormFieldProps<TFieldValues>) {
  return (
    <UIFormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
<<<<<<< HEAD
            {children(field)}
=======
            {children(field as ControllerRenderProps<TFieldValues, Path<TFieldValues>>)}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}