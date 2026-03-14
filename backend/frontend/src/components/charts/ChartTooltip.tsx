import React from 'react'
import { cn } from '@/lib/utils'

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  valueFormatter?: (value: any) => string
  labelFormatter?: (label: string) => string
  className?: string
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => value?.toString() || '',
  labelFormatter = (label) => label,
  className
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "bg-background border rounded-lg shadow-lg p-3",
      className
    )}>
      <p className="text-sm font-medium mb-2">
        {labelFormatter(label || '')}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between text-sm">
            <div className="flex items-center mr-4">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color || entry.stroke }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-medium ml-2">
              {valueFormatter(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}