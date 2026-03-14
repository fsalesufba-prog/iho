'use client'

import React, { useState } from 'react'
import { Filter, X, Search, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  label: string
  type: 'select' | 'search' | 'date' | 'boolean'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

interface DashboardFiltersProps {
  filters: FilterOption[]
  values: Record<string, any>
  onChange: (key: string, value: any) => void
  onClear: () => void
  onApply?: () => void
  className?: string
  showApplyButton?: boolean
}

export function DashboardFilters({
  filters,
  values,
  onChange,
  onClear,
  onApply,
  className,
  showApplyButton = false
}: DashboardFiltersProps) {
  const [open, setOpen] = useState(false)

  const activeFiltersCount = Object.values(values).filter(v => 
    v !== undefined && v !== '' && v !== null
  ).length

  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={values[filter.id] || ''}
            onValueChange={(value) => onChange(filter.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'search':
        return (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={filter.placeholder || `Buscar...`}
              value={values[filter.id] || ''}
              onChange={(e) => onChange(filter.id, e.target.value)}
              className="pl-8"
            />
          </div>
        )

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {values[filter.id] || filter.placeholder || 'Selecionar data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              {/* Implementar calendário aqui */}
              <div className="p-4">Calendário</div>
            </PopoverContent>
          </Popover>
        )

      case 'boolean':
        return (
          <Select
            value={values[filter.id]?.toString() || ''}
            onValueChange={(value) => onChange(filter.id, value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Versão mobile: popover */}
      <div className="md:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros</h4>
                <Button variant="ghost" size="sm" onClick={onClear}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <label className="text-sm font-medium">
                      {filter.label}
                    </label>
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>

              {showApplyButton && (
                <Button 
                  className="w-full" 
                  onClick={() => {
                    onApply?.()
                    setOpen(false)
                  }}
                >
                  Aplicar filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Versão desktop: inline */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {filters.map((filter) => (
          <div key={filter.id} className="w-48">
            {renderFilter(filter)}
          </div>
        ))}

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}

        {showApplyButton && (
          <Button onClick={onApply}>
            Aplicar
          </Button>
        )}
      </div>

      {/* Badges dos filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-2 md:mt-0">
          {Object.entries(values).map(([key, value]) => {
            if (!value) return null
            const filter = filters.find(f => f.id === key)
            if (!filter) return null

            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {filter.label}: {value}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onChange(key, undefined)}
                />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}