import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'

interface OeeCardProps {
  label: string
  value: number
  meta: number
  color: string
  className?: string
}

export function OeeCard({
  label,
  value,
  meta,
  color,
  className
}: OeeCardProps) {
  const percentage = (value / meta) * 100

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <div className="flex items-end justify-between mb-2">
          <p className="text-2xl font-bold" style={{ color }}>
            {value.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">
            Meta: {meta}%
          </p>
        </div>
        <Progress 
          value={percentage} 
          className="h-2"
          indicatorClassName={percentage >= 100 ? 'bg-green-500' : ''}
          style={{ '--progress-color': color } as any}
        />
      </CardContent>
    </Card>
  )
}