import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'

type UserRole = 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Não autorizado')
    }

    if (!allowedRoles.includes(req.user.tipo as UserRole)) {
      throw new ApiError(403, 'Acesso negado - Permissão insuficiente')
    }

    next()
  }
}

// Middleware específico para admin do sistema
export const adminSistemaOnly = roleMiddleware(['adm_sistema'])

// Middleware para admin da empresa e admin sistema
export const adminEmpresaOrSistema = roleMiddleware(['adm_sistema', 'adm_empresa'])

// Middleware para controladores e superiores
export const controladorOrAbove = roleMiddleware(['adm_sistema', 'adm_empresa', 'controlador'])