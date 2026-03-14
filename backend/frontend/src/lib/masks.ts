/**
 * Máscaras para formatação de campos
 */
export const masks = {
  /**
   * CPF: 000.000.000-00
   */
  cpf: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  },

  /**
   * CNPJ: 00.000.000/0000-00
   */
  cnpj: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18)
  },

  /**
   * CPF ou CNPJ (auto-detecção)
   */
  cpfCnpj: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 11) {
      return masks.cpf(value)
    }
    
    return masks.cnpj(value)
  },

  /**
   * Telefone: (00) 0000-0000 ou (00) 00000-0000
   */
  phone: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    
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
   * Celular: (00) 00000-0000
   */
  mobile: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  },

  /**
   * Telefone fixo: (00) 0000-0000
   */
  landline: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14)
  },

  /**
   * CEP: 00000-000
   */
  cep: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9)
  },

  /**
   * Data: 00/00/0000
   */
  date: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 10)
  },

  /**
   * Data com hora: 00/00/0000 00:00
   */
  dateTime: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{2})(\d)/, '$1:$2')
      .slice(0, 16)
  },

  /**
   * Hora: 00:00
   */
  time: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1:$2')
      .slice(0, 5)
  },

  /**
   * Moeda: 1.234,56
   */
  currency: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length === 0) return ''
    
    const integer = numbers.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const decimal = numbers.slice(-2)
    
    if (numbers.length <= 2) {
      return `0,${numbers.padStart(2, '0')}`
    }
    
    return `${integer},${decimal}`
  },

  /**
   * Número com milhar: 1.234
   */
  number: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  },

  /**
   * Porcentagem: 12,34%
   */
  percent: (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length === 0) return ''
    
    if (numbers.length <= 2) {
      return `${numbers}%`
    }
    
    const integer = numbers.slice(0, -2)
    const decimal = numbers.slice(-2)
    
    return `${integer},${decimal}%`
  },

  /**
   * Placa de veículo: ABC-1234
   */
  licensePlate: (value: string): string => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/([A-Z]{3})(\d)/, '$1-$2')
      .slice(0, 8)
  },

  /**
   * Placa Mercosul: ABC1D23
   */
  mercosulPlate: (value: string): string => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/([A-Z]{3})(\d)([A-Z])(\d{2})/, '$1$2$3$4')
      .slice(0, 7)
  },

  /**
   * Cartão de crédito: 0000 0000 0000 0000
   */
  creditCard: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .slice(0, 19)
  },

  /**
   * Renavam: 00000000000
   */
  renavam: (value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{11})/, '$1')
      .slice(0, 11)
  },

  /**
   * Chassi: 17 caracteres
   */
  chassis: (value: string): string => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 17)
  },

  /**
   * Código de barras (apenas números)
   */
  barcode: (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 48)
  },

  /**
   * Apenas números
   */
  numbers: (value: string): string => {
    return value.replace(/\D/g, '')
  },

  /**
   * Apenas letras
   */
  letters: (value: string): string => {
    return value.replace(/[^A-Za-zÀ-ÿ\s]/g, '')
  },

  /**
   * Apenas letras e números
   */
  alphanumeric: (value: string): string => {
    return value.replace(/[^A-Za-z0-9À-ÿ\s]/g, '')
  },
}

/**
 * Remove máscara de um valor
 */
export const unmask = (value: string): string => {
  return value.replace(/\D/g, '')
}

/**
 * Aplica máscara baseada no tipo
 */
export const applyMask = (value: string, type: keyof typeof masks): string => {
  return masks[type](value)
}

export default masks