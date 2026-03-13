'use client'

import React from 'react'
import { FormProvider, UseFormReturn, FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface FormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>
  onSubmit: (data: TFieldValues) => void
  children: React.ReactNode
  className?: string
  id?: string
}

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  id
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
        id={id}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  )
}

// Form com validação em tempo real
Form.WithLiveValidation = function FormWithLiveValidation<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  id
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
        id={id}
        noValidate
      >
        {children}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            Corrija os erros antes de enviar
          </div>
        )}
      </form>
    </FormProvider>
  )
}