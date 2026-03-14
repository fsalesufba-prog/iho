import prisma from '../config/database'

export interface ListarManutencoesParams {
  page: number
  limit: number
  equipamentoId?: number
  tipo?: string
  status?: string
  prioridade?: string
  dataInicio?: string
  dataFim?: string
}

export interface ListarManutencoesResult {
  manutencoes: any[]
  total: number
  totalPages: number
  currentPage: number
  stats: {
    programadas: number
    emAndamento: number
    concluidas: number
    canceladas: number
  }
}

export class ManutencaoService {
  /**
   * Listar manutenções com paginação e filtros
   */
  async listar(empresaId: number, params: ListarManutencoesParams): Promise<ListarManutencoesResult> {
    const { page, limit, equipamentoId, tipo, status, prioridade, dataInicio, dataFim } = params
    const skip = (page - 1) * limit

    // Construir where
    const where: any = {
      equipamento: {
        empresaId
      }
    }

    if (equipamentoId) {
      where.equipamentoId = equipamentoId
    }

    if (tipo) {
      where.tipo = tipo
    }

    if (status) {
      where.status = status
    }

    if (prioridade) {
      where.prioridade = prioridade
    }

    if (dataInicio || dataFim) {
      where.dataProgramada = {}
      if (dataInicio) {
        where.dataProgramada.gte = new Date(dataInicio)
      }
      if (dataFim) {
        where.dataProgramada.lte = new Date(dataFim)
      }
    }

    // Buscar manutenções com paginação
    const [manutencoes, total] = await Promise.all([
      prisma.manutencao.findMany({
        where,
        include: {
          equipamento: {
            select: {
              id: true,
              tag: true,
              nome: true,
              modelo: true,
              obra: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          },
          itens: true
        },
        skip,
        take: limit,
        orderBy: [
          { prioridade: 'desc' },
          { dataProgramada: 'asc' }
        ]
      }),
      prisma.manutencao.count({ where })
    ])

    // Buscar estatísticas
    const stats = await this.obterStats(empresaId, equipamentoId)

    return {
      manutencoes,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats
    }
  }

  /**
   * Obter estatísticas de manutenções
   */
  async obterStats(empresaId: number, equipamentoId?: number) {
    const where: any = {
      equipamento: {
        empresaId
      }
    }

    if (equipamentoId) {
      where.equipamentoId = equipamentoId
    }

    const [programadas, emAndamento, concluidas, canceladas] = await Promise.all([
      prisma.manutencao.count({ where: { ...where, status: 'programada' } }),
      prisma.manutencao.count({ where: { ...where, status: 'em_andamento' } }),
      prisma.manutencao.count({ where: { ...where, status: 'concluida' } }),
      prisma.manutencao.count({ where: { ...where, status: 'cancelada' } })
    ])

    return {
      programadas,
      emAndamento,
      concluidas,
      canceladas
    }
  }

  /**
   * Verificar se manutenção existe
   */
  async verificarExistencia(id: number, empresaId: number): Promise<boolean> {
    const count = await prisma.manutencao.count({
      where: {
        id,
        equipamento: {
          empresaId
        }
      }
    })
    return count > 0
  }

  /**
   * Buscar manutenção por ID com dados completos
   */
  async buscarPorId(id: number, empresaId: number) {
    return prisma.manutencao.findFirst({
      where: {
        id,
        equipamento: {
          empresaId
        }
      },
      include: {
        equipamento: {
          include: {
            obra: {
              select: {
                id: true,
                nome: true,
                codigo: true
              }
            }
          }
        },
        itens: true
      }
    })
  }

  /**
   * Gerar manutenções preventivas baseadas em plano
   */
  async gerarPreventivas(empresaId: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: {
        empresaId,
        status: { not: 'inativo' }
      },
      include: {
        manutencoes: {
          where: {
            tipo: 'preventiva',
            status: 'programada'
          }
        }
      }
    })

    const novasManutencoes = []

    for (const equipamento of equipamentos) {
      // Verificar se já existe preventiva programada
      if (equipamento.manutencoes.length > 0) continue

      // Calcular próxima data baseada em horas
      if (equipamento.planoManutencao) {
        try {
          const plano = JSON.parse(equipamento.planoManutencao)
          if (plano.periodicidadeHoras) {
            const ultimaManutencao = await prisma.manutencao.findFirst({
              where: {
                equipamentoId: equipamento.id,
                tipo: 'preventiva',
                status: 'concluida'
              },
              orderBy: {
                dataRealizada: 'desc'
              }
            })

            const horasDesdeUltima = ultimaManutencao
              ? equipamento.horaAtual - (ultimaManutencao.horasEquipamento || 0)
              : equipamento.horaAtual

            if (horasDesdeUltima >= plano.periodicidadeHoras) {
              // Criar nova manutenção preventiva
              const dataProgramada = new Date()
              dataProgramada.setDate(dataProgramada.getDate() + 7) // 7 dias para programar

              const manutencao = await prisma.manutencao.create({
                data: {
                  equipamentoId: equipamento.id,
                  tipo: 'preventiva',
                  dataProgramada,
                  descricao: `Manutenção preventiva programada - ${plano.descricao || 'Revisão periódica'}`,
                  horasEquipamento: equipamento.horaAtual,
                  status: 'programada',
                  prioridade: 'media'
                }
              })

              novasManutencoes.push(manutencao)
            }
          }
        } catch (error) {
          console.error('Erro ao processar plano de manutenção:', error)
        }
      }
    }

    return novasManutencoes
  }

  /**
   * Verificar manutenções atrasadas e gerar alertas
   */
  async verificarAtrasadas(empresaId: number) {
    const hoje = new Date()

    const manutencoesAtrasadas = await prisma.manutencao.findMany({
      where: {
        equipamento: {
          empresaId
        },
        status: 'programada',
        dataProgramada: {
          lt: hoje
        }
      },
      include: {
        equipamento: true
      }
    })

    const alertas = []

    for (const manutencao of manutencoesAtrasadas) {
      const diasAtraso = Math.floor((hoje.getTime() - manutencao.dataProgramada!.getTime()) / (1000 * 60 * 60 * 24))

      // Atualizar prioridade baseada no atraso
      let novaPrioridade = manutencao.prioridade
      if (diasAtraso > 15) {
        novaPrioridade = 'critica'
      } else if (diasAtraso > 7) {
        novaPrioridade = 'alta'
      } else if (diasAtraso > 3) {
        novaPrioridade = 'media'
      }

      if (novaPrioridade !== manutencao.prioridade) {
        await prisma.manutencao.update({
          where: { id: manutencao.id },
          data: { prioridade: novaPrioridade }
        })
      }

      alertas.push({
        manutencaoId: manutencao.id,
        equipamentoTag: manutencao.equipamento.tag,
        diasAtraso,
        prioridade: novaPrioridade
      })
    }

    return alertas
  }
}

export const manutencaoService = new ManutencaoService()