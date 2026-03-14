import React from 'react'
import { cn } from '@/lib/utils'

interface ChartLegendProps {
  payload?: any[]
  className?: string
}

export function ChartLegend({ payload, className }: ChartLegendProps) {
  if (!payload || payload.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-4", className)}>
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color || entry.payload?.fill }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}