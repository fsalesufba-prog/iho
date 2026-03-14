import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes CSS com suporte a Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data e hora para o padrão brasileiro
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formata uma data para o padrão brasileiro
 */
export function formatDate(date: Date | string | number | null | undefined, format: string = 'short'): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  const formats = {
    short: d.toLocaleDateString('pt-BR'),
    long: d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    full: d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  if (format in formats) {
    return (formats as Record<string, string>)[format]
  }

  // Handle date-fns style format strings (e.g. 'dd/MM/yyyy HH:mm')
  const pad = (n: number) => String(n).padStart(2, '0')
  return format
    .replace('dd', pad(d.getDate()))
    .replace('MM', pad(d.getMonth() + 1))
    .replace('yyyy', String(d.getFullYear()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()))
}

/**
 * Formata um valor monetário
 */
export function formatCurrency(value: number, currency: 'BRL' | 'USD' | 'EUR' = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency
  }).format(value)
}

/**
 * Formata um número com separadores de milhar
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Formata uma porcentagem
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Trunca um texto com ellipsis
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Gera um slug a partir de um texto
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Capitaliza a primeira letra de cada palavra
 */
export function capitalize(text: string): string {
  return text.replace(/\b\w/g, char => char.toUpperCase())
}

/**
 * Converte texto para título (primeira letra maiúscula)
 */
export function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
}

/**
 * Remove acentos de uma string
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Verifica se um valor está vazio (null, undefined, string vazia, array vazio, objeto vazio)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Remove valores vazios de um objeto
 */
export function removeEmpty(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => !isEmpty(v))
  )
}

/**
 * Agrupa um array por uma chave
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    result[groupKey] = result[groupKey] || []
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Ordena um array por uma chave
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filtra um array por termo de busca
 */
export function filterBy<T>(
  array: T[],
  searchTerm: string,
  keys: (keyof T)[]
): T[] {
  if (!searchTerm) return array
  
  const term = searchTerm.toLowerCase()
  return array.filter(item =>
    keys.some(key => {
      const value = item[key]
      return value && String(value).toLowerCase().includes(term)
    })
  )
}

/**
 * Pagina um array
 */
export function paginate<T>(
  array: T[],
  page: number = 1,
  perPage: number = 10
): { data: T[]; total: number; pages: number } {
  const start = (page - 1) * perPage
  const end = start + perPage
  
  return {
    data: array.slice(start, end),
    total: array.length,
    pages: Math.ceil(array.length / perPage)
  }
}

/**
 * Gera um ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Deep clone de objeto
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Comparação profunda de objetos
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false
  if (obj1 === null || obj2 === null) return false
  
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) return false
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }
  
  return true
}

/**
 * Converte objeto para query string
 */
export function toQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Extrai parâmetros de query string
 */
export function fromQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}

/**
 * Calcula idade a partir de data de nascimento
 */
export function calculateAge(birthDate: Date | string | number): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Retorna a cor baseada no status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ativo: 'text-green-600 bg-green-100',
    inativo: 'text-gray-600 bg-gray-100',
    pendente: 'text-yellow-600 bg-yellow-100',
    atrasado: 'text-red-600 bg-red-100',
    cancelado: 'text-red-600 bg-red-100',
    concluido: 'text-green-600 bg-green-100',
    aprovado: 'text-green-600 bg-green-100',
    rejeitado: 'text-red-600 bg-red-100',
    em_andamento: 'text-blue-600 bg-blue-100',
    programado: 'text-purple-600 bg-purple-100',
  }
  
  return colors[status.toLowerCase()] || 'text-gray-600 bg-gray-100'
}

/**
 * Retorna o ícone baseado no tipo de arquivo
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '📷'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return '🗜️'
  return '📁'
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`
}

/**
 * Obtém iniciais de um nome
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength)
}

/**
 * Mascara CPF
 */
export function maskCPF(cpf: string): string {
  return cpf
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

/**
 * Mascara CNPJ
 */
export function maskCNPJ(cnpj: string): string {
  return cnpj
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18)
}

/**
 * Mascara telefone
 */
export function maskPhone(phone: string): string {
  const numbers = phone.replace(/\D/g, '')
  
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14)
  } else {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }
}

/**
 * Mascara CEP
 */
