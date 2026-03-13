import rateLimit from 'express-rate-limit'
import { Request, Response } from 'express'

interface RateLimiterOptions {
  windowMs?: number
  max?: number
  message?: string
  statusCode?: number
  keyGenerator?: (req: Request) => string
  skip?: (req: Request) => boolean
}

export const rateLimiter = (options: RateLimiterOptions = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos padrão
    max = 100, // 100 requisições padrão
    message = 'Muitas requisições deste IP, tente novamente mais tarde.',
    statusCode = 429,
    keyGenerator = (req) => req.ip || 'unknown',
    skip = () => false
  } = options

  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000) // segundos
    },
    statusCode,
    keyGenerator,
    skip,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(statusCode).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      })
    }
  })
}

// Limitadores específicos
export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas de login
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
})

export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requisições por minuto
  message: 'Limite de requisições excedido. Tente novamente em 1 minuto.'
})

export const createAccountLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 criações de conta por hora
  message: 'Muitas contas criadas deste IP. Tente novamente em 1 hora.'
})

export const passwordResetLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 solicitações de reset por hora
  message: 'Muitas solicitações de redefinição de senha. Tente novamente em 1 hora.'
})

export const webhookLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 webhooks por minuto
  message: 'Limite de webhooks excedido.',
  keyGenerator: (req) => req.headers['x-webhook-signature'] as string || req.ip || 'unknown'
})