import prisma from '../config/database'

export class PrevisaoService {
  /**
   * Obter dashboard de previsões
   */
  async getDashboard(empresaId: number, meses: number) {
    const [
      previsaoUso,
      previsaoManutencao,
      previsaoCustos,
      tendencias,
      alertas
    ] = await Promise.all([
      this.preverUsoEquipamentos(empresaId, meses),
      this.preverManutencoes(empresaId, meses),
      this.preverCustos(empresaId, meses),
      this.analisarTendencias(empresaId, meses),
      this.gerarAlertasPreditivos(empresaId)
    ])

    return {
      previsaoUso,
      previsaoManutencao,
      previsaoCustos,
      tendencias,
      alertas,
      confiabilidade: this.calcularConfiabilidadeGeral(empresaId)
    }
  }

  /**
   * Prever uso de equipamentos
   */
  async preverUsoEquipamentos(empresaId: number, meses: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      include: {
        apontamentos: {
          orderBy: { data: 'desc' },
          take: 100
        }
      }
    })

    const previsoes = []

    for (const eq of equipamentos) {
      const horasHistoricas = eq.apontamentos.map(a => a.horasTrabalhadas)
      
      if (horasHistoricas.length < 5) {
        continue // Dados insuficientes
      }

      const mediaHoras = horasHistoricas.reduce((a, b) => a + b, 0) / horasHistoricas.length
      const tendencia = this.calcularTendencia(horasHistoricas)
      
      const previsaoMensal = []
      let horasBase = mediaHoras

      for (let i = 1; i <= meses; i++) {
        horasBase = horasBase * (1 + tendencia)
        previsaoMensal.push({
          mes: i,
          horas: Math.round(horasBase * 10) / 10,
          confiabilidade: Math.min(95, 70 + i * 2) // Diminui com o tempo
        })
      }

      previsoes.push({
        equipamentoId: eq.id,
        equipamentoTag: eq.tag,
        equipamentoNome: eq.nome,
        historico: horasHistoricas.slice(-12),
        previsao: previsaoMensal,
        tendencia,
        mediaHoras
      })
    }

    return {
      totalEquipamentos: equipamentos.length,
      equipamentosAnalisados: previsoes.length,
      previsoes,
      resumo: this.calcularResumoPrevisoes(previsoes)
    }
  }

  /**
   * Prever uso por equipamento
   */
  async preverUsoPorEquipamento(equipamentoId: number, meses: number) {
    const apontamentos = await prisma.apontamento.findMany({
      where: { equipamentoId },
      orderBy: { data: 'asc' },
      take: 100
    })

    const horasPorDia = apontamentos.reduce((acc, a) => {
      const dia = a.data.toISOString().split('T')[0]
      if (!acc[dia]) acc[dia] = 0
      acc[dia] += a.horasTrabalhadas
      return acc
    }, {} as Record<string, number>)

    const valores = Object.values(horasPorDia)
    const media = valores.reduce((a, b) => a + b, 0) / valores.length
    const desvioPadrao = this.calcularDesvioPadrao(valores)
    const tendencia = this.calcularTendencia(valores)

    const previsao = []
    let valorBase = media

    for (let i = 1; i <= meses; i++) {
      const variacao = (Math.random() - 0.5) * desvioPadrao * 0.3
      valorBase = valorBase * (1 + tendencia) + variacao
      
      previsao.push({
        mes: i,
        valor: Math.max(0, Math.round(valorBase * 10) / 10),
        intervaloMin: Math.max(0, Math.round((valorBase - desvioPadrao) * 10) / 10),
        intervaloMax: Math.round((valorBase + desvioPadrao) * 10) / 10,
        confiabilidade: Math.min(95, 70 + i * 2)
      })
    }

    return {
      historico: valores.slice(-30),
      previsao,
      estatisticas: {
        media,
        desvioPadrao,
        tendencia,
        minimo: Math.min(...valores),
        maximo: Math.max(...valores)
      }
    }
  }

  /**
   * Prever manutenções
   */
  async preverManutencoes(empresaId: number, meses: number) {
    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        status: 'concluida'
      },
      include: {
        equipamento: {
          select: {
            id: true,
            tag: true,
            nome: true,
            horaAtual: true
          }
        }
      },
      orderBy: { dataRealizada: 'desc' }
    })

    const manutencoesPorEquipamento: Record<number, any[]> = {}
    
    for (const m of manutencoes) {
      if (!manutencoesPorEquipamento[m.equipamentoId]) {
        manutencoesPorEquipamento[m.equipamentoId] = []
      }
      manutencoesPorEquipamento[m.equipamentoId].push(m)
    }

    const previsoes = []

    for (const [eqId, lista] of Object.entries(manutencoesPorEquipamento)) {
      if (lista.length < 2) continue

      const equipamento = lista[0].equipamento
      const intervalos = []
      
      for (let i = 1; i < lista.length; i++) {
        const dias = (lista[i-1].dataRealizada.getTime() - lista[i].dataRealizada.getTime()) / 
                     (1000 * 60 * 60 * 24)
        intervalos.push(Math.abs(dias))
      }

      const mediaIntervalo = intervalos.reduce((a, b) => a + b, 0) / intervalos.length
      const ultimaManutencao = lista[0].dataRealizada
      const diasDesdeUltima = (Date.now() - ultimaManutencao.getTime()) / (1000 * 60 * 60 * 24)

      const previsaoMeses = []
      let proximaData = new Date(ultimaManutencao)

      for (let i = 1; i <= meses; i++) {
        proximaData = new Date(proximaData.getTime() + mediaIntervalo * 24 * 60 * 60 * 1000)
        
        previsaoMeses.push({
          mes: i,
          data: proximaData.toISOString().split('T')[0],
          diasAteProxima: Math.round((proximaData.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          confiabilidade: Math.min(90, 60 + i * 3)
        })
      }

      previsoes.push({
        equipamentoId: parseInt(eqId),
        equipamentoTag: equipamento.tag,
        equipamentoNome: equipamento.nome,
        horaAtual: equipamento.horaAtual,
        mediaIntervalo: Math.round(mediaIntervalo),
        diasDesdeUltima: Math.round(diasDesdeUltima),
        ultimaManutencao: ultimaManutencao.toISOString().split('T')[0],
        previsao: previsaoMeses
      })
    }

    return {
      totalEquipamentos: Object.keys(manutencoesPorEquipamento).length,
      equipamentosAnalisados: previsoes.length,
      previsoes,
      resumo: this.calcularResumoManutencoes(previsoes)
    }
  }

  /**
   * Prever manutenções por equipamento
   */
  async preverManutencoesPorEquipamento(equipamentoId: number, meses: number) {
    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamentoId,
        status: 'concluida'
      },
      orderBy: { dataRealizada: 'desc' }
    })

    if (manutencoes.length < 2) {
      return {
        dadosInsuficientes: true,
        mensagem: 'Histórico insuficiente para previsão'
      }
    }

    const intervalos = []
    const tipos: Record<string, number> = {}

    for (let i = 1; i < manutencoes.length; i++) {
      const dias = (manutencoes[i-1].dataRealizada!.getTime() - 
                   manutencoes[i].dataRealizada!.getTime()) / (1000 * 60 * 60 * 24)
      intervalos.push(Math.abs(dias))
      
      tipos[manutencoes[i].tipo] = (tipos[manutencoes[i].tipo] || 0) + 1
    }

    const mediaIntervalo = intervalos.reduce((a, b) => a + b, 0) / intervalos.length
    const desvioPadrao = this.calcularDesvioPadrao(intervalos)
    const ultimaManutencao = manutencoes[0].dataRealizada!

    const previsao = []
    let proximaData = new Date(ultimaManutencao)

    for (let i = 1; i <= meses; i++) {
      const variacao = (Math.random() - 0.5) * desvioPadrao * 0.2
      const intervalo = mediaIntervalo + variacao
      
      proximaData = new Date(proximaData.getTime() + intervalo * 24 * 60 * 60 * 1000)
      
      previsao.push({
        mes: i,
        data: proximaData.toISOString().split('T')[0],
        intervalo,
        tipo: this.preverTipoManutencao(tipos),
        confiabilidade: Math.min(85, 50 + i * 3)
      })
    }

    return {
      estatisticas: {
        totalManutencoes: manutencoes.length,
        mediaIntervalo: Math.round(mediaIntervalo),
        desvioPadrao: Math.round(desvioPadrao),
        minimoIntervalo: Math.round(Math.min(...intervalos)),
        maximoIntervalo: Math.round(Math.max(...intervalos))
      },
      tipos,
      ultimaManutencao: ultimaManutencao.toISOString().split('T')[0],
      previsao
    }
  }

  /**
   * Prever custos
   */
  async preverCustos(empresaId: number, meses: number) {
    const dataLimite = new Date()
    dataLimite.setMonth(dataLimite.getMonth() - 12)

    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        dataRealizada: { gte: dataLimite },
        status: 'concluida'
      }
    })

    // Agrupar custos por mês
    const custosPorMes: Record<string, number> = {}
    
    for (const m of manutencoes) {
      if (!m.dataRealizada || !m.custo) continue
      
      const mes = `${m.dataRealizada.getFullYear()}-${(m.dataRealizada.getMonth() + 1).toString().padStart(2, '0')}`
      custosPorMes[mes] = (custosPorMes[mes] || 0) + m.custo
    }

    const valores = Object.values(custosPorMes)
    const mediaMensal = valores.reduce((a, b) => a + b, 0) / valores.length
    const tendencia = this.calcularTendencia(valores)

    const previsao = []
    let valorBase = mediaMensal

    for (let i = 1; i <= meses; i++) {
      const sazonalidade = this.calcularSazonalidade(i)
      valorBase = valorBase * (1 + tendencia) * (1 + sazonalidade)
      
      previsao.push({
        mes: i,
        valor: Math.round(valorBase * 100) / 100,
        intervaloMin: Math.max(0, Math.round((valorBase * 0.8) * 100) / 100),
        intervaloMax: Math.round((valorBase * 1.2) * 100) / 100,
        confiabilidade: Math.min(90, 50 + i * 3)
      })
    }

    return {
      historico: Object.entries(custosPorMes).map(([mes, valor]) => ({
        mes,
        valor
      })),
      estatisticas: {
        mediaMensal: Math.round(mediaMensal * 100) / 100,
        minimo: Math.min(...valores),
        maximo: Math.max(...valores),
        tendencia
      },
      previsao,
      totalProjetado: previsao.reduce((sum, p) => sum + p.valor, 0)
    }
  }

  /**
   * Analisar tendências
   */
  async analisarTendencias(empresaId: number, meses: number) {
    const [
      uso,
      manutencoes,
      custos
    ] = await Promise.all([
      this.preverUsoEquipamentos(empresaId, meses),
      this.preverManutencoes(empresaId, meses),
      this.preverCustos(empresaId, meses)
    ])

    return {
      uso: {
        tendenciaGeral: this.calcularTendenciaGeralUso(uso),
        equipamentosCriticos: this.identificarEquipamentosCriticos(uso),
        recomendacoes: this.gerarRecomendacoesUso(uso)
      },
      manutencoes: {
        tendenciaGeral: this.calcularTendenciaGeralManutencoes(manutencoes),
        equipamentosAtencao: this.identificarEquipamentosAtencao(manutencoes),
        recomendacoes: this.gerarRecomendacoesManutencao(manutencoes)
      },
      custos: {
        tendenciaGeral: custos.estatisticas.tendencia,
        projecao: custos.previsao[custos.previsao.length - 1]?.valor || 0,
        recomendacoes: this.gerarRecomendacoesCustos(custos)
      }
    }
  }

  /**
   * Gerar alertas preditivos
   */
  async gerarAlertasPreditivos(empresaId: number) {
    const alertas = []
    const hoje = new Date()

    // Alertas de manutenção preventiva
    const manutencoesProgramadas = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        status: 'programada',
        tipo: 'preventiva'
      },
      include: {
        equipamento: {
          select: { tag: true, nome: true }
        }
      }
    })

    for (const m of manutencoesProgramadas) {
<<<<<<< HEAD
      const diasAte = Math.round((m.dataProgramada.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
=======
      const diasAte = Math.round((m.dataProgramada!.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      
      if (diasAte <= 7) {
        alertas.push({
          tipo: 'manutencao_proxima',
          gravidade: diasAte <= 3 ? 'alta' : 'media',
          equipamento: m.equipamento.tag,
          descricao: `Manutenção preventiva programada para daqui a ${diasAte} dias`,
<<<<<<< HEAD
          data: m.dataProgramada.toISOString().split('T')[0],
=======
          data: m.dataProgramada!.toISOString().split('T')[0],
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          diasAte
        })
      }
    }

    // Alertas de consumo
    const apontamentosRecentes = await prisma.apontamento.findMany({
      where: {
        equipamento: { empresaId },
        data: {
          gte: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        equipamento: {
          select: { tag: true, nome: true }
        }
      }
    })

    const consumoPorEquipamento: Record<number, { total: number; dias: number }> = {}
    
    for (const a of apontamentosRecentes) {
      if (!a.combustivelLitros) continue
      
      if (!consumoPorEquipamento[a.equipamentoId]) {
        consumoPorEquipamento[a.equipamentoId] = { total: 0, dias: 0 }
      }
      consumoPorEquipamento[a.equipamentoId].total += a.combustivelLitros
      consumoPorEquipamento[a.equipamentoId].dias++
    }

    for (const [eqId, dados] of Object.entries(consumoPorEquipamento)) {
      const mediaDiaria = dados.total / dados.dias
      if (mediaDiaria > 100) { // Threshold configurável
        const equipamento = apontamentosRecentes.find(a => a.equipamentoId === parseInt(eqId))?.equipamento
        alertas.push({
          tipo: 'consumo_alto',
          gravidade: 'media',
          equipamento: equipamento?.tag,
          descricao: `Consumo médio elevado: ${mediaDiaria.toFixed(1)}L/dia`,
          valor: mediaDiaria
        })
      }
    }

    return alertas.sort((a, b) => {
      const peso = { alta: 3, media: 2, baixa: 1 }
      return peso[b.gravidade as keyof typeof peso] - peso[a.gravidade as keyof typeof peso]
    })
  }

  /**
   * Simular cenários
   */
  async simularCenarios(empresaId: number, tipo: string, parametros: any) {
    const base = await this.preverCustos(empresaId, 12)
    
    const cenarios = {
      otimista: {
        ...base,
<<<<<<< HEAD
        previsao: base.previsao.map(p => ({
=======
        previsao: base.previsao.map((p: any) => ({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          ...p,
          valor: p.valor * 0.9,
          intervaloMin: p.intervaloMin * 0.85,
          intervaloMax: p.intervaloMax * 0.95
        }))
      },
      realista: base,
      pessimista: {
        ...base,
<<<<<<< HEAD
        previsao: base.previsao.map(p => ({
=======
        previsao: base.previsao.map((p: any) => ({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          ...p,
          valor: p.valor * 1.2,
          intervaloMin: p.intervaloMin * 1.15,
          intervaloMax: p.intervaloMax * 1.25
        }))
      }
    }

    return cenarios
  }

  /**
   * Gerar recomendações
   */
  async gerarRecomendacoes(empresaId: number) {
    const [uso, manutencoes, custos] = await Promise.all([
      this.preverUsoEquipamentos(empresaId, 6),
      this.preverManutencoes(empresaId, 6),
      this.preverCustos(empresaId, 6)
    ])

<<<<<<< HEAD
    const recomendacoes = []
=======
    const recomendacoes: any[] = []
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

    // Recomendações de uso
    const equipamentosCriticos = this.identificarEquipamentosCriticos(uso)
    if (equipamentosCriticos.length > 0) {
      recomendacoes.push({
        area: 'uso',
        prioridade: 'alta',
        titulo: 'Acompanhamento de equipamentos críticos',
        descricao: `${equipamentosCriticos.length} equipamentos apresentam tendência de sobrecarga.`,
        acoes: equipamentosCriticos.map(e => `Revisar programação do ${e.tag}`)
      })
    }

    // Recomendações de manutenção
<<<<<<< HEAD
    const manutencoesProximas = manutencoes.previsoes.filter(p => 
=======
    const manutencoesProximas = manutencoes.previsoes.filter((p: any) => 
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      p.previsao[0]?.diasAteProxima <= 30
    )
    if (manutencoesProximas.length > 0) {
      recomendacoes.push({
        area: 'manutencao',
        prioridade: 'alta',
        titulo: 'Manutenções preventivas programadas',
        descricao: `${manutencoesProximas.length} equipamentos precisam de manutenção nos próximos 30 dias.`,
        acoes: manutencoesProximas.map(m => `Agendar manutenção do ${m.equipamentoTag}`)
      })
    }

    // Recomendações de custos
    if (custos.estatisticas.tendencia > 0.05) {
      recomendacoes.push({
        area: 'custos',
        prioridade: 'media',
        titulo: 'Tendência de aumento de custos',
        descricao: `Custos projetados em ${custos.estatisticas.tendencia > 0 ? 'alta' : 'baixa'}.`,
        acoes: [
          'Revisar contratos de manutenção',
          'Avaliar eficiência operacional',
          'Considerar substituição de equipamentos antigos'
        ]
      })
    }

    return recomendacoes
  }

  /**
   * Gerar relatório de previsões
   */
  async gerarRelatorioPrevisoes(empresaId: number, tipo: string, meses: number) {
    const dashboard = await this.getDashboard(empresaId, meses)
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { nome: true, cnpj: true }
    })

    return {
      empresa,
      data: new Date(),
      tipo,
      meses,
      ...dashboard
    }
  }

  /**
   * Calcular tendência
   */
  private calcularTendencia(valores: number[]): number {
    if (valores.length < 2) return 0
    
    const n = valores.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = valores

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((a, _, i) => a + x[i] * y[i], 0)
    const sumXX = x.reduce((a, b) => a + b * b, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    return slope / (sumY / n) // Tendência percentual
  }

  /**
   * Calcular desvio padrão
   */
  private calcularDesvioPadrao(valores: number[]): number {
    const media = valores.reduce((a, b) => a + b, 0) / valores.length
    const somaQuadrados = valores.reduce((a, b) => a + Math.pow(b - media, 2), 0)
    return Math.sqrt(somaQuadrados / valores.length)
  }

  /**
   * Calcular sazonalidade
   */
  private calcularSazonalidade(mes: number): number {
    // Simular efeitos sazonais (ex: mais manutenção no verão)
    const fatores: Record<number, number> = {
      1: 0.1,  // Janeiro
      2: 0.15, // Fevereiro
      3: 0.05, // Março
      4: -0.05, // Abril
      5: -0.1, // Maio
      6: -0.15, // Junho
      7: -0.1, // Julho
      8: 0,    // Agosto
      9: 0.05, // Setembro
      10: 0.1, // Outubro
      11: 0.15, // Novembro
      12: 0.2   // Dezembro
    }
    return fatores[mes] || 0
  }

  /**
   * Calcular confiabilidade da previsão
   */
  calcularConfiabilidadePrevisao(historico: any[]): number {
    if (historico.length < 10) return 30
    if (historico.length < 20) return 50
    if (historico.length < 30) return 70
    if (historico.length < 50) return 85
    return 95
  }

  /**
   * Obter histórico de uso do equipamento
   */
  async getHistoricoUsoEquipamento(equipamentoId: number, dias: number) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - dias)

    const apontamentos = await prisma.apontamento.findMany({
      where: {
        equipamentoId,
        data: { gte: dataLimite }
      },
      orderBy: { data: 'asc' }
    })

    return apontamentos.map(a => ({
      data: a.data.toISOString().split('T')[0],
      horas: a.horasTrabalhadas,
      combustivel: a.combustivelLitros
    }))
  }

  /**
   * Obter histórico de manutenções do equipamento
   */
  async getHistoricoManutencoesEquipamento(equipamentoId: number, meses: number) {
    const dataLimite = new Date()
    dataLimite.setMonth(dataLimite.getMonth() - meses)

    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamentoId,
        dataRealizada: { gte: dataLimite }
      },
      orderBy: { dataRealizada: 'asc' }
    })

    return manutencoes.map(m => ({
      data: m.dataRealizada?.toISOString().split('T')[0],
      tipo: m.tipo,
      custo: m.custo,
      descricao: m.descricao
    }))
  }

  /**
   * Calcular confiabilidade geral
   */
  private calcularConfiabilidadeGeral(empresaId: number): number {
    // Implementar cálculo baseado na quantidade de dados históricos
    return 75
  }

  /**
   * Calcular resumo das previsões
   */
  private calcularResumoPrevisoes(previsoes: any[]): any {
    if (previsoes.length === 0) return {}

    const totalHorasProjetadas = previsoes.reduce((sum, p) => {
<<<<<<< HEAD
      const total = p.previsao.reduce((s, m) => s + m.horas, 0)
=======
      const total = p.previsao.reduce((s: number, m: any) => s + m.horas, 0)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      return sum + total
    }, 0)

    return {
      totalEquipamentosAnalisados: previsoes.length,
      totalHorasProjetadas: Math.round(totalHorasProjetadas * 10) / 10,
      mediaHorasPorEquipamento: Math.round((totalHorasProjetadas / previsoes.length) * 10) / 10
    }
  }

  /**
   * Calcular resumo das manutenções
   */
  private calcularResumoManutencoes(previsoes: any[]): any {
    if (previsoes.length === 0) return {}

<<<<<<< HEAD
    const manutencoesProximas = previsoes.filter(p => p.previsao[0]?.diasAteProxima <= 30)
=======
    const manutencoesProximas = previsoes.filter((p: any) => p.previsao[0]?.diasAteProxima <= 30)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

    return {
      totalEquipamentosAnalisados: previsoes.length,
      manutencoesProximas: manutencoesProximas.length,
      mediaIntervalo: Math.round(previsoes.reduce((sum, p) => sum + p.mediaIntervalo, 0) / previsoes.length)
    }
  }

  /**
   * Calcular tendência geral de uso
   */
  private calcularTendenciaGeralUso(uso: any): string {
    if (!uso.previsoes || uso.previsoes.length === 0) return 'estável'
    
<<<<<<< HEAD
    const tendencias = uso.previsoes.map(p => p.tendencia)
    const mediaTendencia = tendencias.reduce((a, b) => a + b, 0) / tendencias.length
=======
    const tendencias = uso.previsoes.map((p: any) => p.tendencia)
    const mediaTendencia = tendencias.reduce((a: any, b: any) => a + b, 0) / tendencias.length
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    
    if (mediaTendencia > 0.05) return 'crescente'
    if (mediaTendencia < -0.05) return 'decrescente'
    return 'estável'
  }

  /**
   * Identificar equipamentos críticos
   */
  private identificarEquipamentosCriticos(uso: any): any[] {
    if (!uso.previsoes) return []
    
    return uso.previsoes
<<<<<<< HEAD
      .filter(p => p.tendencia > 0.1)
      .map(p => ({
=======
      .filter((p: any) => p.tendencia > 0.1)
      .map((p: any) => ({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        id: p.equipamentoId,
        tag: p.equipamentoTag,
        nome: p.equipamentoNome,
        tendencia: p.tendencia
      }))
  }

  /**
   * Gerar recomendações de uso
   */
  private gerarRecomendacoesUso(uso: any): string[] {
<<<<<<< HEAD
    const recomendacoes = []
=======
    const recomendacoes: any[] = []
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    const criticos = this.identificarEquipamentosCriticos(uso)
    
    if (criticos.length > 0) {
      recomendacoes.push(`Acompanhar ${criticos.length} equipamentos com tendência de sobrecarga`)
    }
    
    return recomendacoes
  }

  /**
   * Calcular tendência geral de manutenções
   */
  private calcularTendenciaGeralManutencoes(manutencoes: any): string {
    return 'estável'
  }

  /**
   * Identificar equipamentos em atenção
   */
  private identificarEquipamentosAtencao(manutencoes: any): any[] {
    if (!manutencoes.previsoes) return []
    
    return manutencoes.previsoes
<<<<<<< HEAD
      .filter(p => p.previsao[0]?.diasAteProxima <= 15)
      .map(p => ({
=======
      .filter((p: any) => p.previsao[0]?.diasAteProxima <= 15)
      .map((p: any) => ({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        id: p.equipamentoId,
        tag: p.equipamentoTag,
        dias: p.previsao[0]?.diasAteProxima
      }))
  }

  /**
   * Gerar recomendações de manutenção
   */
<<<<<<< HEAD
  private gerarRecomendacoesManutencao(manutencoes: any): string[] {
    const recomendacoes = []
=======
  public gerarRecomendacoesManutencao(manutencoes: any): string[] {
    const recomendacoes: any[] = []
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    const atencao = this.identificarEquipamentosAtencao(manutencoes)
    
    if (atencao.length > 0) {
      recomendacoes.push(`Programar manutenção para ${atencao.length} equipamentos nos próximos 15 dias`)
    }
    
    return recomendacoes
  }

  /**
   * Gerar recomendações de custos
   */
  private gerarRecomendacoesCustos(custos: any): string[] {
<<<<<<< HEAD
    const recomendacoes = []
=======
    const recomendacoes: any[] = []
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    
    if (custos.estatisticas.tendencia > 0.05) {
      recomendacoes.push('Revisar orçamento devido à tendência de aumento de custos')
    }
    
    return recomendacoes
  }

  /**
   * Prever tipo de manutenção
   */
  private preverTipoManutencao(tipos: Record<string, number>): string {
    let tipoMaisFrequente = 'preventiva'
    let maiorFrequencia = 0
    
    for (const [tipo, freq] of Object.entries(tipos)) {
      if (freq > maiorFrequencia) {
        maiorFrequencia = freq
        tipoMaisFrequente = tipo
      }
    }
    
    return tipoMaisFrequente
  }
}

export const previsaoService = new PrevisaoService()