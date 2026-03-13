import React from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn } from '@/lib/utils'

interface ToolbarAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  disabled?: boolean
}

interface FilterOption {
  value: string
  label: string
}

interface AdminToolbarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  filters?: Array<{
    id: string
    placeholder: string
    options: FilterOption[]
    value: string
    onChange: (value: string) => void
  }>
  actions?: ToolbarAction[]
  className?: string
}

export function AdminToolbar({
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  onSearchSubmit,
  filters,
  actions,
  className
}: AdminToolbarProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {/* Search */}
      {onSearchChange && (
        <div className="flex-1 flex items-center space-x-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit?.()}
            className="flex-1"
          />
          {onSearchSubmit && (
            <Button variant="outline" onClick={onSearchSubmit}>
              Buscar
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.id}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}