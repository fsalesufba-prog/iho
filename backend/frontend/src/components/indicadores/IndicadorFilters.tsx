'use client'

import React from 'react'
import { Filter, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  label: string
  type: 'select' | 'date' | 'boolean'
  options?: Array<{ value: string; label: string }>
}

interface IndicadorFiltersProps {
  filters: FilterOption[]
  values: Record<string, any>
  onChange: (key: string, value: any) => void
  onClear: () => void
  className?: string
}

export function IndicadorFilters({
  filters,
  values,
  onChange,
  onClear,
  className
}: IndicadorFiltersProps) {
  const [open, setOpen] = React.useState(false)

  const activeFiltersCount = Object.values(values).filter(v => 
    v !== undefined && v !== '' && v !== null && v !== 'todos'
  ).length

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 px-1 min-w-[20px] flex items-center justify-center"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtrar Indicadores</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onClear}>
                  Limpar
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  {filter.type === 'select' && (
                    <Select
                      value={values[filter.id] || 'todos'}
                      onValueChange={(value) => onChange(filter.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {filter.type === 'date' && (
                    <Select
                      value={values[filter.id] || '30d'}
                      onValueChange={(value) => onChange(filter.id, value)}
                    >
                      <SelectTrigger>
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Últimos 7 dias</SelectItem>
                        <SelectItem value="30d">Últimos 30 dias</SelectItem>
                        <SelectItem value="90d">Últimos 90 dias</SelectItem>
                        <SelectItem value="12m">Últimos 12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}