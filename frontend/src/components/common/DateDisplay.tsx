import React from 'react'
import { format, formatDistance, formatRelative, isToday, isYesterday, isThisWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateDisplayProps {
  date: Date | string | number
  format?: string
  className?: string
  showIcon?: boolean
  iconPosition?: 'left' | 'right'
  locale?: Locale
}

export function DateDisplay({
  date,
  format: formatStr = 'dd/MM/yyyy',
  className,
  showIcon = false,
  iconPosition = 'left',
  locale = ptBR
}: DateDisplayProps) {
  const dateObj = new Date(date)

  return (
    <span className={cn(
      'inline-flex items-center gap-1',
      className
    )}>
      {showIcon && iconPosition === 'left' && (
        <Calendar className="h-4 w-4 text-muted-foreground" />
      )}
      {format(dateObj, formatStr, { locale })}
      {showIcon && iconPosition === 'right' && (
        <Calendar className="h-4 w-4 text-muted-foreground" />
      )}
    </span>
  )
}

// Data e hora
DateDisplay.DateTime = function DateTimeDisplay({
  date,
  format = 'dd/MM/yyyy HH:mm',
  ...props
}: DateDisplayProps) {
  return <DateDisplay date={date} format={format} {...props} />
}

// Data relativa (ex: "há 2 dias")
DateDisplay.Relative = function RelativeDate({
  date,
  addSuffix = true,
  ...props
}: DateDisplayProps & { addSuffix?: boolean }) {
  const dateObj = new Date(date)

  return (
    <span className={cn('inline-flex items-center gap-1', props.className)}>
      {props.showIcon && <Clock className="h-4 w-4 text-muted-foreground" />}
      {formatDistance(dateObj, new Date(), { 
        addSuffix, 
        locale: props.locale || ptBR 
      })}
    </span>
  )
}

// Data amigável (ex: "hoje", "ontem")
DateDisplay.Friendly = function FriendlyDate({
  date,
  ...props
}: DateDisplayProps) {
  const dateObj = new Date(date)

  let formattedDate
  if (isToday(dateObj)) {
    formattedDate = 'Hoje'
  } else if (isYesterday(dateObj)) {
    formattedDate = 'Ontem'
  } else if (isThisWeek(dateObj)) {
    formattedDate = format(dateObj, 'EEEE', { locale: ptBR })
  } else {
    formattedDate = format(dateObj, "dd 'de' MMMM", { locale: ptBR })
  }

  return (
    <span className={cn('inline-flex items-center gap-1', props.className)}>
      {props.showIcon && <Calendar className="h-4 w-4 text-muted-foreground" />}
      {formattedDate}
    </span>
  )
}

// Range de datas
DateDisplay.Range = function DateRange({
  startDate,
  endDate,
  separator = 'até',
  format = 'dd/MM/yyyy',
  className,
  locale = ptBR
}: {
  startDate: Date | string | number
  endDate: Date | string | number
  separator?: string
  format?: string
  className?: string
  locale?: Locale
}) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return (
    <span className={className}>
      {format(start, format, { locale })} {separator} {format(end, format, { locale })}
    </span>
  )
}