export function maskCEP(cep: string): string {
  return cep
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '')
  
  if (numbers.length !== 11) return false
  if (/^(\d)\1{10}$/.test(numbers)) return false
  
  let sum = 0
  let remainder
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i)
  }
  
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(9, 10))) return false
  
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i)
  }
  
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(numbers.substring(10, 11))) return false
  
  return true
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '')
  
  if (numbers.length !== 14) return false
  if (/^(\d)\1{13}$/.test(numbers)) return false
  
  // Validação do primeiro dígito
  let length = numbers.length - 2
  let numbersWithoutDigits = numbers.substring(0, length)
  const digits = numbers.substring(length)
  let sum = 0
  let pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbersWithoutDigits.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  // Validação do segundo dígito
  length = numbers.length - 1
  numbersWithoutDigits = numbers.substring(0, length)
  sum = 0
  pos = length - 7
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbersWithoutDigits.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida telefone
 */
export function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '')
  return numbers.length >= 10 && numbers.length <= 11
}

/**
 * Valida CEP
 */
export function isValidCEP(cep: string): boolean {
  const numbers = cep.replace(/\D/g, '')
  return numbers.length === 8
}

/**
 * Converte número por extenso (valor monetário)
 */
export function numberToWords(value: number): string {
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const teens = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']
  
  if (value === 0) return 'zero'
  if (value === 1) return 'um'
  if (value === 100) return 'cem'
  
  const integer = Math.floor(value)
  const decimal = Math.round((value - integer) * 100)
  
  function convertGroup(n: number): string {
    if (n === 0) return ''
    
    const hundred = Math.floor(n / 100)
    const ten = Math.floor((n % 100) / 10)
    const unit = n % 10
    
    let result = ''
    
    if (hundred > 0) {
      result += hundreds[hundred] + ' '
    }
    
    if (ten === 1) {
      result += teens[unit] + ' '
    } else {
      if (ten > 1) {
        result += tens[ten] + ' '
        if (unit > 0) {
          result += 'e ' + units[unit] + ' '
        }
      } else if (unit > 0) {
        result += units[unit] + ' '
      }
    }
    
    return result
  }
  
  let result = ''
  
  if (integer >= 1000000) {
    const millions = Math.floor(integer / 1000000)
    result += convertGroup(millions) + (millions === 1 ? 'milhão ' : 'milhões ')
  }
  
  const thousands = Math.floor((integer % 1000000) / 1000)
  if (thousands > 0) {
    if (thousands === 1) {
      result += 'mil '
    } else {
      result += convertGroup(thousands) + 'mil '
    }
  }
  
  const remainder = integer % 1000
  if (remainder > 0) {
    result += convertGroup(remainder)
  }
  
  result = result.trim()
  
  if (decimal > 0) {
    result += ' reais e ' + convertGroup(decimal) + 'centavos'
  } else {
    result += ' reais'
  }
  
  return result.trim()
}

/**
 * Formata um CNPJ
 * @param value - Valor a ser formatado (string ou number)
 * @returns CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(value: string | number): string {
  // Remove tudo que não é número
  const cnpj = String(value).replace(/\D/g, '')
  
  // Aplica a máscara
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

/**
 * Formata um telefone/celular
 * @param value - Valor a ser formatado (string ou number)
 * @returns Telefone formatado ((XX) XXXX-XXXX ou (XX) XXXXX-XXXX)
 */
export function formatPhone(value: string | number): string {
  // Remove tudo que não é número
  const phone = String(value).replace(/\D/g, '')
  
  // Verifica se é celular (11 dígitos) ou fixo (10 dígitos)
  if (phone.length === 11) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }
  
  // Retorna o valor original se não conseguir formatar
  return String(value)
}

/**
 * Formata um CEP
 * @param value - Valor a ser formatado (string ou number)
 * @returns CEP formatado (XXXXX-XXX)
 */
export function formatCEP(value: string | number): string {
  // Remove tudo que não é número
  const cep = String(value).replace(/\D/g, '')
  
  // Aplica a máscara
  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

/**
 * Remove a formatação de um CNPJ
 * @param cnpj - CNPJ formatado
 * @returns Apenas números
 */
export function unformatCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '')
}

/**
 * Remove a formatação de um telefone
 * @param phone - Telefone formatado
 * @returns Apenas números
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Remove a formatação de um CEP
 * @param cep - CEP formatado
 * @returns Apenas números
 */
export function unformatCEP(cep: string): string {
  return cep.replace(/\D/g, '')
}