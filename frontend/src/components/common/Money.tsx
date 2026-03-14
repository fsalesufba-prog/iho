import React from 'react'
import { cn } from '@/lib/utils'

interface MoneyProps {
  value: number
  currency?: 'BRL' | 'USD' | 'EUR'
  locale?: string
  showSymbol?: boolean
  showCents?: boolean
  className?: string
  variant?: 'default' | 'positive' | 'negative' | 'neutral'
}

const variants = {
  default: '',
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-yellow-600'
}

export function Money({
  value,
  currency = 'BRL',
  locale = 'pt-BR',
  showSymbol = true,
  showCents = true,
  className,
  variant = 'default'
}: MoneyProps) {
  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  })

  const formattedValue = formatter.format(value)

  return (
    <span className={cn(variants[variant], className)}>
      {formattedValue}
    </span>
  )
}

// Valor abreviado (ex: R$ 1,5k)
Money.Compact = function CompactMoney({
  value,
  ...props
}: MoneyProps) {
  const formatter = new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })

  const formattedValue = formatter.format(value)

  return (
    <span className={cn(variants[props.variant || 'default'], props.className)}>
      {props.showSymbol ? `R$ ${formattedValue}` : formattedValue}
    </span>
  )
}

// Variação percentual
Money.Change = function MoneyChange({
  value,
  percentage,
  showIcon = true,
  className
}: {
  value: number
  percentage?: number
  showIcon?: boolean
  className?: string
}) {
  const isPositive = value > 0
  const isNegative = value < 0

  return (
    <span className={cn(
      'inline-flex items-center',
      isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-400',
      className
    )}>
      {showIcon && (
        <span className="mr-1">
          {isPositive ? '↑' : isNegative ? '↓' : '→'}
        </span>
      )}
      <Money value={Math.abs(value)} showCents={false} />
      {percentage !== undefined && (
        <span className="ml-1 text-xs">
          ({percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%)
        </span>
      )}
    </span>
  )
}

// Comparação de valores
Money.Comparison = function MoneyComparison({
  current,
  previous,
  className
}: {
  current: number
  previous: number
  className?: string
}) {
  const difference = current - previous
  const percentage = previous !== 0 ? (difference / previous) * 100 : 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Money value={current} />
      <Money.Change value={difference} percentage={percentage} />
    </div>
  )
}