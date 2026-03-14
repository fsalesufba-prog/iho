'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface EmpresaSelectorProps {
  value?: number
  onChange: (value: number) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

interface Empresa {
  id: number
  nome: string
  cnpj: string
  status: string
}

export function EmpresaSelector({
  value,
  onChange,
  className,
  placeholder = "Selecione uma empresa...",
  disabled = false
}: EmpresaSelectorProps) {
  const [open, setOpen] = useState(false)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    carregarEmpresas()
  }, [search])

  const carregarEmpresas = async () => {
    try {
      setLoading(true)
      const response = await api.get('/empresas', {
        params: {
          search: search || undefined,
          limit: 20
        }
      })
      setEmpresas(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedEmpresa = empresas.find(e => e.id === value)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {value && selectedEmpresa ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {getInitials(selectedEmpresa.nome)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedEmpresa.nome}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar empresa..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {loading ? 'Carregando...' : 'Nenhuma empresa encontrada.'}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {empresas.map((empresa) => (
              <CommandItem
                key={empresa.id}
                value={empresa.nome}
                onSelect={() => {
                  onChange(empresa.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === empresa.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-xs">
                    {getInitials(empresa.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="text-sm">{empresa.nome}</p>
                  <p className="text-xs text-muted-foreground">{empresa.cnpj}</p>
                </div>
                <span className={cn(
                  'ml-2 text-xs',
                  empresa.status === 'ativo' ? 'text-green-600' : 'text-red-600'
                )}>
                  {empresa.status}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Versão múltipla
EmpresaSelector.Multiple = function MultipleEmpresaSelector({
  value = [],
  onChange,
  ...props
}: Omit<EmpresaSelectorProps, 'value' | 'onChange'> & {
  value?: number[]
  onChange: (value: number[]) => void
}) {
  const [selected, setSelected] = useState<number[]>(value)

  const handleSelect = (id: number) => {
    const newSelected = selected.includes(id)
      ? selected.filter(v => v !== id)
      : [...selected, id]
    setSelected(newSelected)
    onChange(newSelected)
  }

  return (
    <div className="space-y-2">
      <EmpresaSelector
        {...props}
        value={selected[0]}
        onChange={handleSelect}
        placeholder="Adicionar empresa..."
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Implementar badges das empresas selecionadas */}
        </div>
      )}
    </div>
  )
}