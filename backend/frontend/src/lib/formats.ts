import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formatadores de data
 */
export const dateFormats = {
  /**
   * Formato: DD/MM/YYYY
   */
  short: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, 'dd/MM/yyyy', { locale: ptBR })
  },

  /**
   * Formato: DD/MM/YYYY HH:mm
   */
  long: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, 'dd/MM/yyyy HH:mm', { locale: ptBR })
  },

  /**
   * Formato: DD/MM/YYYY HH:mm:ss
   */
  full: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
  },

  /**
   * Formato: DD de MMMM de YYYY
   */
  extended: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  },

  /**
   * Formato: DD de MMMM de YYYY, HH:mm
   */
  extendedWithTime: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })
  },

  /**
   * Distância relativa (ex: "há 2 dias")
   */
  relative: (date: Date | string | number, addSuffix: boolean = true) => {
    const d = new Date(date)
    return formatDistanceToNow(d, { addSuffix, locale: ptBR })
  },

  /**
   * Data relativa (ex: "hoje", "ontem", "segunda-feira")
   */
  friendly: (date: Date | string | number) => {
    const d = new Date(date)
    
    if (isToday(d)) return 'Hoje'
    if (isYesterday(d)) return 'Ontem'
    if (isThisWeek(d)) return format(d, 'EEEE', { locale: ptBR })
    
    return format(d, "dd 'de' MMMM", { locale: ptBR })
  },

  /**
   * Formato ISO (YYYY-MM-DD)
   */
  iso: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, 'yyyy-MM-dd')
  },

  /**
   * Formato ISO com hora (YYYY-MM-DDTHH:mm)
   */
  isoWithTime: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, "yyyy-MM-dd'T'HH:mm")
  },

  /**
   * Apenas hora (HH:mm)
   */
  time: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, 'HH:mm', { locale: ptBR })
  },

  /**
   * Apenas hora com segundos (HH:mm:ss)
   */
  timeWithSeconds: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, 'HH:mm:ss', { locale: ptBR })
  },

  /**
   * Mês e ano (MMMM/YYYY)
   */
  monthYear: (date: Date | string | number) => {
    const d = new Date(date)
    return format(d, 'MMMM/yyyy', { locale: ptBR })
  },

  /**
   * Semestre
   */
  semester: (date: Date | string | number) => {
    const d = new Date(date)
    const month = d.getMonth()
    const year = d.getFullYear()
    const semester = month < 6 ? 1 : 2
    return `${semester}º Semestre/${year}`
  },

  /**
   * Trimestre
   */
  quarter: (date: Date | string | number) => {
    const d = new Date(date)
    const month = d.getMonth()
    const year = d.getFullYear()
    const quarter = Math.floor(month / 3) + 1
    return `${quarter}º Trimestre/${year}`
  },
}

/**
 * Formatadores de número
 */
export const numberFormats = {
  /**
   * Formato padrão com separadores de milhar
   */
  default: (value: number, decimals: number = 2) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  },

  /**
   * Formato sem decimais
   */
  integer: (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  },

  /**
   * Formato compacto (K, M, B)
   */
  compact: (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toString()
  },

  /**
   * Formato de porcentagem
   */
  percent: (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`
  },

  /**
   * Formato de moeda
   */
  currency: (value: number, currency: 'BRL' | 'USD' | 'EUR' = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value)
  },

  /**
   * Formato de peso
   */
  weight: (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} t`
    }
    return `${value} kg`
  },

  /**
   * Formato de distância
   */
  distance: (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} km`
    }
    return `${value} m`
  },

  /**
   * Formato de volume
   */
  volume: (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} m³`
    }
    return `${value} L`
  },

  /**
   * Formato de tempo (horas)
   */
  hours: (value: number) => {
    const hours = Math.floor(value)
    const minutes = Math.round((value - hours) * 60)
    
    if (minutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${minutes}min`
  },

  /**
   * Formato de tempo (dias)
   */
  days: (value: number) => {
    if (value >= 30) {
      const months = Math.floor(value / 30)
      const days = value % 30
      return `${months}m ${days}d`
    }
    return `${value}d`
  },
}

/**
 * Formatadores de texto
 */
export const textFormats = {
  /**
   * Capitaliza primeira letra
   */
  capitalize: (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  /**
   * Capitaliza todas as palavras
   */
  titleCase: (text: string) => {
    return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
  },

  /**
   * Converte para maiúsculas
   */
  upperCase: (text: string) => {
    return text.toUpperCase()
  },

  /**
   * Converte para minúsculas
   */
  lowerCase: (text: string) => {
    return text.toLowerCase()
  },

  /**
   * Trunca texto com ellipsis
   */
  truncate: (text: string, length: number = 50) => {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  },

  /**
   * Remove acentos
   */
  removeAccents: (text: string) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  },

  /**
   * Converte para slug
   */
  slugify: (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  },

  /**
   * Extrai iniciais
   */
  initials: (text: string, maxLength: number = 2) => {
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, maxLength)
  },

  /**
   * Formata CPF
   */
  cpf: (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  },

  /**
   * Formata CNPJ
   */
  cnpj: (cnpj: string) => {
    return cnpj
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18)
  },

  /**
   * Formata telefone
   */
  phone: (phone: string) => {
    const numbers = phone.replace(/\D/g, '')
    
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14)
    }
    
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  },

  /**
   * Formata CEP
   */
  cep: (cep: string) => {
    return cep
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9)
  },
}

/**
 * Formatadores de arquivo
 */
export const fileFormats = {
  /**
   * Formata tamanho de arquivo
   */
  size: (bytes: number) => {
    if (bytes === 0) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
  },

  /**
   * Obtém extensão do arquivo
   */
  extension: (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || ''
  },

  /**
   * Obtém nome sem extensão
   */
  nameWithoutExtension: (filename: string) => {
    return filename.replace(/\.[^/.]+$/, '')
  },

  /**
   * Verifica se é imagem
   */
  isImage: (mimeType: string) => {
    return mimeType.startsWith('image/')
  },

  /**
   * Verifica se é vídeo
   */
  isVideo: (mimeType: string) => {
    return mimeType.startsWith('video/')
  },

  /**
   * Verifica se é áudio
   */
  isAudio: (mimeType: string) => {
    return mimeType.startsWith('audio/')
  },

  /**
   * Verifica se é PDF
   */
  isPDF: (mimeType: string) => {
    return mimeType === 'application/pdf'
  },

  /**
   * Verifica se é documento do Word
   */
  isWord: (mimeType: string) => {
    return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].includes(mimeType)
  },

  /**
   * Verifica se é planilha Excel
   */
  isExcel: (mimeType: string) => {
    return [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ].includes(mimeType)
  },

  /**
   * Verifica se é apresentação PowerPoint
   */
  isPowerPoint: (mimeType: string) => {
    return [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ].includes(mimeType)
  },

  /**
   * Verifica se é arquivo compactado
   */
  isArchive: (mimeType: string) => {
    return [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-tar',
      'application/gzip',
    ].includes(mimeType)
  },
}