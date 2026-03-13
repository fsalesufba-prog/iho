import prisma from '../config/database'

export interface ListarEquipamentosParams {
  page: number
  limit: number
  search?: string
  status?: string
  tipo?: string
  obraId?: number
  frenteServicoId?: number
  centroCustoId?: number
}

export interface ListarEquipamentosResult {
  equipamentos: any[]
  total: number
  totalPages: number
  currentPage: number
  stats: {
    total: number
    disponivel: number
    emUso: number
    manutencao: number
    inativo: number
  }
}

export class EquipamentoService {
  /**
   * Listar equipamentos com paginação e filtros
   */
  async listar(empresaId: number, params: ListarEquipamentosParams): Promise<ListarEquipamentosResult> {
    const { page, limit, search, status, tipo, obraId, frenteServicoId, centroCustoId } = params
    const skip = (page - 1) * limit

    // Construir where
    const where: any = {
      empresaId
    }

    if (search) {
      where.OR = [
        { tag: { contains: search } },
        { nome: { contains: search } },
        { numeroSerie: { contains: search } },
        { placa: { contains: search } }
      ]
    }

    if (status) where.status = status
    if (tipo) where.tipo = tipo
    if (obraId) where.obraId = obraId
    if (frenteServicoId) where.frenteServicoId = frenteServicoId
    if (centroCustoId) where.centroCustoId = centroCustoId

    // Buscar equipamentos com paginação
    const [equipamentos, total] = await Promise.all([
      prisma.equipamento.findMany({
        where,
        include: {
          obra: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          },
          frenteServico: {
            select: {
              id: true,
              nome: true
            }
          },
          centroCusto: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          },
          manutencoes: {
            where: {
              status: 'programada'
            },
            take: 1,
            orderBy: { dataProgramada: 'asc' }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.equipamento.count({ where })
    ])

    // Buscar estatísticas
    const stats = await this.obterStats(empresaId)

    return {
      equipamentos,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats
    }
  }

  /**
   * Obter estatísticas de equipamentos
   */
  async obterStats(empresaId: number) {
    const [total, disponivel, emUso, manutencao, inativo] = await Promise.all([
      prisma.equipamento.count({ where: { empresaId } }),
      prisma.equipamento.count({ where: { empresaId, status: 'disponivel' } }),
      prisma.equipamento.count({ where: { empresaId, status: 'em_uso' } }),
      prisma.equipamento.count({ where: { empresaId, status: 'manutencao' } }),
      prisma.equipamento.count({ where: { empresaId, status: 'inativo' } })
    ])

    return {
      total,
      disponivel,
      emUso,
      manutencao,
      inativo
    }
  }

  /**
   * Verificar limite de equipamentos
   */
  async verificarLimite(empresaId: number): Promise<{
    dentroDoLimite: boolean
    atual: number
    maximo: number
    disponivel: number
  }> {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: { plano: true }
    })

    if (!empresa || !empresa.plano) {
      throw new Error('Empresa não possui plano')
    }

    const atual = await prisma.equipamento.count({
      where: { empresaId }
    })

    const maximo = empresa.plano.limiteEquipamentos
    const disponivel = Math.max(0, maximo - atual)

    return {
      dentroDoLimite: atual < maximo,
      atual,
      maximo,
      disponivel
    }
  }

  /**
   * Buscar equipamento por ID com dados básicos
   */
  async buscarPorId(empresaId: number, id: number) {
    return prisma.equipamento.findFirst({
      where: { 
        id,
        empresaId 
      },
      include: {
        obra: {
          select: {
            id: true,
            nome: true,
            codigo: true
          }
        },
        frenteServico: {
          select: {
            id: true,
            nome: true
          }
        },
        centroCusto: {
          select: {
            id: true,
            nome: true,
            codigo: true
          }
        }
      }
    })
  }

  /**
   * Validar se obra pertence à empresa
   */
  async validarObra(empresaId: number, obraId: number | null): Promise<boolean> {
    if (!obraId) return true

    const obra = await prisma.obra.findFirst({
      where: {
        id: obraId,
        empresaId
      }
    })

    return !!obra
  }

  /**
   * Validar se frente de serviço pertence à empresa
   */
  async validarFrenteServico(empresaId: number, frenteServicoId: number | null): Promise<boolean> {
    if (!frenteServicoId) return true

    const frente = await prisma.frenteServico.findFirst({
      where: {
        id: frenteServicoId,
        obra: {
          empresaId
        }
      }
    })

    return !!frente
  }

  /**
   * Validar se centro de custo pertence à empresa
   */
  async validarCentroCusto(empresaId: number, centroCustoId: number | null): Promise<boolean> {
    if (!centroCustoId) return true

    const centro = await prisma.centroCusto.findFirst({
      where: {
        id: centroCustoId,
        empresaId
      }
    })

    return !!centro
  }
}

export const equipamentoService = new EquipamentoService()