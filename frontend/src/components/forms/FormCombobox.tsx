'use client'

import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import { FormField } from './FormField'
import { api } from '@/lib/api'
import { useDebounce } from '@/components/hooks/useDebounce'

interface Option {
  value: string
  label: string
}

interface FormComboboxProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  options?: Option[]
  endpoint?: string
  searchParam?: string
  valueKey?: string
  labelKey?: string
}

export function FormCombobox({
  name,
  label,
  description,
  placeholder = 'Selecione...',
  required,
  disabled,
  className,
  options: staticOptions,
  endpoint,
  searchParam = 'search',
  valueKey = 'id',
  labelKey = 'nome'
}: FormComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<Option[]>(staticOptions || [])
  const [loading, setLoading] = useState(false)
  
  const { setValue } = useFormContext()
  const debouncedSearch = useDebounce(search, 300)

  // Buscar opções da API
  React.useEffect(() => {
    if (endpoint && debouncedSearch !== undefined) {
      carregarOpcoes()
    }
  }, [debouncedSearch, endpoint])

  const carregarOpcoes = async () => {
    if (!endpoint) return

    try {
      setLoading(true)
      const response = await api.get(endpoint, {
        params: {
          [searchParam]: debouncedSearch || undefined,
          limit: 20
        }
      })

      const data = response.data.data || response.data
      const mappedOptions = data.map((item: any) => ({
        value: String(item[valueKey]),
        label: item[labelKey]
      }))

      setOptions(mappedOptions)
    } catch (error) {
      console.error('Erro ao carregar opções:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormField
      name={name}
      label={label}
      description={description}
      required={required}
    >
      {(field) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'w-full justify-between',
                !field.value && 'text-muted-foreground',
                className
              )}
              disabled={disabled}
            >
              {field.value
                ? options.find((option) => option.value === field.value)?.label
                : placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder={`Buscar...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <CommandEmpty>
                {loading ? 'Carregando...' : 'Nenhum resultado encontrado.'}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      setValue(name, option.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        field.value === option.value ? 'opacity-100' : 'opacity-0'
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