import prisma from '../config/database'

export class FinanceiroService {
  /**
   * Obter dashboard financeiro
   */
  async getDashboard(empresaId: number, periodo: number) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - periodo)

    const [
      equipamentos,
      manutencoes,
      apontamentos,
      receitas
    ] = await Promise.all([
      prisma.equipamento.findMany({
        where: { empresaId }
      }),
      prisma.manutencao.findMany({
        where: {
          equipamento: { empresaId },
          dataRealizada: { gte: dataLimite }
        }
      }),
      prisma.apontamento.findMany({
        where: {
          equipamento: { empresaId },
          data: { gte: dataLimite }
        }
      }),
      this.calcularReceitas(empresaId, periodo)
    ])

    // Calcular patrimônio total
    const patrimonioTotal = equipamentos.reduce((sum, eq) => sum + (eq.valorAquisicao || 0), 0)
    const depreciacaoTotal = equipamentos.reduce((sum, eq) => {
      if (eq.valorAquisicao && eq.dataAquisicao) {
        return sum + this.calcularDepreciacaoEquipamento(eq.id)
      }
      return sum
    }, 0)

    // Calcular custos
    const custoManutencao = manutencoes.reduce((sum, m) => sum + (m.custo || 0), 0)
    const horasTrabalhadas = apontamentos.reduce((sum, a) => sum + a.horasTrabalhadas, 0)
    const custoOperacional = this.calcularCustoOperacional(apontamentos)

    // Calcular receitas
    const receitaLocacao = receitas.locacao
    const receitaTotal = receitaLocacao

    // Calcular indicadores
    const margem = receitaTotal > 0 ? ((receitaTotal - custoManutencao - custoOperacional) / receitaTotal) * 100 : 0
    const roi = patrimonioTotal > 0 ? (receitaTotal / patrimonioTotal) * 100 : 0
    const payback = receitaTotal > 0 ? patrimonioTotal / (receitaTotal / 12) : 0

    return {
      patrimonio: {
        total: patrimonioTotal,
        depreciado: patrimonioTotal - depreciacaoTotal,
        depreciacaoAcumulada: depreciacaoTotal,
        quantidadeEquipamentos: equipamentos.length
      },
      custos: {
        manutencao: custoManutencao,
        operacional: custoOperacional,
        total: custoManutencao + custoOperacional,
        porHora: horasTrabalhadas > 0 ? (custoManutencao + custoOperacional) / horasTrabalhadas : 0
      },
      receitas: {
        locacao: receitaLocacao,
        total: receitaTotal,
        porHora: horasTrabalhadas > 0 ? receitaTotal / horasTrabalhadas : 0
      },
      indicadores: {
        margem,
        roi,
        payback,
        lucroLiquido: receitaTotal - custoManutencao - custoOperacional
      },
      historico: await this.calcularHistoricoFinanceiro(empresaId, periodo)
    }
  }

  /**
   * Obter análise de depreciação
   */
  async getAnaliseDepreciacao(empresaId: number, periodo: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    const depreciacoes = await Promise.all(
      equipamentos.map(async (eq) => ({
        equipamento: eq,
        depreciacao: await this.calcularDepreciacaoEquipamento(eq.id)
      }))
    )

    const totalAquisicao = equipamentos.reduce((sum, eq) => sum + (eq.valorAquisicao || 0), 0)
    const totalDepreciado = depreciacoes.reduce((sum, d) => sum + d.depreciacao, 0)
    const valorAtual = totalAquisicao - totalDepreciado

    // Agrupar por classe
    const porClasse = await this.agruparDepreciacaoPorClasse(empresaId)

    return {
      resumo: {
        totalEquipamentos: equipamentos.length,
        valorAquisicao: totalAquisicao,
        depreciacaoAcumulada: totalDepreciado,
        valorAtual,
        percentualDepreciado: totalAquisicao > 0 ? (totalDepreciado / totalAquisicao) * 100 : 0
      },
      porClasse,
      equipamentos: depreciacoes,
      historico: await this.calcularHistoricoDepreciacao(empresaId, periodo)
    }
  }

  /**
   * Calcular depreciação de equipamento
   */
  async calcularDepreciacaoEquipamento(equipamentoId: number): Promise<number> {
    const equipamento = await prisma.equipamento.findUnique({
      where: { id: equipamentoId }
    })

    if (!equipamento || !equipamento.valorAquisicao || !equipamento.dataAquisicao) {
      return 0
    }

    const vidaUtil = equipamento.vidaUtilAnos || 5
    const valorResidual = equipamento.valorResidual || 0
    const valorDepreciavel = equipamento.valorAquisicao - valorResidual
    const depreciacaoAnual = valorDepreciavel / vidaUtil

    const mesesDesdeAquisicao = Math.floor(
      (Date.now() - new Date(equipamento.dataAquisicao).getTime()) / (1000 * 60 * 60 * 24 * 30)
    )

    const anos = Math.min(mesesDesdeAquisicao / 12, vidaUtil)
    return depreciacaoAnual * anos
  }

  /**
   * Calcular depreciação por classe
   */
  async calcularDepreciacaoClasse(empresaId: number, tipo: string) {
    const equipamentos = await prisma.equipamento.findMany({
      where: {
        empresaId,
        tipo
      }
    })

    let totalAquisicao = 0
    let totalDepreciado = 0

    for (const eq of equipamentos) {
      totalAquisicao += eq.valorAquisicao || 0
      totalDepreciado += await this.calcularDepreciacaoEquipamento(eq.id)
    }

    return {
      totalEquipamentos: equipamentos.length,
      valorAquisicao: totalAquisicao,
      depreciacaoAcumulada: totalDepreciado,
      valorAtual: totalAquisicao - totalDepreciado
    }
  }

  /**
   * Obter análise de patrimônio
   */
  async getAnalisePatrimonio(empresaId: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      include: {
        obra: {
          select: { id: true, nome: true }
        }
      }
    })

    let valorTotal = 0
    let depreciacaoTotal = 0
    const porStatus: Record<string, { quantidade: number; valor: number }> = {}
    const porObra: Record<string, { quantidade: number; valor: number }> = {}

    for (const eq of equipamentos) {
      const valor = eq.valorAquisicao || 0
      const depreciacao = await this.calcularDepreciacaoEquipamento(eq.id)

      valorTotal += valor
      depreciacaoTotal += depreciacao

      // Por status
      if (!porStatus[eq.status]) {
        porStatus[eq.status] = { quantidade: 0, valor: 0 }
      }
      porStatus[eq.status].quantidade++
      porStatus[eq.status].valor += valor - depreciacao

      // Por obra
      if (eq.obra) {
        if (!porObra[eq.obra.nome]) {
          porObra[eq.obra.nome] = { quantidade: 0, valor: 0 }
        }
        porObra[eq.obra.nome].quantidade++
        porObra[eq.obra.nome].valor += valor - depreciacao
      }
    }

    return {
      resumo: {
        totalEquipamentos: equipamentos.length,
        valorTotal,
        depreciacaoTotal,
        valorLiquido: valorTotal - depreciacaoTotal
      },
      porStatus,
      porObra,
      equipamentos: equipamentos.map(eq => ({
        id: eq.id,
        tag: eq.tag,
        nome: eq.nome,
        valorAquisicao: eq.valorAquisicao,
        valorAtual: (eq.valorAquisicao || 0) - (this.calcularDepreciacaoEquipamento(eq.id) || 0),
        obra: eq.obra?.nome
      }))
    }
  }

  /**
   * Gerar relatório de patrimônio
   */
  async gerarRelatorioPatrimonio(empresaId: number) {
    const patrimonio = await this.getAnalisePatrimonio(empresaId)
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { nome: true, cnpj: true }
    })

    return {
      empresa,
      data: new Date(),
      ...patrimonio
    }
  }

  /**
   * Obter análise de custos
   */
  async getAnaliseCustos(empresaId: number, periodo: number) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - periodo)

    const [manutencoes, apontamentos] = await Promise.all([
      prisma.manutencao.findMany({
        where: {
          equipamento: { empresaId },
          dataRealizada: { gte: dataLimite }
        },
        include: {
          equipamento: {
            select: { id: true, tag: true, nome: true, tipo: true }
          },
          itens: true
        }
      }),
      prisma.apontamento.findMany({
        where: {
          equipamento: { empresaId },
          data: { gte: dataLimite }
        },
        include: {
          equipamento: {
            select: { id: true, tag: true, nome: true }
          }
        }
      })
    ])

    // Custos por tipo
    const custoPorTipo = {
      preventiva: 0,
      corretiva: 0,
      preditiva: 0
    }

    // Custos por equipamento
    const custoPorEquipamento: Record<number, { tag: string; nome: string; custo: number }> = {}

    for (const m of manutencoes) {
      custoPorTipo[m.tipo as keyof typeof custoPorTipo] += m.custo || 0

      if (!custoPorEquipamento[m.equipamento.id]) {
        custoPorEquipamento[m.equipamento.id] = {
          tag: m.equipamento.tag,
          nome: m.equipamento.nome,
          custo: 0
        }
      }
      custoPorEquipamento[m.equipamento.id].custo += m.custo || 0
    }

    // Custos operacionais (combustível)
    const custoCombustivel = apontamentos.reduce((sum, a) => {
      // Assumindo R$ 5,00 por litro
      return sum + (a.combustivelLitros || 0) * 5
    }, 0)

    const totalCustos = manutencoes.reduce((sum, m) => sum + (m.custo || 0), 0) + custoCombustivel

    return {
      resumo: {
        total: totalCustos,
        manutencao: totalCustos - custoCombustivel,
        combustivel: custoCombustivel
      },
      porTipo: custoPorTipo,
      porEquipamento: Object.values(custoPorEquipamento).sort((a, b) => b.custo - a.custo),
      historico: await this.calcularHistoricoCustos(empresaId, periodo)
    }
  }

  /**
   * Calcular custos por equipamento
   */
  async calcularCustosEquipamento(equipamentoId: number, periodo: number) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - periodo)

    const [manutencoes, apontamentos] = await Promise.all([
      prisma.manutencao.findMany({
        where: {
          equipamentoId,
          dataRealizada: { gte: dataLimite }
        }
      }),
      prisma.apontamento.findMany({
        where: {
          equipamentoId,
          data: { gte: dataLimite }
        }
      })
    ])

    const custoManutencao = manutencoes.reduce((sum, m) => sum + (m.custo || 0), 0)
    const horasTrabalhadas = apontamentos.reduce((sum, a) => sum + a.horasTrabalhadas, 0)
    const custoCombustivel = apontamentos.reduce((sum, a) => {
      return sum + (a.combustivelLitros || 0) * 5
    }, 0)

    const total = custoManutencao + custoCombustivel

    return {
      total,
      manutencao: custoManutencao,
      combustivel: custoCombustivel,
      porHora: horasTrabalhadas > 0 ? total / horasTrabalhadas : 0,
      horasTrabalhadas
    }
  }

  /**
   * Obter análise de receitas
   */
  async getAnaliseReceitas(empresaId: number, periodo: number) {
    const receitas = await this.calcularReceitas(empresaId, periodo)
    const projecao = await this.calcularProjecaoReceitas(empresaId)

    return {
      ...receitas,
      projecao
    }
  }

  /**
   * Calcular receitas
   */
  async calcularReceitas(empresaId: number, periodo: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    const apontamentos = await prisma.apontamento.findMany({
      where: {
        equipamento: { empresaId },
        data: {
          gte: new Date(Date.now() - periodo * 24 * 60 * 60 * 1000)
        }
      }
    })

    let receitaLocacao = 0
    let horasLocacao = 0

    for (const eq of equipamentos) {
      const apontamentosEq = apontamentos.filter(a => a.equipamentoId === eq.id)
      const horas = apontamentosEq.reduce((sum, a) => sum + a.horasTrabalhadas, 0)
      
      if (eq.valorLocacaoDiaria) {
        receitaLocacao += (horas / 8) * eq.valorLocacaoDiaria
      } else if (eq.valorLocacaoMensal) {
        receitaLocacao += (horas / (8 * 22)) * eq.valorLocacaoMensal
      }

      horasLocacao += horas
    }

    return {
      locacao: receitaLocacao,
      horas: horasLocacao,
      mediaHora: horasLocacao > 0 ? receitaLocacao / horasLocacao : 0
    }
  }

  /**
   * Calcular fluxo de caixa
   */
  async calcularFluxoCaixa(empresaId: number, periodo: number) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - periodo)

    const entradas = await this.calcularReceitas(empresaId, periodo)
    const saidas = await this.getAnaliseCustos(empresaId, periodo)

    const fluxo = []
    const hoje = new Date()

    for (let i = periodo; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      // Simular fluxo diário (em produção, usar dados reais)
      fluxo.push({
        data: data.toISOString().split('T')[0],
        entradas: entradas.locacao / periodo,
        saidas: saidas.resumo.total / periodo,
        saldo: (entradas.locacao - saidas.resumo.total) / periodo
      })
    }

    return {
      resumo: {
        entradas: entradas.locacao,
        saidas: saidas.resumo.total,
        saldo: entradas.locacao - saidas.resumo.total
      },
      historico: fluxo
    }
  }

  /**
   * Calcular projeções financeiras
   */
  async calcularProjecoes(empresaId: number, meses: number) {
    const historico = await this.calcularHistoricoFinanceiro(empresaId, 30)
    
    if (historico.length === 0) {
      return { projecao: [], tendencia: 'estavel' }
    }

    const mediaMensal = historico.reduce((sum, h) => sum + h.saldo, 0) / historico.length
    const projecao = []

    for (let i = 1; i <= meses; i++) {
      const data = new Date()
      data.setMonth(data.getMonth() + i)
      
      projecao.push({
        mes: data.toISOString().split('T')[0].substring(0, 7),
        receita: mediaMensal * (1 + i * 0.02), // Crescimento de 2% ao mês
        custo: mediaMensal * 0.7, // 70% da receita
        lucro: mediaMensal * 0.3 * (1 + i * 0.02)
      })
    }

    return projecao
  }

  /**
   * Gerar relatório financeiro completo
   */
  async gerarRelatorioFinanceiro(empresaId: number, tipo: string, periodo: number) {
    const dashboard = await this.getDashboard(empresaId, periodo)
    const patrimonio = await this.getAnalisePatrimonio(empresaId)
    const custos = await this.getAnaliseCustos(empresaId, periodo)
    const receitas = await this.getAnaliseReceitas(empresaId, periodo)
    const fluxo = await this.calcularFluxoCaixa(empresaId, periodo)

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { nome: true, cnpj: true }
    })

    return {
      empresa,
      data: new Date(),
      tipo,
      periodo,
      dashboard,
      patrimonio,
      custos,
      receitas,
      fluxo
    }
  }

  /**
   * Calcular custo operacional
   */
  private calcularCustoOperacional(apontamentos: any[]): number {
    // Implementar cálculo baseado em consumo de combustível, etc
    return apontamentos.reduce((sum, a) => {
      return sum + (a.combustivelLitros || 0) * 5 // R$ 5 por litro
    }, 0)
  }

  /**
   * Calcular depreciação mensal
   */
  private calcularDepreciacaoMensal(equipamento: any): number {
    if (!equipamento.valorAquisicao || !equipamento.vidaUtilAnos) return 0
    const valorDepreciavel = equipamento.valorAquisicao - (equipamento.valorResidual || 0)
    return valorDepreciavel / (equipamento.vidaUtilAnos * 12)
  }

  /**
   * Agrupar depreciação por classe
   */
  private async agruparDepreciacaoPorClasse(empresaId: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      select: { tipo: true }
    })

    const tipos = [...new Set(equipamentos.map(e => e.tipo))]
    const resultado = []

    for (const tipo of tipos) {
      const dados = await this.calcularDepreciacaoClasse(empresaId, tipo)
      resultado.push({
        tipo,
        ...dados
      })
    }

    return resultado
  }

  /**
   * Calcular histórico financeiro
   */
  private async calcularHistoricoFinanceiro(empresaId: number, dias: number) {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      // Simular dados históricos
      historico.push({
        data: data.toISOString().split('T')[0],
        receita: Math.random() * 5000 + 1000,
        custo: Math.random() * 3000 + 500,
        saldo: Math.random() * 2000 + 500
      })
    }

    return historico
  }

  /**
   * Calcular histórico de depreciação
   */
  private async calcularHistoricoDepreciacao(empresaId: number, dias: number) {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.random() * 10000 + 50000
      })
    }

    return historico
  }

  /**
   * Calcular histórico de custos
   */
  private async calcularHistoricoCustos(empresaId: number, dias: number) {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.random() * 2000 + 500
      })
    }

    return historico
  }

  /**
   * Calcular projeção de receitas
   */
  private async calcularProjecaoReceitas(empresaId: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    const receitaPotencial = equipamentos.reduce((sum, eq) => {
      if (eq.valorLocacaoDiaria) {
        return sum + eq.valorLocacaoDiaria * 22 // 22 dias úteis
      }
      if (eq.valorLocacaoMensal) {
        return sum + eq.valorLocacaoMensal
      }
      return sum
    }, 0)

    return {
      potencial: receitaPotencial,
      estimado: receitaPotencial * 0.8 // 80% de ocupação
    }
  }
}

export const financeiroService = new FinanceiroService()