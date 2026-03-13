/**
 * Utilitários para gerenciamento de storage (localStorage/sessionStorage)
 */

export type StorageType = 'local' | 'session'

export interface StorageOptions {
  type?: StorageType
  prefix?: string
  expiry?: number // tempo em milissegundos
}

const DEFAULT_PREFIX = '@iho:'

class Storage {
  private type: StorageType
  private prefix: string
  private storage: Storage | null

  constructor(options: StorageOptions = {}) {
    this.type = options.type || 'local'
    this.prefix = options.prefix || DEFAULT_PREFIX
    
    if (typeof window !== 'undefined') {
      this.storage = this.type === 'local' ? window.localStorage : window.sessionStorage
    } else {
      this.storage = null
    }
  }

  /**
   * Gera chave com prefixo
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * Verifica se storage está disponível
   */
  private isAvailable(): boolean {
    return this.storage !== null
  }

  /**
   * Salva um valor
   */
  set<T>(key: string, value: T, expiry?: number): void {
    if (!this.isAvailable()) return

    const data = {
      value,
      timestamp: Date.now(),
      expiry: expiry || null,
    }

    try {
      this.storage!.setItem(this.getKey(key), JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar no storage:', error)
    }
  }

  /**
   * Obtém um valor
   */
  get<T>(key: string): T | null {
    if (!this.isAvailable()) return null

    try {
      const item = this.storage!.getItem(this.getKey(key))
      if (!item) return null

      const data = JSON.parse(item)

      // Verificar expiração
      if (data.expiry && Date.now() - data.timestamp > data.expiry) {
        this.remove(key)
        return null
      }

      return data.value
    } catch (error) {
      console.error('Erro ao ler do storage:', error)
      return null
    }
  }

  /**
   * Remove um valor
   */
  remove(key: string): void {
    if (!this.isAvailable()) return
    this.storage!.removeItem(this.getKey(key))
  }

  /**
   * Limpa todos os valores com o prefixo
   */
  clear(): void {
    if (!this.isAvailable()) return

    const keysToRemove: string[] = []
    
    for (let i = 0; i < this.storage!.length; i++) {
      const key = this.storage!.key(i)
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => this.storage!.removeItem(key))
  }

  /**
   * Verifica se uma chave existe
   */
  has(key: string): boolean {
    if (!this.isAvailable()) return false
    return this.storage!.getItem(this.getKey(key)) !== null
  }

  /**
   * Obtém todas as chaves
   */
  keys(): string[] {
    if (!this.isAvailable()) return []

    const keys: string[] = []
    
    for (let i = 0; i < this.storage!.length; i++) {
      const key = this.storage!.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''))
      }
    }

    return keys
  }

  /**
   * Obtém todos os valores
   */
  getAll<T>(): Record<string, T> {
    if (!this.isAvailable()) return {}

    const result: Record<string, T> = {}
    const keys = this.keys()

    keys.forEach(key => {
      const value = this.get<T>(key)
      if (value !== null) {
        result[key] = value
      }
    })

    return result
  }

  /**
   * Obtém tamanho total usado (em bytes aproximados)
   */
  getSize(): number {
    if (!this.isAvailable()) return 0

    let total = 0
    const keys = this.keys()

    keys.forEach(key => {
      const value = this.storage!.getItem(this.getKey(key))
      if (value) {
        total += value.length * 2 // aproximação: 2 bytes por caractere
      }
    })

    return total
  }
}

// Storages específicos
export const localStorage = new Storage({ type: 'local' })
export const sessionStorage = new Storage({ type: 'session' })

// Storages com prefixos específicos
export const authStorage = new Storage({ type: 'local', prefix: '@iho:auth:' })
export const userStorage = new Storage({ type: 'local', prefix: '@iho:user:' })
export const settingsStorage = new Storage({ type: 'local', prefix: '@iho:settings:' })
export const cacheStorage = new Storage({ type: 'local', prefix: '@iho:cache:' })
export const tempStorage = new Storage({ type: 'session', prefix: '@iho:temp:' })

export default Storage