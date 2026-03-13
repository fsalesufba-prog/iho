import { Request, Response, NextFunction } from 'express'
import prisma from '../config/database'

export async function empresaStatusMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const usuario = (req as any).usuario

    // Se for admin do sistema, não precisa verificar empresa
    if (usuario.tipo === 'adm_sistema') {
      return next()
    }

    if (!usuario.empresaId) {
      return res.status(400).json({ error: 'Usuário não vinculado a uma empresa' })
    }

    // Buscar empresa atualizada
    const empresa = await prisma.empresa.findUnique({
      where: { id: usuario.empresaId }
    })

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' })
    }

    // Verificar status
    if (empresa.status !== 'ativo') {
      return res.status(403).json({ 
        error: 'Acesso bloqueado',
        message: empresa.status === 'inativo' 
          ? 'Empresa inativa' 
          : empresa.status === 'atrasado'
          ? `Pagamento atrasado há ${empresa.diasAtraso} dias`
          : 'Empresa cancelada',
        status: empresa.status,
        diasAtraso: empresa.diasAtraso
      })
    }

    // Atualizar empresa no request
    ;(req as any).empresa = empresa

    next()
  } catch (error) {
    console.error('Erro no empresaStatus middleware:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}