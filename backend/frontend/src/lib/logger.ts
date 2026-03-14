/**
 * Sistema de logging para a aplicação
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  context?: string
  userId?: number
  sessionId?: string
}

export interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  batchSize?: number
  flushInterval?: number
  includeTimestamp: boolean
  includeContext: boolean
  includeUser: boolean
  includeSession: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  batchSize: 10,
  flushInterval: 5000, // 5 segundos
  includeTimestamp: true,
  includeContext: true,
  includeUser: true,
  includeSession: true,
}

class Logger {
  private config: LoggerConfig
  private logQueue: LogEntry[] = []
  private flushTimer: NodeJS.Timeout | null = null
  private sessionId: string
  private userId?: number
  private context?: string

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.setupFlushTimer()
  }

  /**
   * Gera ID único para a sessão
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15)
  }

  /**
   * Configura timer para envio em lote
   */
  private setupFlushTimer(): void {
    if (this.config.enableRemote && this.config.flushInterval) {
      this.flushTimer = setInterval(() => {
        this.flush()
      }, this.config.flushInterval)
    }
  }

  /**
   * Formata timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString()
  }

  /**
   * Verifica se nível deve ser logado
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  /**
   * Cria entrada de log
   */
  private createEntry(
    level: LogLevel,
    message: string,
    data?: any
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      data: data ? this.sanitizeData(data) : undefined,
    }

    if (this.config.includeContext && this.context) {
      entry.context = this.context
    }

    if (this.config.includeUser && this.userId) {
      entry.userId = this.userId
    }

    if (this.config.includeSession) {
      entry.sessionId = this.sessionId
    }

    return entry
  }

  /**
   * Sanitiza dados para remover informações sensíveis
   */
  private sanitizeData(data: any): any {
    if (!data) return data

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization']
    const sanitized = { ...data }

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj

      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item))
      }

      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          result[key] = '[REDACTED]'
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value)
        } else {
          result[key] = value
        }
      }
      return result
    }

    return sanitizeObject(sanitized)
  }

  /**
   * Log no console
   */
  private consoleLog(entry: LogEntry): void {
    const { level, message, data, ...rest } = entry
    const prefix = `[${level.toUpperCase()}] ${message}`

    switch (level) {
      case 'debug':
        console.debug(prefix, data || '', rest)
        break
      case 'info':
        console.info(prefix, data || '', rest)
        break
      case 'warn':
        console.warn(prefix, data || '', rest)
        break
      case 'error':
        console.error(prefix, data || '', rest)
        break
    }
  }

  /**
   * Envia logs para servidor remoto
   */
  private async remoteLog(entries: LogEntry[]): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: entries }),
        keepalive: true,
      })
    } catch (error) {
      // Fallback para console em caso de erro
      console.error('Falha ao enviar logs remotos:', error)
    }
  }

  /**
   * Adiciona log à fila
   */
  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry)

    if (
      this.config.enableRemote &&
      this.config.batchSize &&
      this.logQueue.length >= this.config.batchSize
    ) {
      this.flush()
    }
  }

  /**
   * Envia logs pendentes
   */
  public async flush(): Promise<void> {
    if (this.logQueue.length === 0) return

    const entries = [...this.logQueue]
    this.logQueue = []

    await this.remoteLog(entries)
  }

  /**
   * Log de debug
   */
  public debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return

    const entry = this.createEntry('debug', message, data)

    if (this.config.enableConsole) {
      this.consoleLog(entry)
    }

    this.addToQueue(entry)
  }

  /**
   * Log de info
   */
  public info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return

    const entry = this.createEntry('info', message, data)

    if (this.config.enableConsole) {
      this.consoleLog(entry)
    }

    this.addToQueue(entry)
  }

  /**
   * Log de warning
   */
  public warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return

    const entry = this.createEntry('warn', message, data)

    if (this.config.enableConsole) {
      this.consoleLog(entry)
    }

    this.addToQueue(entry)
  }

  /**
   * Log de error
   */
  public error(message: string, error?: any): void {
    if (!this.shouldLog('error')) return

    const data = error instanceof Error
      ? {
          ...error,
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error

    const entry = this.createEntry('error', message, data)

    if (this.config.enableConsole) {
      this.consoleLog(entry)
    }

    this.addToQueue(entry)
  }

  /**
   * Define contexto atual
   */
  public setContext(context: string): void {
    this.context = context
  }

  /**
   * Define ID do usuário atual
   */
  public setUserId(userId: number): void {
    this.userId = userId
  }

  /**
   * Limpa contexto
   */
  public clearContext(): void {
    this.context = undefined
  }

  /**
   * Cria logger filho com contexto
   */
  public child(context: string): Logger {
    const child = new Logger(this.config)
    child.setContext(context)
    child.setUserId(this.userId!)
    return child
  }

  /**
   * Finaliza logger
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }
}

// Instância global do logger
export const logger = new Logger()

// Logger para componentes específicos
export const createLogger = (context: string) => logger.child(context)

export default logger