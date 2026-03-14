import prisma from '../config/database'

export class IndicadorService {
  /**
   * Calcular IHO (Índice de Saúde Operacional) geral
   */
  async calcularIHOGeral(empresaId: number): Promise<{
    valor: number
    classificacao: 'otimo' | 'bom' | 'regular' | 'ruim' | 'pessimo'
    tendencia: 'subindo' | 'estavel' | 'descendo'
  }> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      include: {
        manutencoes: {
          where: {
            status: 'concluida',
            dataRealizada: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        apontamentos: {
          where: {
            data: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    if (equipamentos.length === 0) {
      return { valor: 0, classificacao: 'pessimo', tendencia: 'estavel' }
    }

    let somaIHO = 0
    for (const equipamento of equipamentos) {
      const iho = await this.calcularIHOPorEquipamento(equipamento.id, 30)
      somaIHO += iho.atual
    }

    const valor = somaIHO / equipamentos.length
    const classificacao = this.classificarIHO(valor)
    const tendencia = await this.calcularTendenciaIHO(empresaId)

    return { valor, classificacao, tendencia }
  }

  /**
   * Calcular IHO detalhado
   */
  async calcularIHODetalhado(empresaId: number, periodo: number): Promise<any> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    const ihoEquipamentos = await Promise.all(
      equipamentos.map(async (eq) => ({
        equipamento: eq,
        iho: await this.calcularIHOPorEquipamento(eq.id, periodo)
      }))
    )

    const ihoPorTipo = await this.agruparIHOPorTipo(empresaId, periodo)
    const ihoPorStatus = await this.agruparIHOPorStatus(empresaId, periodo)
    const historico = await this.calcularIHOHistorico(empresaId, 30)

    return {
      geral: await this.calcularIHOGeral(empresaId),
      equipamentos: ihoEquipamentos,
      porTipo: ihoPorTipo,
      porStatus: ihoPorStatus,
      historico
    }
  }

  /**
   * Calcular IHO por equipamento
   */
  async calcularIHOPorEquipamento(equipamentoId: number, periodo: number): Promise<{
    atual: number
    tendencia: number
    componentes: {
      disponibilidade: number
      performance: number
      qualidade: number
      custo: number
      seguranca: number
    }
  }> {
    const dataLimite = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000)

    const [
      disponibilidade,
      performance,
      manutencoes,
      apontamentos,
      historico
    ] = await Promise.all([
      this.calcularDisponibilidadePorEquipamento(equipamentoId, periodo),
      this.calcularPerformancePorEquipamento(equipamentoId, periodo),
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
      }),
      prisma.historicoEquipamento.findMany({
        where: {
          equipamentoId,
          data: { gte: dataLimite }
        }
      })
    ])

    // Calcular componentes do IHO
    const disp = disponibilidade.atual / 100
    const perf = performance.atual / 100
    
    // Qualidade baseada em falhas e paradas não programadas
    const falhas = manutencoes.filter(m => m.tipo === 'corretiva').length
    const qualidade = Math.max(0, 100 - (falhas * 5))
    
    // Custo baseado em custo por hora operada
    const horasTotais = apontamentos.reduce((sum, a) => sum + a.horasTrabalhadas, 0)
    const custoManutencao = manutencoes.reduce((sum, m) => sum + (m.custo || 0), 0)
    const custo = horasTotais > 0 
      ? Math.max(0, 100 - (custoManutencao / horasTotais / 10))
      : 50
    
    // Segurança baseada em incidentes
    const incidentes = historico.filter(h => 
      h.descricao.toLowerCase().includes('incidente') ||
      h.descricao.toLowerCase().includes('acidente')
    ).length
    const seguranca = Math.max(0, 100 - (incidentes * 20))

    const atual = Math.round(
      (disp * 0.3 + perf * 0.25 + qualidade * 0.2 + custo * 0.15 + seguranca * 0.1)
    )

    // Calcular tendência
    const ihoAnterior = await this.calcularIHOPeriodoAnterior(equipamentoId, periodo)
    const tendencia = atual - ihoAnterior

    return {
      atual,
      tendencia,
      componentes: {
        disponibilidade: disp,
        performance: perf,
        qualidade,
        custo,
        seguranca
      }
    }
  }

