/**
 * Utilitários para manipulação de datas
 */
import {
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  isBefore,
  isAfter,
  isSameDay,
  isWeekend,
  isWithinInterval,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dateUtils = {
  /**
   * Converte string para Date
   */
  parse: (date: string | Date | number): Date => {
    if (date instanceof Date) return date
    if (typeof date === 'number') return new Date(date)
    return parseISO(date)
  },

  /**
   * Adiciona dias
   */
  addDays: (date: Date | string, days: number): Date => {
    return addDays(dateUtils.parse(date), days)
  },

  /**
   * Adiciona meses
   */
  addMonths: (date: Date | string, months: number): Date => {
    return addMonths(dateUtils.parse(date), months)
  },

  /**
   * Adiciona anos
   */
  addYears: (date: Date | string, years: number): Date => {
    return addYears(dateUtils.parse(date), years)
  },

  /**
   * Subtrai dias
   */
  subDays: (date: Date | string, days: number): Date => {
    return subDays(dateUtils.parse(date), days)
  },

  /**
   * Subtrai meses
   */
  subMonths: (date: Date | string, months: number): Date => {
    return subMonths(dateUtils.parse(date), months)
  },

  /**
   * Subtrai anos
   */
  subYears: (date: Date | string, years: number): Date => {
    return subYears(dateUtils.parse(date), years)
  },

  /**
   * Início do dia
   */
  startOfDay: (date: Date | string): Date => {
    return startOfDay(dateUtils.parse(date))
  },

  /**
   * Fim do dia
   */
  endOfDay: (date: Date | string): Date => {
    return endOfDay(dateUtils.parse(date))
  },

  /**
   * Início da semana
   */
  startOfWeek: (date: Date | string): Date => {
    return startOfWeek(dateUtils.parse(date), { locale: ptBR })
  },

  /**
   * Fim da semana
   */
  endOfWeek: (date: Date | string): Date => {
    return endOfWeek(dateUtils.parse(date), { locale: ptBR })
  },

  /**
   * Início do mês
   */
  startOfMonth: (date: Date | string): Date => {
    return startOfMonth(dateUtils.parse(date))
  },

  /**
   * Fim do mês
   */
  endOfMonth: (date: Date | string): Date => {
    return endOfMonth(dateUtils.parse(date))
  },

  /**
   * Início do ano
   */
  startOfYear: (date: Date | string): Date => {
    return startOfYear(dateUtils.parse(date))
  },

  /**
   * Fim do ano
   */
  endOfYear: (date: Date | string): Date => {
    return endOfYear(dateUtils.parse(date))
  },

  /**
   * Diferença em dias
   */
  diffInDays: (dateLeft: Date | string, dateRight: Date | string): number => {
    return differenceInDays(dateUtils.parse(dateLeft), dateUtils.parse(dateRight))
  },

  /**
   * Diferença em meses
   */
  diffInMonths: (dateLeft: Date | string, dateRight: Date | string): number => {
    return differenceInMonths(dateUtils.parse(dateLeft), dateUtils.parse(dateRight))
  },

  /**
   * Diferença em anos
   */
  diffInYears: (dateLeft: Date | string, dateRight: Date | string): number => {
    return differenceInYears(dateUtils.parse(dateLeft), dateUtils.parse(dateRight))
  },

  /**
   * Verifica se é antes
   */
  isBefore: (date: Date | string, dateToCompare: Date | string): boolean => {
    return isBefore(dateUtils.parse(date), dateUtils.parse(dateToCompare))
  },

  /**
   * Verifica se é depois
   */
  isAfter: (date: Date | string, dateToCompare: Date | string): boolean => {
    return isAfter(dateUtils.parse(date), dateUtils.parse(dateToCompare))
  },

  /**
   * Verifica se é mesmo dia
   */
  isSameDay: (dateLeft: Date | string, dateRight: Date | string): boolean => {
    return isSameDay(dateUtils.parse(dateLeft), dateUtils.parse(dateRight))
  },

  /**
   * Verifica se é fim de semana
   */
  isWeekend: (date: Date | string): boolean => {
    return isWeekend(dateUtils.parse(date))
  },

  /**
   * Verifica se está dentro do intervalo
   */
  isWithinInterval: (
    date: Date | string,
    start: Date | string,
    end: Date | string
  ): boolean => {
    return isWithinInterval(dateUtils.parse(date), {
      start: dateUtils.parse(start),
      end: dateUtils.parse(end),
    })
  },

  /**
   * Obtém idade a partir da data de nascimento
   */
  getAge: (birthDate: Date | string): number => {
    return differenceInYears(new Date(), dateUtils.parse(birthDate))
  },

  /**
   * Formata data para API (YYYY-MM-DD)
   */
  toApiDate: (date: Date | string): string => {
    const d = dateUtils.parse(date)
    return d.toISOString().split('T')[0]
  },

  /**
   * Formata data para API com hora (YYYY-MM-DD HH:mm:ss)
   */
  toApiDateTime: (date: Date | string): string => {
    const d = dateUtils.parse(date)
    return d.toISOString().slice(0, 19).replace('T', ' ')
  },

  /**
   * Obtém primeiro dia do mês atual
   */
  getFirstDayOfMonth: (): Date => {
    return startOfMonth(new Date())
  },

  /**
   * Obtém último dia do mês atual
   */
  getLastDayOfMonth: (): Date => {
    return endOfMonth(new Date())
  },

  /**
   * Obtém primeiro dia do ano atual
   */
  getFirstDayOfYear: (): Date => {
    return startOfYear(new Date())
  },

  /**
   * Obtém último dia do ano atual
   */
  getLastDayOfYear: (): Date => {
    return endOfYear(new Date())
  },

  /**
   * Gera array de datas entre intervalo
   */
  getDateRange: (start: Date | string, end: Date | string): Date[] => {
    const dates: Date[] = []
    let currentDate = dateUtils.parse(start)
    const endDate = dateUtils.parse(end)

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate = addDays(currentDate, 1)
    }

    return dates
  },

  /**
   * Formata para exibição amigável
   */
  formatFriendly: (date: Date | string): string => {
    const d = dateUtils.parse(date)
    const today = new Date()
    const yesterday = subDays(today, 1)
    const tomorrow = addDays(today, 1)

    if (isSameDay(d, today)) return 'Hoje'
    if (isSameDay(d, yesterday)) return 'Ontem'
    if (isSameDay(d, tomorrow)) return 'Amanhã'

    return d.toLocaleDateString('pt-BR')
  },
}

export default dateUtils