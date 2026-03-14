'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Calendar } from '@/components/ui/Calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { FormField } from './FormField'

interface FormDatePickerProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  fromDate?: Date
  toDate?: Date
}

export function FormDatePicker({
  name,
  label,
  description,
  placeholder = 'Selecione uma data',
  required,
  disabled,
  className,
  fromDate,
  toDate
}: FormDatePickerProps) {
  const { control } = useFormContext()

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !field.value && 'text-muted-foreground',
                className
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? (
                format(new Date(field.value), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value ? new Date(field.value) : undefined}
              onSelect={field.onChange}
              disabled={(date) => 
                (fromDate && date < fromDate) || 
                (toDate && date > toDate)
              }
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      )}
    </FormField>
  )
}