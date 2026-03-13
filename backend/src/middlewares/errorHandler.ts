import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Erro interno do servidor'

  console.error(err.stack || err)

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
