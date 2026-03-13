import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../config/database'
import { authConfig } from '../config/auth'

interface JwtPayload {
  id: number
  email: string
  tipo: string
  empresaId?: number
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const [, token] = authHeader.split(' ')

    const decoded = jwt.verify(token, authConfig.jwt.secret) as JwtPayload

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { empresa: true }
    })

    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' })
    }

    // Verificar se empresa está ativa (se não for admin do sistema)
    if (user.tipo !== 'adm_sistema' && user.empresa) {
      if (user.empresa.status !== 'ativo') {
        return res.status(403).json({ error: 'Acesso bloqueado: empresa com pendências' })
      }
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.tipo !== 'adm_sistema') {
    return res.status(403).json({ error: 'Acesso negado: necessário privilégios de administrador do sistema' })
  }
  next()
}

export const authorizeEmpresa = (tiposPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (req.user.tipo === 'adm_sistema') {
      return next() // Admin do sistema tem acesso a tudo
    }

    if (!tiposPermitidos.includes(req.user.tipo)) {
      return res.status(403).json({ error: 'Acesso negado: tipo de usuário não autorizado' })
    }

    next()
  }
}

export const checkEmpresaAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const empresaId = parseInt(req.params.empresaId || req.body.empresaId)

    if (!empresaId) {
      return next()
    }

    // Admin do sistema pode acessar qualquer empresa
    if (req.user?.tipo === 'adm_sistema') {
      return next()
    }

    // Usuário só pode acessar sua própria empresa
    if (req.user?.empresaId !== empresaId) {
      return res.status(403).json({ error: 'Acesso negado: você não pertence a esta empresa' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao verificar acesso à empresa' })
  }
}
export const authMiddleware = authenticate
