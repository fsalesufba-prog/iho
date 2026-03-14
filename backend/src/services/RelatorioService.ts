import prisma from '../config/database'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export interface RelatorioParams {
  tipo: string
  formato?: string
  periodoInicio?: string
  periodoFim?: string
  filtros?: Record<string, any>
  agruparPor?: string
  ordenarPor?: string
  limite?: number
}

export class RelatorioService {
  /**
   * Listar relatórios recentes
   */
  async listarRecentes(empresaId: number) {
<<<<<<< HEAD
    return prisma.relatorioLog.findMany({
=======
    return (prisma as any).relatorioLog.findMany({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: { empresaId },
      include: {
        usuario: {
          select: { id: true, nome: true }
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Listar relatórios agendados
   */
  async listarAgendados(empresaId: number) {
<<<<<<< HEAD
    return prisma.relatorioPersonalizado.findMany({
=======
    return (prisma as any).relatorioPersonalizado.findMany({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: { 
        empresaId,
        agendado: true
      },
      orderBy: { proximaExecucao: 'asc' }
    })
  }

  /**
   * Obter estatísticas de relatórios
   */
  async obterEstatisticas(empresaId: number) {
<<<<<<< HEAD
    const total = await prisma.relatorioLog.count({
      where: { empresaId }
    })

    const ultimos7Dias = await prisma.relatorioLog.count({
=======
    const total = await (prisma as any).relatorioLog.count({
      where: { empresaId }
    })

    const ultimos7Dias = await (prisma as any).relatorioLog.count({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: {
        empresaId,
        createdAt: {
          gte: subDays(new Date(), 7)
        }
      }
    })

<<<<<<< HEAD
    const porTipo = await prisma.relatorioLog.groupBy({
=======
    const porTipo = await (prisma as any).relatorioLog.groupBy({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      by: ['tipo'],
      where: { empresaId },
      _count: true
    })

    return {
      total,
      ultimos7Dias,
<<<<<<< HEAD
      porTipo: porTipo.map(t => ({
=======
      porTipo: porTipo.map((t: any) => ({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        tipo: t.tipo,
        quantidade: t._count
      }))
    }
  }

  /**
   * Gerar relatório gerencial
   */
  async gerarRelatorioGerencial(empresaId: number, params: RelatorioParams) {
    const dataInicio = params.periodoInicio ? new Date(params.periodoInicio) : startOfMonth(new Date())
    const dataFim = params.periodoFim ? new Date(params.periodoFim) : new Date()

    const [equipamentos, obras, manutencoes, custos] = await Promise.all([
      prisma.equipamento.count({
        where: { empresaId }
      }),
      prisma.obra.count({
        where: { empresaId }
      }),
      prisma.manutencao.count({
        where: {
          equipamento: { empresaId },
          dataRealizada: {
            gte: dataInicio,
            lte: dataFim
          }
        }
      }),
      prisma.manutencao.aggregate({
        where: {
          equipamento: { empresaId },
          dataRealizada: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        _sum: { custo: true }
      })
    ])

    return {
      titulo: 'Relatório Gerencial',
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      resumo: {
        totalEquipamentos: equipamentos,
        totalObras: obras,
        totalManutencoes: manutencoes,
        custoTotal: custos._sum.custo || 0
      },
      detalhes: {
        equipamentos: await this.getDetalhesEquipamentos(empresaId),
        obras: await this.getDetalhesObras(empresaId, dataInicio, dataFim)
      }
    }
  }

  /**
   * Gerar relatório operacional
   */
  async gerarRelatorioOperacional(empresaId: number, params: RelatorioParams) {
    const dataInicio = params.periodoInicio ? new Date(params.periodoInicio) : subDays(new Date(), 30)
    const dataFim = params.periodoFim ? new Date(params.periodoFim) : new Date()

    const [apontamentos, horasTrabalhadas, equipamentosAtivos] = await Promise.all([
      prisma.apontamento.count({
        where: {
          equipamento: { empresaId },
          data: {
            gte: dataInicio,
            lte: dataFim
          }
        }
      }),
      prisma.apontamento.aggregate({
        where: {
          equipamento: { empresaId },
          data: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        _sum: { horasTrabalhadas: true }
      }),
      prisma.equipamento.count({
        where: {
          empresaId,
          status: { in: ['disponivel', 'em_uso'] }
        }
      })
    ])

    return {
      titulo: 'Relatório Operacional',
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      resumo: {
        totalApontamentos: apontamentos,
        horasTrabalhadas: horasTrabalhadas._sum.horasTrabalhadas || 0,
        equipamentosAtivos
      },
      porEquipamento: await this.getDesempenhoEquipamentos(empresaId, dataInicio, dataFim)
    }
  }

  /**
   * Gerar relatório financeiro
   */
  async gerarRelatorioFinanceiro(empresaId: number, params: RelatorioParams) {
    const dataInicio = params.periodoInicio ? new Date(params.periodoInicio) : startOfMonth(new Date())
    const dataFim = params.periodoFim ? new Date(params.periodoFim) : new Date()

    const [custosManutencao, receitas, depreciacao] = await Promise.all([
      prisma.manutencao.aggregate({
        where: {
          equipamento: { empresaId },
          dataRealizada: {
            gte: dataInicio,
            lte: dataFim
          }
        },
        _sum: { custo: true }
      }),
      this.calcularReceitas(empresaId, dataInicio, dataFim),
      this.calcularDepreciacaoPeriodo(empresaId, dataInicio, dataFim)
    ])

    return {
      titulo: 'Relatório Financeiro',
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      resumo: {
        custosManutencao: custosManutencao._sum.custo || 0,
        receitas: receitas.total,
        depreciacao: depreciacao.total,
        lucroLiquido: receitas.total - (custosManutencao._sum.custo || 0)
      },
      detalhes: {
        custosPorTipo: await this.getCustosPorTipo(empresaId, dataInicio, dataFim),
        receitasPorObra: await this.getReceitasPorObra(empresaId, dataInicio, dataFim)
      }
    }
  }

  /**
   * Gerar relatório de manutenção
   */
  async gerarRelatorioManutencao(empresaId: number, params: RelatorioParams) {
    const dataInicio = params.periodoInicio ? new Date(params.periodoInicio) : subDays(new Date(), 30)
    const dataFim = params.periodoFim ? new Date(params.periodoFim) : new Date()

    const where: any = {
      equipamento: { empresaId },
      dataRealizada: {
        gte: dataInicio,
        lte: dataFim
      }
    }

    if (params.filtros?.equipamentoId) {
      where.equipamentoId = params.filtros.equipamentoId
    }

    const [manutencoes, porTipo, custoMedio] = await Promise.all([
      prisma.manutencao.findMany({
        where,
        include: {
          equipamento: {
            select: { id: true, tag: true, nome: true }
          }
        },
        orderBy: { dataRealizada: 'desc' }
      }),
      prisma.manutencao.groupBy({
        by: ['tipo'],
        where,
        _count: true,
        _sum: { custo: true }
      }),
      prisma.manutencao.aggregate({
        where,
        _avg: { custo: true }
      })
    ])

    return {
      titulo: 'Relatório de Manutenção',
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      resumo: {
        total: manutencoes.length,
        custoTotal: manutencoes.reduce((sum, m) => sum + (m.custo || 0), 0),
        custoMedio: custoMedio._avg.custo || 0
      },
<<<<<<< HEAD
      porTipo: porTipo.map(t => ({
=======
      porTipo: porTipo.map((t: any) => ({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        tipo: t.tipo,
        quantidade: t._count,
        custo: t._sum.custo || 0
      })),
      manutencoes
    }
  }

  /**
   * Executar relatório personalizado
   */
  async executarRelatorioPersonalizado(empresaId: number, config: any, params: RelatorioParams) {
    const dados = await this.coletarDadosRelatorio(empresaId, config.tipo, params)
    
    // Aplicar filtros personalizados
    let resultado = this.aplicarFiltros(dados, config.configuracoes.filtros)
    
    // Agrupar dados se necessário
    if (config.configuracoes.agrupamento) {
      resultado = this.agruparDados(resultado, config.configuracoes.agrupamento)
    }

    // Ordenar
    if (config.configuracoes.ordenacao) {
      resultado = this.ordenarDados(resultado, config.configuracoes.ordenacao)
    }

    // Selecionar colunas
    if (config.configuracoes.colunas) {
      resultado = this.selecionarColunas(resultado, config.configuracoes.colunas)
    }

    return {
      titulo: config.nome,
      data: new Date(),
      dados: resultado,
      graficos: config.configuracoes.graficos || []
    }
  }

  /**
   * Agendar relatório
   */
  async agendarRelatorio(relatorioId: number, config: any) {
    // Implementar agendamento com cron jobs
    const proximaExecucao = this.calcularProximaExecucao(config.frequencia)
    
<<<<<<< HEAD
    await prisma.relatorioPersonalizado.update({
=======
    await (prisma as any).relatorioPersonalizado.update({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: { id: relatorioId },
      data: { 
        agendado: true,
        proximaExecucao,
        frequencia: config.frequencia,
        destinatarios: config.destinatarios
      }
    })

    // Registrar no sistema de jobs
    // ...
  }

  /**
   * Atualizar agendamento
   */
  async atualizarAgendamento(relatorioId: number, config: any) {
    const proximaExecucao = config.agendado ? this.calcularProximaExecucao(config.frequencia) : null

<<<<<<< HEAD
    await prisma.relatorioPersonalizado.update({
=======
    await (prisma as any).relatorioPersonalizado.update({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: { id: relatorioId },
      data: {
        agendado: config.agendado,
        proximaExecucao,
        frequencia: config.frequencia,
        destinatarios: config.destinatarios
      }
    })
  }

  /**
   * Remover agendamento
   */
  async removerAgendamento(relatorioId: number) {
<<<<<<< HEAD
    await prisma.relatorioPersonalizado.update({
=======
    await (prisma as any).relatorioPersonalizado.update({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      where: { id: relatorioId },
      data: {
        agendado: false,
        proximaExecucao: null
      }
    })
  }

  /**
   * Converter para CSV
   */
  async converterParaCSV(dados: any): Promise<string> {
    // Implementar conversão para CSV
    return JSON.stringify(dados)
  }

  /**
   * Obter detalhes de equipamentos
   */
  private async getDetalhesEquipamentos(empresaId: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      include: {
        _count: {
          select: {
            manutencoes: true,
            apontamentos: true
          }
        }
      }
    })

    return equipamentos.map(eq => ({
      id: eq.id,
      tag: eq.tag,
      nome: eq.nome,
      status: eq.status,
      totalManutencoes: eq._count.manutencoes,
      totalApontamentos: eq._count.apontamentos
    }))
  }

  /**
   * Obter detalhes de obras
   */
  private async getDetalhesObras(empresaId: number, inicio: Date, fim: Date) {
    const obras = await prisma.obra.findMany({
      where: { empresaId },
      include: {
        equipamentos: true,
<<<<<<< HEAD
        frentesServico: true
=======
        frenteServicos: true
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      }
    })

    return obras.map(obra => ({
      id: obra.id,
      nome: obra.nome,
      codigo: obra.codigo,
      status: obra.status,
      totalEquipamentos: obra.equipamentos.length,
<<<<<<< HEAD
      totalFrentes: obra.frentesServico.length
=======
      totalFrentes: obra.frenteServicos.length
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    }))
  }

  /**
   * Obter desempenho por equipamento
   */
  private async getDesempenhoEquipamentos(empresaId: number, inicio: Date, fim: Date) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      include: {
        apontamentos: {
          where: {
            data: { gte: inicio, lte: fim }
          }
        },
        manutencoes: {
          where: {
            dataRealizada: { gte: inicio, lte: fim }
          }
        }
      }
    })

    return equipamentos.map(eq => ({
      id: eq.id,
      tag: eq.tag,
      horasTrabalhadas: eq.apontamentos.reduce((sum, a) => sum + a.horasTrabalhadas, 0),
      totalManutencoes: eq.manutencoes.length,
      custoManutencao: eq.manutencoes.reduce((sum, m) => sum + (m.custo || 0), 0)
    }))
  }

  /**
   * Calcular receitas
   */
  private async calcularReceitas(empresaId: number, inicio: Date, fim: Date) {
    const apontamentos = await prisma.apontamento.findMany({
      where: {
        equipamento: { empresaId },
        data: { gte: inicio, lte: fim }
      },
      include: {
        equipamento: true
      }
    })

    let total = 0
    for (const a of apontamentos) {
      if (a.equipamento.valorLocacaoDiaria) {
        total += (a.horasTrabalhadas / 8) * a.equipamento.valorLocacaoDiaria
      } else if (a.equipamento.valorLocacaoMensal) {
        total += (a.horasTrabalhadas / (8 * 22)) * a.equipamento.valorLocacaoMensal
      }
    }

    return { total }
  }

  /**
   * Calcular depreciação do período
   */
  private async calcularDepreciacaoPeriodo(empresaId: number, inicio: Date, fim: Date) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    let total = 0
    const meses = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30))

    for (const eq of equipamentos) {
      if (eq.valorAquisicao && eq.vidaUtilAnos) {
        const depreciacaoMensal = (eq.valorAquisicao - (eq.valorResidual || 0)) / (eq.vidaUtilAnos * 12)
        total += depreciacaoMensal * meses
      }
    }

    return { total }
  }

  /**
   * Obter custos por tipo
   */
  private async getCustosPorTipo(empresaId: number, inicio: Date, fim: Date) {
    const manutencoes = await prisma.manutencao.groupBy({
      by: ['tipo'],
      where: {
        equipamento: { empresaId },
        dataRealizada: { gte: inicio, lte: fim }
      },
      _sum: { custo: true }
    })

    return manutencoes.map(m => ({
      tipo: m.tipo,
      custo: m._sum.custo || 0
    }))
  }

  /**
   * Obter receitas por obra
   */
  private async getReceitasPorObra(empresaId: number, inicio: Date, fim: Date) {
    const apontamentos = await prisma.apontamento.findMany({
      where: {
        equipamento: { empresaId },
        data: { gte: inicio, lte: fim }
      },
      include: {
        equipamento: true,
        frenteServico: {
          include: {
            obra: true
          }
        }
      }
    })

    const receitasPorObra: Record<string, number> = {}

    for (const a of apontamentos) {
      const obraNome = a.frenteServico?.obra?.nome || 'Sem obra'
      let valor = 0
      
      if (a.equipamento.valorLocacaoDiaria) {
        valor = (a.horasTrabalhadas / 8) * a.equipamento.valorLocacaoDiaria
      } else if (a.equipamento.valorLocacaoMensal) {
        valor = (a.horasTrabalhadas / (8 * 22)) * a.equipamento.valorLocacaoMensal
      }

      receitasPorObra[obraNome] = (receitasPorObra[obraNome] || 0) + valor
    }

    return Object.entries(receitasPorObra).map(([obra, valor]) => ({
      obra,
      receita: valor
    }))
  }

  /**
   * Coletar dados para relatório personalizado
   */
  private async coletarDadosRelatorio(empresaId: number, tipo: string, params: RelatorioParams) {
    switch (tipo) {
      case 'operacional':
        return this.gerarRelatorioOperacional(empresaId, params)
      case 'financeiro':
        return this.gerarRelatorioFinanceiro(empresaId, params)
      case 'manutencao':
        return this.gerarRelatorioManutencao(empresaId, params)
      case 'equipamentos':
        return this.getDetalhesEquipamentos(empresaId)
      case 'obras':
        return this.getDetalhesObras(empresaId, new Date(), new Date())
      default:
        return {}
    }
  }

  /**
   * Aplicar filtros aos dados
   */
  private aplicarFiltros(dados: any, filtros?: Record<string, any>) {
    if (!filtros) return dados
    // Implementar lógica de filtros
    return dados
  }

  /**
   * Agrupar dados
   */
  private agruparDados(dados: any, agrupamento: string) {
    // Implementar lógica de agrupamento
    return dados
  }

  /**
   * Ordenar dados
   */
  private ordenarDados(dados: any, ordenacao: string) {
    // Implementar lógica de ordenação
    return dados
  }

  /**
   * Selecionar colunas
   */
  private selecionarColunas(dados: any, colunas: string[]) {
    // Implementar seleção de colunas
    return dados
  }

  /**
<<<<<<< HEAD
=======
   * Listar relatórios gerenciais
   */
  async listarGerenciais(empresaId: number, params: { page: number; limit: number }) {
    const { page, limit } = params
    const skip = (page - 1) * limit

    const [relatorios, total] = await Promise.all([
      (prisma as any).relatorioLog.findMany({
        where: { empresaId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          usuario: { select: { nome: true } }
        }
      }),
      (prisma as any).relatorioLog.count({ where: { empresaId } })
    ])

    return {
      relatorios,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }

  /**
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
   * Calcular próxima execução
   */
  private calcularProximaExecucao(frequencia: string): Date {
    const agora = new Date()
    
    switch (frequencia) {
      case 'diario':
        return new Date(agora.setDate(agora.getDate() + 1))
      case 'semanal':
        return new Date(agora.setDate(agora.getDate() + 7))
      case 'mensal':
        return new Date(agora.setMonth(agora.getMonth() + 1))
      default:
        return new Date(agora.setDate(agora.getDate() + 1))
    }
  }
}

export const relatorioService = new RelatorioService()