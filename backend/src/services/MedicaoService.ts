import prisma from '../config/database'

export interface ListarMedicoesParams {
  page: number
  limit: number
  obraId?: number
  periodoInicio?: string
  periodoFim?: string
  status?: string
}

export interface ListarMedicoesResult {
  medicoes: any[]
  total: number
  totalPages: number
  currentPage: number
  stats: {
    total: number
    rascunho: number
    emitida: number
    aprovada: number
    cancelada: number
    valorTotal: number
  }
}

export class MedicaoService {
  /**
   * Listar medições com paginação e filtros
   */
  async listar(empresaId: number, params: ListarMedicoesParams): Promise<ListarMedicoesResult> {
    const { page, limit, obraId, periodoInicio, periodoFim, status } = params
    const skip = (page - 1) * limit

    // Construir where
    const where: any = {
      obra: {
        empresaId
      }
    }

    if (obraId) {
      where.obraId = obraId
    }

    if (periodoInicio || periodoFim) {
      where.periodoInicio = {}
      if (periodoInicio) {
        where.periodoInicio.gte = new Date(periodoInicio)
      }
      if (periodoFim) {
        where.periodoFim.lte = new Date(periodoFim)
      }
    }

    if (status) {
      where.status = status
    }

    // Buscar medições com paginação
    const [medicoes, total] = await Promise.all([
      prisma.medicao.findMany({
        where,
        include: {
          obra: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          },
          equipamentos: {
            include: {
              equipamento: {
                select: {
                  id: true,
                  tag: true,
                  nome: true
                }
              }
            }
          },
          createdBy: {
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
      prisma.medicao.count({ where })
    ])

    // Buscar estatísticas
    const stats = await this.obterStats(empresaId)

    return {
      medicoes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats
    }
  }

  /**
   * Obter estatísticas de medições
   */
  async obterStats(empresaId: number) {
    const where = {
      obra: {
        empresaId
      }
    }

    const [total, rascunho, emitida, aprovada, cancelada, valorTotal] = await Promise.all([
      prisma.medicao.count({ where }),
      prisma.medicao.count({ where: { ...where, status: 'rascunho' } }),
      prisma.medicao.count({ where: { ...where, status: 'emitida' } }),
      prisma.medicao.count({ where: { ...where, status: 'aprovada' } }),
      prisma.medicao.count({ where: { ...where, status: 'cancelada' } }),
      prisma.medicao.aggregate({
        where: { ...where, status: 'aprovada' },
        _sum: { valorTotal: true }
      })
    ])

    return {
      total,
      rascunho,
      emitida,
      aprovada,
      cancelada,
      valorTotal: valorTotal._sum.valorTotal || 0
    }
  }

  /**
   * Gerar número da medição
   */
  async gerarNumero(obraId: number): Promise<string> {
    const ano = new Date().getFullYear()
    const count = await prisma.medicao.count({
      where: {
        obraId,
        createdAt: {
          gte: new Date(ano, 0, 1),
          lt: new Date(ano + 1, 0, 1)
        }
      }
    })

    const obra = await prisma.obra.findUnique({
      where: { id: obraId },
      select: { codigo: true }
    })

    return `MED-${obra?.codigo}-${ano}-${(count + 1).toString().padStart(3, '0')}`
  }

  /**
   * Calcular valores da medição
   */
  async calcularValores(equipamentos: Array<{
    equipamentoId: number
    horasTrabalhadas: number
  }>): Promise<{
    itens: Array<{
      equipamentoId: number
      horasTrabalhadas: number
      valorUnitario: number
      valorTotal: number
    }>
    valorTotal: number
    horasTotal: number
  }> {
    const ids = equipamentos.map(e => e.equipamentoId)
    
    const equipamentosData = await prisma.equipamento.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        valorLocacaoDiaria: true,
        valorLocacaoMensal: true
      }
    })

    const equipamentoMap = new Map(
      equipamentosData.map(e => [e.id, e])
    )

    let valorTotal = 0
    let horasTotal = 0
    const itens = []

    for (const item of equipamentos) {
      const equipamento = equipamentoMap.get(item.equipamentoId)
      
      let valorUnitario = 0
      if (equipamento?.valorLocacaoDiaria) {
        valorUnitario = equipamento.valorLocacaoDiaria / 8 // valor por hora
      } else if (equipamento?.valorLocacaoMensal) {
        valorUnitario = equipamento.valorLocacaoMensal / (8 * 22) // valor por hora
      }

      const valorTotalItem = valorUnitario * item.horasTrabalhadas

      itens.push({
        equipamentoId: item.equipamentoId,
        horasTrabalhadas: item.horasTrabalhadas,
        valorUnitario,
        valorTotal: valorTotalItem
      })

      valorTotal += valorTotalItem
      horasTotal += item.horasTrabalhadas
    }

    return {
      itens,
      valorTotal,
      horasTotal
    }
  }

  /**
   * Verificar período disponível
   */
  async verificarPeriodoDisponivel(
    obraId: number,
    periodoInicio: Date,
    periodoFim: Date,
    medicaoId?: number
  ): Promise<boolean> {
    const where: any = {
      obraId,
      status: { not: 'cancelada' },
      OR: [
        {
          periodoInicio: { lte: periodoFim },
          periodoFim: { gte: periodoInicio }
        }
      ]
    }

    if (medicaoId) {
      where.NOT = { id: medicaoId }
    }

    const count = await prisma.medicao.count({ where })
    return count === 0
  }

  /**
   * Duplicar medição
   */
  async duplicar(medicaoId: number, usuarioId: number): Promise<any> {
    const medicao = await prisma.medicao.findUnique({
      where: { id: medicaoId },
      include: {
        equipamentos: true
      }
    })

    if (!medicao) {
      throw new Error('Medição não encontrada')
    }

    const novaMedicao = await prisma.medicao.create({
      data: {
        titulo: `${medicao.titulo} (cópia)`,
        obraId: medicao.obraId,
        periodoInicio: medicao.periodoInicio,
        periodoFim: medicao.periodoFim,
        valorTotal: medicao.valorTotal,
        horasTotal: medicao.horasTotal,
        status: 'rascunho',
        createdById: usuarioId,
        equipamentos: {
          create: medicao.equipamentos.map(eq => ({
            equipamentoId: eq.equipamentoId,
            horasTrabalhadas: eq.horasTrabalhadas,
            valorUnitario: eq.valorUnitario,
            valorTotal: eq.valorTotal
          }))
        }
      },
      include: {
        equipamentos: true
      }
    })

    return novaMedicao
  }
}

export const medicaoService = new MedicaoService()