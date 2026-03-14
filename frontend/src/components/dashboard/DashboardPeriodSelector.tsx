'use client'

import React, { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'

interface Period {
  value: string
  label: string
  days?: number
}

interface DashboardPeriodSelectorProps {
  value: string
  onChange: (period: string) => void
  periods?: Period[]
  className?: string
  showCustom?: boolean
}

const defaultPeriods: Period[] = [
  { value: 'today', label: 'Hoje', days: 1 },
  { value: 'yesterday', label: 'Ontem', days: 1 },
  { value: 'last7days', label: 'Últimos 7 dias', days: 7 },
  { value: 'last30days', label: 'Últimos 30 dias', days: 30 },
  { value: 'last90days', label: 'Últimos 90 dias', days: 90 },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês passado' },
  { value: 'thisYear', label: 'Este ano' },
  { value: 'lastYear', label: 'Ano passado' },
  { value: 'all', label: 'Todo período' },
]

export function DashboardPeriodSelector({
  value,
  onChange,
  periods = defaultPeriods,
  className,
  showCustom = true
}: DashboardPeriodSelectorProps) {
  const [customRange, setCustomRange] = useState(false)

  const selectedPeriod = periods.find(p => p.value === value)

  if (customRange) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <input
          type="date"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"

        />
        <span>até</span>
        <input
          type="date"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"

        />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCustomRange(false)}
        >
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Calendar className="h-4 w-4" />
          {selectedPeriod?.label || 'Selecionar período'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {periods.map((period) => (
          <DropdownMenuItem
            key={period.value}
            onClick={() => onChange(period.value)}
          >
            {period.label}
          </DropdownMenuItem>
        ))}
        
        {showCustom && (
          <>
            <DropdownMenuItem className="border-t mt-1 pt-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setCustomRange(true)}
              >
                Período personalizado
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Pré-definições comuns
DashboardPeriodSelector.Presets = {
  Today: { value: 'today', label: 'Hoje' },
  Yesterday: { value: 'yesterday', label: 'Ontem' },
  Last7Days: { value: 'last7days', label: 'Últimos 7 dias' },
  Last30Days: { value: 'last30days', label: 'Últimos 30 dias' },
  Last90Days: { value: 'last90days', label: 'Últimos 90 dias' },
  ThisMonth: { value: 'thisMonth', label: 'Este mês' },
  LastMonth: { value: 'lastMonth', label: 'Mês passado' },
  ThisYear: { value: 'thisYear', label: 'Este ano' },
  LastYear: { value: 'lastYear', label: 'Ano passado' },
  All: { value: 'all', label: 'Todo período' }
}