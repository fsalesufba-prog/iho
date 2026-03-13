/**
 * Sistema de tratamento de erros
 */

export type ErrorCode =
  | 'UNKNOWN_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'SERVER_ERROR'
  | 'BUSINESS_ERROR'

export interface ErrorDetails {
  code: ErrorCode
  message: string
  status?: number
  field?: string
  constraints?: Record<string, string>
  stack?: string
  timestamp: string
  path?: string
  method?: string
  userId?: number
  requestId?: string
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly status: number
  public readonly field?: string
  public readonly constraints?: Record<string, string>
  public readonly timestamp: string
  public readonly requestId?: string

  constructor(
    message: string,
    code: ErrorCode = 'UNKNOWN_ERROR',
    status: number = 500,
    options?: {
      field?: string
      constraints?: Record<string, string>
      requestId?: string
    }
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.field = options?.field
    this.constraints = options?.constraints
    this.timestamp = new Date().toISOString()
    this.requestId = options?.requestId
  }

  /**
   * Converte para objeto
   */
  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      field: this.field,
      constraints: this.constraints,
      stack: this.stack,
      timestamp: this.timestamp,
      requestId: this.requestId,
    }
  }

  /**
   * Cria erro de validação
   */
  static validation(
    message: string,
    field?: string,
    constraints?: Record<string, string>
  ): AppError {
    return new AppError(message, 'VALIDATION_ERROR', 400, { field, constraints })
  }

  /**
   * Cria erro de autenticação
   */
  static unauthorized(message: string = 'Não autorizado'): AppError {
    return new AppError(message, 'AUTH_ERROR', 401)
  }

  /**
   * Cria erro de permissão
   */
  static forbidden(message: string = 'Acesso negado'): AppError {
    return new AppError(message, 'PERMISSION_ERROR', 403)
  }

  /**
   * Cria erro de não encontrado
   */
  static notFound(message: string = 'Não encontrado'): AppError {
    return new AppError(message, 'NOT_FOUND_ERROR', 404)
  }

  /**
   * Cria erro de conflito
   */
  static conflict(message: string): AppError {
    return new AppError(message, 'CONFLICT_ERROR', 409)
  }

  /**
   * Cria erro de negócio
   */
  static business(message: string): AppError {
    return new AppError(message, 'BUSINESS_ERROR', 422)
  }

  /**
   * Cria erro de rede
   */
  static network(message: string = 'Erro de conexão'): AppError {
    return new AppError(message, 'NETWORK_ERROR', 0)
  }

  /**
   * Cria erro de timeout
   */
  static timeout(message: string = 'Tempo limite excedido'): AppError {
    return new AppError(message, 'TIMEOUT_ERROR', 408)
  }

  /**
   * Cria erro de servidor
   */
  static server(message: string = 'Erro interno do servidor'): AppError {
    return new AppError(message, 'SERVER_ERROR', 500)
  }
}

/**
 * Tratador de erros global
 */
export class ErrorHandler {
  private static instance: ErrorHandler
  private listeners: ((error: AppError) => void)[] = []

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Adiciona listener
   */
  addListener(listener: (error: AppError) => void): void {
    this.listeners.push(listener)
  }

  /**
   * Remove listener
   */
  removeListener(listener: (error: AppError) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  /**
   * Notifica listeners
   */
  private notify(error: AppError): void {
    this.listeners.forEach(listener => listener(error))
  }

  /**
   * Trata erro
   */
  handle(error: unknown, context?: Record<string, any>): AppError {
    let appError: AppError

    if (error instanceof AppError) {
      appError = error
    } else if (error instanceof Error) {
      appError = new AppError(error.message, 'UNKNOWN_ERROR', 500)
    } else if (typeof error === 'string') {
      appError = new AppError(error, 'UNKNOWN_ERROR', 500)
    } else {
      appError = new AppError('Erro desconhecido', 'UNKNOWN_ERROR', 500)
    }

    // Log do erro
    console.error('Error handled:', {
      ...appError.toJSON(),
      context,
    })

    // Notificar listeners
    this.notify(appError)

    return appError
  }

  /**
   * Trata erro de API
   */
  handleApiError(error: any, defaultMessage: string = 'Erro na requisição'): AppError {
    if (error.response) {
      // Erro com resposta do servidor
      const { status, data } = error.response

      switch (status) {
        case 400:
          return AppError.validation(
            data.message || 'Dados inválidos',
            data.field,
            data.constraints
          )
        case 401:
          return AppError.unauthorized(data.message)
        case 403:
          return AppError.forbidden(data.message)
        case 404:
          return AppError.notFound(data.message)
        case 409:
          return AppError.conflict(data.message)
        case 422:
          return AppError.business(data.message)
        case 500:
          return AppError.server(data.message)
        default:
          return new AppError(
            data.message || defaultMessage,
            'UNKNOWN_ERROR',
            status
          )
      }
    } else if (error.request) {
      // Erro de rede
      if (error.code === 'ECONNABORTED') {
        return AppError.timeout()
      }
      return AppError.network()
    } else {
      // Outros erros
      return new AppError(error.message || defaultMessage, 'UNKNOWN_ERROR', 500)
    }
  }

  /**
   * Trata erro de validação
   */
  handleValidationError(errors: Record<string, string[]>): AppError[] {
    return Object.entries(errors).map(([field, messages]) =>
      AppError.validation(messages[0], field, { [field]: messages[0] })
    )
  }
}

export const errorHandler = ErrorHandler.getInstance()