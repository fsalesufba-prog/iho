import React from 'react'
import {
  format,
  formatDistance,
  isToday,
  isYesterday,
  isThisWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateDisplayProps {
  date: Date | string | number
<<<<<<< HEAD
  format?: string
=======
  dateFormat?: string  // Renomeado de 'format' para 'dateFormat'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  className?: string
  showIcon?: boolean
  iconPosition?: 'left' | 'right'
  locale?: Locale
}

export function DateDisplay({
  date,
<<<<<<< HEAD
  format: formatStr = 'dd/MM/yyyy',
=======
  dateFormat = 'dd/MM/yyyy',  // Nome alterado
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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
<<<<<<< HEAD
      {format(dateObj, formatStr, { locale })}
=======
      {format(dateObj, dateFormat, { locale })}  {/* Agora funciona */}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      {showIcon && iconPosition === 'right' && (
        <Calendar className="h-4 w-4 text-muted-foreground" />
      )}
    </span>
  )
}

// Data e hora
DateDisplay.DateTime = function DateTimeDisplay({
  date,
<<<<<<< HEAD
  format = 'dd/MM/yyyy HH:mm',
  ...props
}: DateDisplayProps) {
  return <DateDisplay date={date} format={format} {...props} />
=======
  dateFormat = 'dd/MM/yyyy HH:mm',  // Nome alterado
  ...props
}: DateDisplayProps) {
  return <DateDisplay date={date} dateFormat={dateFormat} {...props} />
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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
<<<<<<< HEAD
  format = 'dd/MM/yyyy',
=======
  dateFormat = 'dd/MM/yyyy',  // Nome alterado
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  className,
  locale = ptBR
}: {
  startDate: Date | string | number
  endDate: Date | string | number
  separator?: string
<<<<<<< HEAD
  format?: string
=======
  dateFormat?: string
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  className?: string
  locale?: Locale
}) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return (
    <span className={className}>
<<<<<<< HEAD
      {format(start, format, { locale })} {separator} {format(end, format, { locale })}
=======
      {format(start, dateFormat, { locale })} {separator} {format(end, dateFormat, { locale })}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    </span>
  )
}