  /**
   * Calcular IHO por classe de equipamento
   */
  async calcularIHOPorClasse(empresaId: number, tipo: string, periodo: number): Promise<any> {
    const equipamentos = await prisma.equipamento.findMany({
      where: {
        empresaId,
        tipo
      }
    })

    if (equipamentos.length === 0) return null

    let somaIHO = 0
    for (const eq of equipamentos) {
      const iho = await this.calcularIHOPorEquipamento(eq.id, periodo)
      somaIHO += iho.atual
    }

    return somaIHO / equipamentos.length
  }

  /**
   * Calcular IHO por obra
   */
  async calcularIHOPorObra(obraId: number, periodo: number): Promise<number> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { obraId }
    })

    if (equipamentos.length === 0) return 0

    let somaIHO = 0
    for (const eq of equipamentos) {
      const iho = await this.calcularIHOPorEquipamento(eq.id, periodo)
      somaIHO += iho.atual
    }

    return somaIHO / equipamentos.length
  }

  /**
   * Calcular IHO por centro de custo
   */
  async calcularIHOPorCentroCusto(centroCustoId: number, periodo: number): Promise<number> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { centroCustoId }
    })

    if (equipamentos.length === 0) return 0

    let somaIHO = 0
    for (const eq of equipamentos) {
      const iho = await this.calcularIHOPorEquipamento(eq.id, periodo)
      somaIHO += iho.atual
    }

    return somaIHO / equipamentos.length
  }

  /**
   * Calcular histórico de IHO
   */
  async calcularIHOHistorico(empresaId: number, dias: number): Promise<any[]> {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      // Simular cálculo para data específica
      // Em produção, usaria dados históricos reais
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.floor(Math.random() * 30) + 60 // 60-90
      })
    }

    return historico
  }

  /**
   * Calcular histórico de IHO por equipamento
   */
  async calcularIHOHistoricoEquipamento(equipamentoId: number, dias: number): Promise<any[]> {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.floor(Math.random() * 30) + 60
      })
    }

    return historico
  }

  /**
   * Calcular disponibilidade geral
   */
  async calcularDisponibilidadeGeral(empresaId: number): Promise<{
    valor: number
    tendencia: 'subindo' | 'estavel' | 'descendo'
  }> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      include: {
        apontamentos: {
          where: {
            data: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        manutencoes: {
          where: {
            status: 'concluida',
            dataRealizada: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    if (equipamentos.length === 0) {
      return { valor: 0, tendencia: 'estavel' }
    }

    let totalHoras = 0
    let totalParadas = 0

    for (const eq of equipamentos) {
      const horasTrabalhadas = eq.apontamentos.reduce((sum, a) => sum + a.horasTrabalhadas, 0)
      const horasParada = eq.manutencoes.reduce((sum, m) => {
        if (m.dataRealizada && m.dataProgramada) {
          const diff = m.dataRealizada.getTime() - m.dataProgramada.getTime()
          return sum + (diff / (1000 * 60 * 60))
        }
        return sum
      }, 0)

      totalHoras += horasTrabalhadas
      totalParadas += horasParada
    }

    const horasDisponiveis = totalHoras * 24 // 24h por dia
    const valor = horasDisponiveis > 0 
      ? ((horasDisponiveis - totalParadas) / horasDisponiveis) * 100
      : 0

    return {
      valor: Math.round(valor),
      tendencia: 'estavel'
    }
  }

  /**
   * Calcular disponibilidade detalhada
   */
  async calcularDisponibilidadeDetalhada(empresaId: number, periodo: number): Promise<any> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    const disponibilidadeEquipamentos = await Promise.all(
      equipamentos.map(async (eq) => ({
        equipamento: eq,
        disponibilidade: await this.calcularDisponibilidadePorEquipamento(eq.id, periodo)
      }))
    )

    return {
      geral: await this.calcularDisponibilidadeGeral(empresaId),
      equipamentos: disponibilidadeEquipamentos,
      historico: await this.calcularDisponibilidadeHistorico(empresaId, 30)
    }
  }

  /**
   * Calcular disponibilidade por equipamento
   */
  async calcularDisponibilidadePorEquipamento(equipamentoId: number, periodo: number): Promise<{
    atual: number
    tendencia: number
    paradas: Array<{
      tipo: string
      horas: number
      custo: number
    }>
  }> {
    const dataLimite = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000)

    const [apontamentos, manutencoes] = await Promise.all([
      prisma.apontamento.findMany({
        where: {
          equipamentoId,
          data: { gte: dataLimite }
        }
      }),
      prisma.manutencao.findMany({
        where: {
          equipamentoId,
          dataRealizada: { gte: dataLimite }
        }
      })
    ])

    const horasTrabalhadas = apontamentos.reduce((sum, a) => sum + a.horasTrabalhadas, 0)
    
    const paradas = manutencoes.map(m => ({
      tipo: m.tipo,
      horas: m.dataRealizada && m.dataProgramada 
        ? (m.dataRealizada.getTime() - m.dataProgramada.getTime()) / (1000 * 60 * 60)
        : 0,
      custo: m.custo || 0
    }))

    const totalParadas = paradas.reduce((sum, p) => sum + p.horas, 0)
    const horasDisponiveis = horasTrabalhadas * 24
    const atual = horasDisponiveis > 0 
      ? ((horasDisponiveis - totalParadas) / horasDisponiveis) * 100
      : 100

    return {
      atual: Math.round(atual),
      tendencia: 0,
      paradas
    }
  }

  /**
   * Calcular performance geral
   */
  async calcularPerformanceGeral(empresaId: number): Promise<{
    valor: number
    tendencia: 'subindo' | 'estavel' | 'descendo'
  }> {
    // Implementar cálculo de performance
    return {
      valor: 85,
      tendencia: 'estavel'
    }
  }

  /**
   * Calcular performance detalhada
   */
  async calcularPerformanceDetalhada(empresaId: number, periodo: number): Promise<any> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    const performanceEquipamentos = await Promise.all(
      equipamentos.map(async (eq) => ({
        equipamento: eq,
        performance: await this.calcularPerformancePorEquipamento(eq.id, periodo)
      }))
    )

    return {
      geral: await this.calcularPerformanceGeral(empresaId),
      equipamentos: performanceEquipamentos,
      historico: await this.calcularPerformanceHistorico(empresaId, 30)
    }
  }

  /**
   * Calcular performance por equipamento
   */
  async calcularPerformancePorEquipamento(equipamentoId: number, periodo: number): Promise<{
    atual: number
    tendencia: number
    metricas: {
      produtividade: number
      eficiencia: number
      utilizacao: number
    }
  }> {
    // Implementar cálculo de performance
    return {
      atual: 85,
      tendencia: 0,
      metricas: {
        produtividade: 80,
        eficiencia: 85,
        utilizacao: 90
      }
    }
  }

  /**
   * Calcular MTBF geral
   */
  async calcularMTBFGeral(empresaId: number): Promise<{
    valor: number
    tendencia: 'subindo' | 'estavel' | 'descendo'
  }> {
    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        tipo: 'corretiva',
        status: 'concluida',
        dataRealizada: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const equipamentos = await prisma.equipamento.count({
      where: { empresaId }
    })

    if (equipamentos === 0 || manutencoes.length === 0) {
      return { valor: 0, tendencia: 'estavel' }
    }

    const horasOperacao = 30 * 24 * equipamentos
    const mtbf = horasOperacao / manutencoes.length

    return {
      valor: Math.round(mtbf),
      tendencia: 'estavel'
    }
  }

  /**
   * Calcular MTBF detalhado
   */
  async calcularMTBFDetalhado(empresaId: number, periodo: number): Promise<any> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    const mtbfEquipamentos = await Promise.all(
      equipamentos.map(async (eq) => ({
        equipamento: eq,
        mtbf: await this.calcularMTBFPorEquipamento(eq.id, periodo)
      }))
    )

    return {
      geral: await this.calcularMTBFGeral(empresaId),
      equipamentos: mtbfEquipamentos,
      historico: await this.calcularMTBFHistorico(empresaId, 30)
    }
  }

  /**
   * Calcular MTBF por equipamento
   */
  async calcularMTBFPorEquipamento(equipamentoId: number, periodo: number): Promise<{
    atual: number
    tendencia: number
    falhas: Array<{
      data: Date
      descricao: string
      tempoParada: number
    }>
  }> {
    const dataLimite = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000)

    const falhas = await prisma.manutencao.findMany({
      where: {
        equipamentoId,
        tipo: 'corretiva',
        status: 'concluida',
        dataRealizada: { gte: dataLimite }
      },
      orderBy: { dataRealizada: 'asc' }
    })

    if (falhas.length === 0) {
      return { atual: periodo * 24, tendencia: 0, falhas: [] }
    }

    const horasOperacao = periodo * 24
    const mtbf = horasOperacao / falhas.length

    return {
      atual: Math.round(mtbf),
      tendencia: 0,
      falhas: falhas.map(f => ({
        data: f.dataRealizada!,
        descricao: f.descricao,
        tempoParada: f.dataRealizada && f.dataProgramada
          ? (f.dataRealizada.getTime() - f.dataProgramada.getTime()) / (1000 * 60 * 60)
          : 0
      }))
    }
  }

  /**
   * Calcular MTTR geral
   */
  async calcularMTTRGeral(empresaId: number): Promise<{
    valor: number
    tendencia: 'subindo' | 'estavel' | 'descendo'
  }> {
    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        tipo: 'corretiva',
        status: 'concluida',
        dataRealizada: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    if (manutencoes.length === 0) {
      return { valor: 0, tendencia: 'estavel' }
    }

    let somaTempos = 0
    for (const m of manutencoes) {
      if (m.dataRealizada && m.dataProgramada) {
        somaTempos += (m.dataRealizada.getTime() - m.dataProgramada.getTime()) / (1000 * 60 * 60)
      }
    }

    const mttr = somaTempos / manutencoes.length

    return {
      valor: Math.round(mttr),
      tendencia: 'estavel'
    }
  }

  /**
   * Calcular MTTR detalhado
   */
  async calcularMTTRDetalhado(empresaId: number, periodo: number): Promise<any> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId }
    })

    const mttrEquipamentos = await Promise.all(
      equipamentos.map(async (eq) => ({
        equipamento: eq,
        mttr: await this.calcularMTTRPorEquipamento(eq.id, periodo)
      }))
    )

    return {
      geral: await this.calcularMTTRGeral(empresaId),
      equipamentos: mttrEquipamentos,
      historico: await this.calcularMTTRHistorico(empresaId, 30)
    }
  }

  /**
   * Calcular MTTR por equipamento
   */
  async calcularMTTRPorEquipamento(equipamentoId: number, periodo: number): Promise<{
    atual: number
    tendencia: number
    reparos: Array<{
      data: Date
      descricao: string
      tempoReparo: number
      custo: number
    }>
  }> {
    const dataLimite = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000)

    const reparos = await prisma.manutencao.findMany({
      where: {
        equipamentoId,
        tipo: 'corretiva',
        status: 'concluida',
        dataRealizada: { gte: dataLimite }
      }
    })

    if (reparos.length === 0) {
      return { atual: 0, tendencia: 0, reparos: [] }
    }

    let somaTempos = 0
    for (const r of reparos) {
      if (r.dataRealizada && r.dataProgramada) {
        somaTempos += (r.dataRealizada.getTime() - r.dataProgramada.getTime()) / (1000 * 60 * 60)
      }
    }

    const mttr = somaTempos / reparos.length

    return {
      atual: Math.round(mttr),
      tendencia: 0,
      reparos: reparos.map(r => ({
        data: r.dataRealizada!,
        descricao: r.descricao,
        tempoReparo: r.dataRealizada && r.dataProgramada
          ? (r.dataRealizada.getTime() - r.dataProgramada.getTime()) / (1000 * 60 * 60)
          : 0,
        custo: r.custo || 0
      }))
    }
  }

  /**
   * Calcular custos de manutenção
   */
  async calcularCustos(empresaId: number): Promise<{
    total: number
    porTipo: {
      preventiva: number
      corretiva: number
      preditiva: number
    }
    porEquipamento: Array<{
      equipamentoId: number
      equipamentoTag: string
      custo: number
    }>
  }> {
    const dataLimite = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        dataRealizada: { gte: dataLimite }
      },
      include: {
        equipamento: {
          select: { id: true, tag: true }
        }
      }
    })

    let total = 0
    let preventiva = 0
    let corretiva = 0
    let preditiva = 0
    const porEquipamento: Record<number, { tag: string; custo: number }> = {}

    for (const m of manutencoes) {
      const custo = m.custo || 0
      total += custo

      if (m.tipo === 'preventiva') preventiva += custo
      else if (m.tipo === 'corretiva') corretiva += custo
      else if (m.tipo === 'preditiva') preditiva += custo

      if (!porEquipamento[m.equipamentoId]) {
        porEquipamento[m.equipamentoId] = {
          tag: m.equipamento.tag,
          custo: 0
        }
      }
      porEquipamento[m.equipamentoId].custo += custo
    }

    return {
      total,
      porTipo: { preventiva, corretiva, preditiva },
      porEquipamento: Object.entries(porEquipamento).map(([id, data]) => ({
        equipamentoId: parseInt(id),
        equipamentoTag: data.tag,
        custo: data.custo
      }))
    }
  }

  /**
   * Calcular custos detalhados
   */
  async calcularCustosDetalhados(empresaId: number, periodo: number): Promise<any> {
    const custos = await this.calcularCustos(empresaId)
    
    const historico = []
    const hoje = new Date()

    for (let i = periodo; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.floor(Math.random() * 5000) + 1000
      })
    }

    return {
      ...custos,
      historico,
      projecao: historico[historico.length - 1]?.valor * 1.1 || 0
    }
  }

  /**
   * Obter alertas
   */
  async obterAlertas(empresaId: number): Promise<any[]> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      include: {
        manutencoes: {
          where: {
            status: 'programada',
            dataProgramada: {
              lt: new Date()
            }
          }
        }
      }
    })

    const alertas = []

    for (const eq of equipamentos) {
      // Alertas de manutenção atrasada
      for (const m of eq.manutencoes) {
        const diasAtraso = Math.floor(
<<<<<<< HEAD
          (Date.now() - m.dataProgramada.getTime()) / (1000 * 60 * 60 * 24)
=======
          (Date.now() - m.dataProgramada!.getTime()) / (1000 * 60 * 60 * 24)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        )

        alertas.push({
          tipo: 'manutencao_atrasada',
          gravidade: diasAtraso > 7 ? 'alta' : diasAtraso > 3 ? 'media' : 'baixa',
          equipamento: eq.tag,
          descricao: `Manutenção ${m.tipo} atrasada há ${diasAtraso} dias`,
          data: m.dataProgramada
        })
      }

      // Alertas de consumo de combustível
      const apontamentos = await prisma.apontamento.findMany({
        where: {
          equipamentoId: eq.id,
          data: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })

      if (apontamentos.length > 0) {
        const consumoMedio = apontamentos.reduce((sum, a) => sum + (a.combustivelLitros || 0), 0) / apontamentos.length
        if (consumoMedio > 100) { // Threshold configurável
          alertas.push({
            tipo: 'consumo_alto',
            gravidade: 'media',
            equipamento: eq.tag,
            descricao: `Consumo médio de combustível acima do esperado: ${consumoMedio.toFixed(2)}L/dia`,
            valor: consumoMedio
          })
        }
      }
    }

    return alertas.sort((a, b) => {
      const gravidade = { alta: 3, media: 2, baixa: 1 }
      return gravidade[b.gravidade as keyof typeof gravidade] - gravidade[a.gravidade as keyof typeof gravidade]
    })
  }

  /**
   * Obter alertas detalhados
   */
  async obterAlertasDetalhados(empresaId: number): Promise<any> {
    const alertas = await this.obterAlertas(empresaId)

    return {
      total: alertas.length,
      porGravidade: {
        alta: alertas.filter(a => a.gravidade === 'alta').length,
        media: alertas.filter(a => a.gravidade === 'media').length,
        baixa: alertas.filter(a => a.gravidade === 'baixa').length
      },
      porTipo: {
        manutencao_atrasada: alertas.filter(a => a.tipo === 'manutencao_atrasada').length,
        consumo_alto: alertas.filter(a => a.tipo === 'consumo_alto').length
      },
      lista: alertas
    }
  }

  /**
   * Calcular todos os indicadores
   */
  async calcularTodosIndicadores(empresaId: number, periodo: number): Promise<any> {
    const [
      iho,
      disponibilidade,
      performance,
      mtbf,
      mttr,
      custos,
      alertas
    ] = await Promise.all([
      this.calcularIHODetalhado(empresaId, periodo),
      this.calcularDisponibilidadeDetalhada(empresaId, periodo),
      this.calcularPerformanceDetalhada(empresaId, periodo),
      this.calcularMTBFDetalhado(empresaId, periodo),
      this.calcularMTTRDetalhado(empresaId, periodo),
      this.calcularCustosDetalhados(empresaId, periodo),
      this.obterAlertasDetalhados(empresaId)
    ])

    return {
      iho,
      disponibilidade,
      performance,
      mtbf,
      mttr,
      custos,
      alertas,
      timestamp: new Date()
    }
  }

  /**
   * Classificar IHO
   */
  private classificarIHO(valor: number): 'otimo' | 'bom' | 'regular' | 'ruim' | 'pessimo' {
    if (valor >= 90) return 'otimo'
    if (valor >= 75) return 'bom'
    if (valor >= 60) return 'regular'
    if (valor >= 40) return 'ruim'
    return 'pessimo'
  }

  /**
   * Calcular tendência de IHO
   */
  private async calcularTendenciaIHO(empresaId: number): Promise<'subindo' | 'estavel' | 'descendo'> {
    const historico = await this.calcularIHOHistorico(empresaId, 7)
    
    if (historico.length < 2) return 'estavel'

    const primeiro = historico[0].valor
    const ultimo = historico[historico.length - 1].valor
    const diferenca = ultimo - primeiro

    if (diferenca > 2) return 'subindo'
    if (diferenca < -2) return 'descendo'
    return 'estavel'
  }

  /**
   * Calcular IHO do período anterior
   */
  private async calcularIHOPeriodoAnterior(equipamentoId: number, periodo: number): Promise<number> {
    // Implementar cálculo com dados do período anterior
    return 70
  }

  /**
   * Agrupar IHO por tipo
   */
  private async agruparIHOPorTipo(empresaId: number, periodo: number): Promise<any[]> {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      select: { tipo: true }
    })

    const tipos = [...new Set(equipamentos.map(e => e.tipo))]
    const resultado = []

    for (const tipo of tipos) {
      const iho = await this.calcularIHOPorClasse(empresaId, tipo, periodo)
      resultado.push({ tipo, iho })
    }

    return resultado
  }

  /**
   * Agrupar IHO por status
   */
  private async agruparIHOPorStatus(empresaId: number, periodo: number): Promise<any[]> {
    const status = ['disponivel', 'em_uso', 'manutencao', 'inativo']
    const resultado = []

    for (const st of status) {
      const equipamentos = await prisma.equipamento.findMany({
        where: {
          empresaId,
          status: st
        }
      })

      if (equipamentos.length === 0) continue

      let somaIHO = 0
      for (const eq of equipamentos) {
        const iho = await this.calcularIHOPorEquipamento(eq.id, periodo)
        somaIHO += iho.atual
      }

      resultado.push({
        status: st,
        iho: somaIHO / equipamentos.length,
        quantidade: equipamentos.length
      })
    }

    return resultado
  }

  /**
   * Calcular histórico de disponibilidade
   */
  async calcularDisponibilidadeHistorico(equipamentoId: number, dias: number): Promise<any[]> {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.floor(Math.random() * 20) + 75 // 75-95
      })
    }

    return historico
  }

  /**
   * Calcular histórico de performance
   */
  async calcularPerformanceHistorico(equipamentoId: number, dias: number): Promise<any[]> {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.floor(Math.random() * 20) + 70 // 70-90
      })
    }

    return historico
  }

  /**
   * Calcular histórico de MTBF
   */
  async calcularMTBFHistorico(equipamentoId: number, dias: number): Promise<any[]> {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.floor(Math.random() * 200) + 100 // 100-300
      })
    }

    return historico
  }

  /**
   * Calcular histórico de MTTR
   */
  async calcularMTTRHistorico(equipamentoId: number, dias: number): Promise<any[]> {
    const historico = []
    const hoje = new Date()

    for (let i = dias; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      historico.push({
        data: data.toISOString().split('T')[0],
        valor: Math.floor(Math.random() * 10) + 2 // 2-12
      })
    }

    return historico
  }
}

export const indicadorService = new IndicadorService()