import prisma from '../config/database'
import { ApiError } from '../utils/ApiError'

export interface ListarUsuariosParams {
  page: number
  limit: number
  search?: string
  tipo?: string
  status?: 'ativos' | 'inativos'
}

export interface ListarUsuariosResult {
  usuarios: any[]
  total: number
  totalPages: number
  currentPage: number
  stats: {
    total: number
    admEmpresa: number
    controladores: number
    apontadores: number
    ativos: number
    inativos: number
  }
}

export class UsuarioService {
  /**
   * Listar usuários com paginação e filtros
   */
  async listar(empresaId: number, params: ListarUsuariosParams): Promise<ListarUsuariosResult> {
    const { page, limit, search, tipo, status } = params
    const skip = (page - 1) * limit

    // Construir where
    const where: any = {
      empresaId
    }

    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { email: { contains: search } }
      ]
    }

    if (tipo) {
      where.tipo = tipo
    }

    if (status) {
      where.ativo = status === 'ativos'
    }

    // Buscar usuários com paginação
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          cargo: true,
          departamento: true,
          tipo: true,
          ativo: true,
          ultimoAcesso: true,
          createdAt: true,
          empresa: {
            select: {
              id: true,
              nome: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.usuario.count({ where })
    ])

    // Buscar estatísticas
    const stats = await this.obterStats(empresaId)

    return {
      usuarios,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats
    }
  }

  /**
   * Obter estatísticas de usuários da empresa
   */
  async obterStats(empresaId: number) {
    const [total, admEmpresa, controladores, apontadores, ativos, inativos] = await Promise.all([
      prisma.usuario.count({ where: { empresaId } }),
      prisma.usuario.count({ where: { empresaId, tipo: 'adm_empresa' } }),
      prisma.usuario.count({ where: { empresaId, tipo: 'controlador' } }),
      prisma.usuario.count({ where: { empresaId, tipo: 'apontador' } }),
      prisma.usuario.count({ where: { empresaId, ativo: true } }),
      prisma.usuario.count({ where: { empresaId, ativo: false } })
    ])

    return {
      total,
      admEmpresa,
      controladores,
      apontadores,
      ativos,
      inativos
    }
  }

  /**
   * Verificar se usuário existe
   */
  async verificarExistencia(id: number): Promise<boolean> {
    const count = await prisma.usuario.count({
      where: { id }
    })
    return count > 0
  }

  /**
   * Verificar limites da empresa para criar novo usuário
   */
  async verificarLimites(empresaId: number, tipo: string): Promise<{
    podeCriar: boolean
    message?: string
    limites?: any
  }> {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: {
        plano: true,
        _count: {
          select: {
            usuarios: {
              where: {
                tipo: {
                  in: ['adm_empresa', 'controlador', 'apontador']
                }
              }
            }
          }
        }
      }
    })

    if (!empresa) {
      return {
        podeCriar: false,
        message: 'Empresa não encontrada'
      }
    }

    if (!empresa.plano) {
      return {
        podeCriar: false,
        message: 'Empresa não possui plano'
      }
    }

    // Contar usuários por tipo
    const [admCount, controladorCount, apontadorCount] = await Promise.all([
      prisma.usuario.count({ where: { empresaId, tipo: 'adm_empresa' } }),
      prisma.usuario.count({ where: { empresaId, tipo: 'controlador' } }),
      prisma.usuario.count({ where: { empresaId, tipo: 'apontador' } })
    ])

    const limites = {
      adm: {
        atual: admCount,
        maximo: empresa.plano.limiteAdm,
        disponivel: Math.max(0, empresa.plano.limiteAdm - admCount)
      },
      controlador: {
        atual: controladorCount,
        maximo: empresa.plano.limiteControlador,
        disponivel: Math.max(0, empresa.plano.limiteControlador - controladorCount)
      },
      apontador: {
        atual: apontadorCount,
        maximo: empresa.plano.limiteApontador,
        disponivel: Math.max(0, empresa.plano.limiteApontador - apontadorCount)
      }
    }

    // Verificar por tipo
    if (tipo === 'adm_empresa' && limites.adm.disponivel <= 0) {
      return {
        podeCriar: false,
        message: 'Limite de administradores atingido',
        limites
      }
    }

    if (tipo === 'controlador' && limites.controlador.disponivel <= 0) {
      return {
        podeCriar: false,
        message: 'Limite de controladores atingido',
        limites
      }
    }

    if (tipo === 'apontador' && limites.apontador.disponivel <= 0) {
      return {
        podeCriar: false,
        message: 'Limite de apontadores atingido',
        limites
      }
    }

    return {
      podeCriar: true,
      limites
    }
  }

  /**
   * Buscar usuário por ID com dados completos
   */
  async buscarPorIdCompleto(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            status: true,
            plano: {
              select: {
                id: true,
                nome: true,
                limiteAdm: true,
                limiteControlador: true,
                limiteApontador: true
              }
            }
          }
        },
        logs: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            acao: true,
            entidade: true,
            entidadeId: true,
            dadosAntigos: true,
            dadosNovos: true,
            ip: true,
            userAgent: true,
            createdAt: true
          }
        }
      }
    })
  }
}

export const usuarioService = new UsuarioService()