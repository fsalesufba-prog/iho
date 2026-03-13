'use client'

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2 } from 'lucide-react'
import { FormField } from './FormField'
import { cn } from '@/lib/utils'

interface FormArrayProps {
  name: string
  label?: string
  description?: string
  children: (index: number) => React.ReactNode
  defaultValues?: any
  maxItems?: number
  minItems?: number
  addLabel?: string
  removeLabel?: string
  className?: string
}

export function FormArray({
  name,
  label,
  description,
  children,
  defaultValues = {},
  maxItems,
  minItems = 0,
  addLabel = 'Adicionar',
  removeLabel = 'Remover',
  className
}: FormArrayProps) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name
  })

  const canAdd = !maxItems || fields.length < maxItems
  const canRemove = fields.length > minItems

  return (
    <FormField
      name={name}
      label={label}
      description={description}
    >
      {() => (
        <div className={cn('space-y-4', className)}>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1">
                {children(index)}
              </div>
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="h-10 w-10 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {canAdd && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(defaultValues)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addLabel}
            </Button>
          )}
        </div>
      )}
    </FormField>
  )
}