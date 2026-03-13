'use client'

import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/Command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { Badge } from '@/components/ui/Badge'
import { FormField } from './FormField'

interface Option {
  value: string
  label: string
}

interface FormMultiSelectProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  options: Option[]
  maxItems?: number
}

export function FormMultiSelect({
  name,
  label,
  description,
  placeholder = 'Selecione...',
  required,
  disabled,
  className,
  options,
  maxItems
}: FormMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const { control, setValue, watch } = useFormContext()
  const selectedValues = watch(name) || []

  const handleSelect = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v: string) => v !== optionValue)
      : [...selectedValues, optionValue]

    if (maxItems && newValues.length > maxItems) {
      return
    }

    setValue(name, newValues)
  }

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newValues = selectedValues.filter((v: string) => v !== optionValue)
    setValue(name, newValues)
  }

  const selectedLabels = selectedValues.map((value: string) =>
    options.find((opt) => opt.value === value)?.label
  )

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {() => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'w-full justify-between h-auto min-h-10',
                !selectedValues.length && 'text-muted-foreground',
                className
              )}
              disabled={disabled}
            >
              <div className="flex flex-wrap gap-1">
                {selectedValues.length > 0 ? (
                  selectedLabels.map((label: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mr-1"
                    >
                      {label}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(selectedValues[index], e)
                        }}
                      />
                    </Badge>
                  ))
                ) : (
                  <span>{placeholder}</span>
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar..." />
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </FormField>
  )
}