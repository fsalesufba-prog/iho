/**
 * Validadores para campos comuns
 */
export const validators = {
  /**
   * Valida e-mail
   */
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  /**
   * Valida CPF
   */
  cpf: (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '')
    
    if (numbers.length !== 11) return false
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    // Validação do primeiro dígito
    let sum = 0
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (11 - i)
    }
    
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.substring(9, 10))) return false
    
    // Validação do segundo dígito
    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (12 - i)
    }
    
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.substring(10, 11))) return false
    
    return true
  },

  /**
   * Valida CNPJ
   */
  cnpj: (cnpj: string): boolean => {
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
  },

  /**
   * Valida CPF ou CNPJ
   */
  cpfCnpj: (value: string): boolean => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length === 11) {
      return validators.cpf(value)
    }
    
    if (numbers.length === 14) {
      return validators.cnpj(value)
    }
    
    return false
  },

  /**
   * Valida telefone
   */
  phone: (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '')
    return numbers.length >= 10 && numbers.length <= 11
  },

  /**
   * Valida celular
   */
  mobile: (mobile: string): boolean => {
    const numbers = mobile.replace(/\D/g, '')
    return numbers.length === 11
  },

  /**
   * Valida telefone fixo
   */
  landline: (landline: string): boolean => {
    const numbers = landline.replace(/\D/g, '')
    return numbers.length === 10
  },

  /**
   * Valida CEP
   */
  cep: (cep: string): boolean => {
    const numbers = cep.replace(/\D/g, '')
    return numbers.length === 8
  },

  /**
   * Valida data
   */
  date: (date: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!regex.test(date)) return false
    
    const [day, month, year] = date.split('/').map(Number)
    
    if (month < 1 || month > 12) return false
    
    const daysInMonth = new Date(year, month, 0).getDate()
    if (day < 1 || day > daysInMonth) return false
    
    return true
  },

  /**
   * Valida hora
   */
  time: (time: string): boolean => {
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    return regex.test(time)
  },

  /**
   * Valida URL
   */
  url: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Valida IPv4
   */
  ipv4: (ip: string): boolean => {
    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    return regex.test(ip)
  },

  /**
   * Valida IPv6
   */
  ipv6: (ip: string): boolean => {
    const regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
    return regex.test(ip)
  },

  /**
   * Valida número de cartão de crédito (algoritmo de Luhn)
   */
  creditCard: (cardNumber: string): boolean => {
    const numbers = cardNumber.replace(/\D/g, '')
    
    if (numbers.length < 13 || numbers.length > 19) return false
    
    let sum = 0
    let double = false
    
    for (let i = numbers.length - 1; i >= 0; i--) {
      let digit = parseInt(numbers.charAt(i))
      
      if (double) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      
      sum += digit
      double = !double
    }
    
    return sum % 10 === 0
  },

  /**
   * Valida placa de veículo (formato antigo)
   */
  licensePlate: (plate: string): boolean => {
    const regex = /^[A-Z]{3}-\d{4}$/
    return regex.test(plate.toUpperCase())
  },

  /**
   * Valida placa Mercosul
   */
  mercosulPlate: (plate: string): boolean => {
    const regex = /^[A-Z]{3}\d[A-Z]\d{2}$/
    return regex.test(plate.toUpperCase())
  },

  /**
   * Valida se é um número
   */
  number: (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value)
  },

  /**
   * Valida se é um número inteiro
   */
  integer: (value: any): boolean => {
    return Number.isInteger(Number(value))
  },

  /**
   * Valida se é um número positivo
   */
  positive: (value: any): boolean => {
    return validators.number(value) && Number(value) > 0
  },

  /**
   * Valida se é um número negativo
   */
  negative: (value: any): boolean => {
    return validators.number(value) && Number(value) < 0
  },

  /**
   * Valida se está entre mínimo e máximo
   */
  between: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max
  },

  /**
   * Valida tamanho mínimo de string
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min
  },

  /**
   * Valida tamanho máximo de string
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max
  },

  /**
   * Valida se string tem tamanho exato
   */
  exactLength: (value: string, length: number): boolean => {
    return value.length === length
  },

  /**
   * Valida se contém apenas letras
   */
  letters: (value: string): boolean => {
    return /^[A-Za-zÀ-ÿ\s]+$/.test(value)
  },

  /**
   * Valida se contém apenas números
   */
  numbers: (value: string): boolean => {
    return /^\d+$/.test(value)
  },

  /**
   * Valida se contém apenas letras e números
   */
  alphanumeric: (value: string): boolean => {
    return /^[A-Za-z0-9]+$/.test(value)
  },

  /**
   * Valida se é uma senha forte (mín. 8 chars, maiúscula, minúscula, número, especial)
   */
  strongPassword: (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return regex.test(password)
  },

  /**
   * Valida se é uma senha média (mín. 6 chars, maiúscula, minúscula, número)
   */
  mediumPassword: (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/
    return regex.test(password)
  },
}

export default validators