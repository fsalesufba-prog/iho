import prisma from '../config/database'
import { emailService } from './EmailService'

export class AlertaService {
  /**
   * Verificar alertas de combustível
   */
  async verificarCombustivel(empresaId: number) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - 7)

    const apontamentos = await prisma.apontamento.groupBy({
      by: ['equipamentoId'],
      where: {
        equipamento: { empresaId },
        data: { gte: dataLimite }
      },
      _avg: {
        combustivelLitros: true
      },
      _count: {
        combustivelLitros: true
      }
    })

<<<<<<< HEAD
    const configuracoes = await prisma.configuracaoAlerta.findUnique({
=======
    const configuracoes = await (prisma as any).configuracaoAlerta.findUnique({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: {
        empresaId_tipo: {
          empresaId,
          tipo: 'combustivel'
        }
      }
    })

    const limite = configuracoes?.limite || 100

    for (const item of apontamentos) {
      if (item._avg.combustivelLitros && item._avg.combustivelLitros > limite) {
        const equipamento = await prisma.equipamento.findUnique({
          where: { id: item.equipamentoId }
        })

        if (equipamento) {
          await this.criarAlerta({
            empresaId,
            tipo: 'combustivel',
            gravidade: 'media',
            titulo: 'Consumo elevado de combustível',
            descricao: `O equipamento ${equipamento.tag} está com consumo médio de ${item._avg.combustivelLitros.toFixed(2)}L/dia, acima do limite de ${limite}L`,
            equipamentoId: equipamento.id,
            valor: item._avg.combustivelLitros,
            limite
          })
        }
      }
    }
  }

  /**
   * Verificar alertas de manutenção
   */
  async verificarManutencao(empresaId: number) {
    const hoje = new Date()
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + 7)

<<<<<<< HEAD
    const configuracoes = await prisma.configuracaoAlerta.findUnique({
=======
    const configuracoes = await (prisma as any).configuracaoAlerta.findUnique({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: {
        empresaId_tipo: {
          empresaId,
          tipo: 'manutencao'
        }
      }
    })

    const diasAntecedencia = configuracoes?.diasAntecedencia || 7

    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        status: 'programada',
        dataProgramada: {
          lte: new Date(hoje.getTime() + diasAntecedencia * 24 * 60 * 60 * 1000),
          gte: hoje
        }
      },
      include: {
        equipamento: {
          select: { id: true, tag: true, nome: true }
        }
      }
    })

    for (const manutencao of manutencoes) {
      const diasRestantes = Math.ceil(
<<<<<<< HEAD
        (manutencao.dataProgramada.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
=======
        (manutencao.dataProgramada!.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      )

      let gravidade = 'baixa'
      if (diasRestantes <= 2) gravidade = 'alta'
      else if (diasRestantes <= 5) gravidade = 'media'

      await this.criarAlerta({
        empresaId,
        tipo: 'manutencao',
        gravidade,
        titulo: 'Manutenção programada',
        descricao: `O equipamento ${manutencao.equipamento.tag} tem manutenção programada para daqui a ${diasRestantes} dias`,
        equipamentoId: manutencao.equipamento.id,
        data: manutencao.dataProgramada,
        diasRestantes
      })
    }

    // Verificar manutenções atrasadas
    const manutencoesAtrasadas = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        status: 'programada',
        dataProgramada: {
          lt: hoje
        }
      },
      include: {
        equipamento: {
          select: { id: true, tag: true, nome: true }
        }
      }
    })

    for (const manutencao of manutencoesAtrasadas) {
      const diasAtraso = Math.ceil(
<<<<<<< HEAD
        (hoje.getTime() - manutencao.dataProgramada.getTime()) / (1000 * 60 * 60 * 24)
=======
        (hoje.getTime() - manutencao.dataProgramada!.getTime()) / (1000 * 60 * 60 * 24)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      )

      await this.criarAlerta({
        empresaId,
        tipo: 'manutencao',
        gravidade: 'alta',
        titulo: 'Manutenção atrasada',
        descricao: `A manutenção do equipamento ${manutencao.equipamento.tag} está atrasada há ${diasAtraso} dias`,
        equipamentoId: manutencao.equipamento.id,
        diasAtraso
      })
    }
  }

  /**
   * Verificar alertas de estoque
   */
  async verificarEstoque(empresaId: number) {
<<<<<<< HEAD
    const configuracoes = await prisma.configuracaoAlerta.findUnique({
=======
    const configuracoes = await (prisma as any).configuracaoAlerta.findUnique({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: {
        empresaId_tipo: {
          empresaId,
          tipo: 'estoque'
        }
      }
    })

    const itens = await prisma.estoque.findMany({
      where: { empresaId }
    })

    for (const item of itens) {
      if (item.estoqueAtual <= 0) {
        await this.criarAlerta({
          empresaId,
          tipo: 'estoque',
          gravidade: 'alta',
          titulo: 'Item esgotado',
          descricao: `O item ${item.nome} (${item.codigo}) está com estoque esgotado`,
          itemEstoqueId: item.id,
          valor: item.estoqueAtual,
          limite: item.estoqueMinimo
        })
      } else if (item.estoqueAtual <= item.estoqueMinimo) {
        const percentual = (item.estoqueAtual / item.estoqueMinimo) * 100
        let gravidade = 'media'
        if (percentual <= 30) gravidade = 'alta'
        else if (percentual <= 60) gravidade = 'media'
        else gravidade = 'baixa'

        await this.criarAlerta({
          empresaId,
          tipo: 'estoque',
          gravidade,
          titulo: 'Estoque baixo',
          descricao: `O item ${item.nome} (${item.codigo}) está com estoque baixo (${item.estoqueAtual} de ${item.estoqueMinimo})`,
          itemEstoqueId: item.id,
          valor: item.estoqueAtual,
          limite: item.estoqueMinimo
        })
      }
    }
  }

  /**
   * Criar alerta
   */
  async criarAlerta(dados: any) {
    // Verificar se já existe alerta pendente similar
<<<<<<< HEAD
    const existente = await prisma.alerta.findFirst({
=======
    const existente = await (prisma as any).alerta.findFirst({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: {
        empresaId: dados.empresaId,
        tipo: dados.tipo,
        status: 'pendente',
        equipamentoId: dados.equipamentoId,
        itemEstoqueId: dados.itemEstoqueId
      }
    })

    if (existente) return existente

<<<<<<< HEAD
    const alerta = await prisma.alerta.create({
=======
    const alerta = await (prisma as any).alerta.create({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      data: {
        empresaId: dados.empresaId,
        tipo: dados.tipo,
        gravidade: dados.gravidade,
        titulo: dados.titulo,
        descricao: dados.descricao,
        equipamentoId: dados.equipamentoId,
        itemEstoqueId: dados.itemEstoqueId,
        valor: dados.valor,
        limite: dados.limite,
        dataReferencia: dados.data,
        diasRestantes: dados.diasRestantes,
        diasAtraso: dados.diasAtraso,
        status: 'pendente'
      }
    })

    // Buscar configurações para notificação
<<<<<<< HEAD
    const config = await prisma.configuracaoAlerta.findUnique({
=======
    const config = await (prisma as any).configuracaoAlerta.findUnique({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: {
        empresaId_tipo: {
          empresaId: dados.empresaId,
          tipo: dados.tipo
        }
      }
    })

    // Notificar por email se configurado
    if (config?.notificarEmail && config.destinatarios?.length) {
<<<<<<< HEAD
      await emailService.enviarAlerta(alerta, config.destinatarios)
=======
      for (const destinatario of config.destinatarios) {
        await emailService.enviarAlerta(destinatario, alerta.titulo, alerta.descricao, alerta.nivel)
      }
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    }

    return alerta
  }

  /**
   * Processar todos os alertas
   */
  async processarTodos(empresaId: number) {
    await Promise.all([
      this.verificarCombustivel(empresaId),
      this.verificarManutencao(empresaId),
      this.verificarEstoque(empresaId)
    ])
  }

  /**
   * Resolver alertas antigos
   */
  async resolverAntigos(empresaId: number) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - 30)

<<<<<<< HEAD
    await prisma.alerta.updateMany({
=======
    await (prisma as any).alerta.updateMany({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: {
        empresaId,
        status: 'pendente',
        createdAt: { lt: dataLimite }
      },
      data: {
        status: 'resolvido',
        resolvidoEm: new Date(),
        observacaoResolucao: 'Resolvido automaticamente após 30 dias'
      }
    })
  }

  /**
   * Obter estatísticas por tipo
   */
  async estatisticasPorTipo(empresaId: number) {
    const tipos = ['combustivel', 'manutencao', 'estoque']
    const resultado = []

    for (const tipo of tipos) {
      const [pendentes, resolvidos, totais] = await Promise.all([
<<<<<<< HEAD
        prisma.alerta.count({
          where: { empresaId, tipo, status: 'pendente' }
        }),
        prisma.alerta.count({
          where: { empresaId, tipo, status: 'resolvido' }
        }),
        prisma.alerta.count({
=======
        (prisma as any).alerta.count({
          where: { empresaId, tipo, status: 'pendente' }
        }),
        (prisma as any).alerta.count({
          where: { empresaId, tipo, status: 'resolvido' }
        }),
        (prisma as any).alerta.count({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          where: { empresaId, tipo }
        })
      ])

      resultado.push({
        tipo,
        pendentes,
        resolvidos,
        totais,
        taxaResolucao: totais > 0 ? (resolvidos / totais) * 100 : 0
      })
    }

    return resultado
  }

  /**
   * Obter equipamentos com mais alertas
   */
  async topEquipamentosAlertas(empresaId: number, limite: number = 10) {
<<<<<<< HEAD
    const result = await prisma.alerta.groupBy({
=======
    const result = await (prisma as any).alerta.groupBy({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      by: ['equipamentoId'],
      where: {
        empresaId,
        equipamentoId: { not: null }
      },
      _count: true,
      orderBy: {
        _count: {
          equipamentoId: 'desc'
        }
      },
      take: limite
    })

    const equipamentos = await Promise.all(
<<<<<<< HEAD
      result.map(async (item) => {
=======
      result.map(async (item: any) => {
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        const equipamento = await prisma.equipamento.findUnique({
          where: { id: item.equipamentoId! },
          select: { tag: true, nome: true }
        })
        return {
          equipamentoId: item.equipamentoId,
          ...equipamento,
          totalAlertas: item._count
        }
      })
    )

    return equipamentos
  }

  /**
   * Obter itens de estoque com mais alertas
   */
  async topItensEstoqueAlertas(empresaId: number, limite: number = 10) {
<<<<<<< HEAD
    const result = await prisma.alerta.groupBy({
=======
    const result = await (prisma as any).alerta.groupBy({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      by: ['itemEstoqueId'],
      where: {
        empresaId,
        itemEstoqueId: { not: null }
      },
      _count: true,
      orderBy: {
        _count: {
          itemEstoqueId: 'desc'
        }
      },
      take: limite
    })

    const itens = await Promise.all(
<<<<<<< HEAD
      result.map(async (item) => {
=======
      result.map(async (item: any) => {
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        const estoque = await prisma.estoque.findUnique({
          where: { id: item.itemEstoqueId! },
          select: { nome: true, codigo: true }
        })
        return {
          itemEstoqueId: item.itemEstoqueId,
          ...estoque,
          totalAlertas: item._count
        }
      })
    )

    return itens
  }
}

export const alertaService = new AlertaService()