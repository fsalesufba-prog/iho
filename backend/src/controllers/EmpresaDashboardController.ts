import { Request, Response } from 'express'
import prisma from '../config/database'

export class EmpresaDashboardController {
  async getDashboard(req: Request, res: Response) {
    try {
      const { periodo = '30d' } = req.query
      const empresaId = (req as any).user?.empresaId

      if (!empresaId) {
        return res.status(403).json({ error: 'Empresa não identificada' })
      }

      // Calcular datas
      const hoje = new Date()
      let dataInicio = new Date()

      switch (periodo) {
        case '7d':
          dataInicio.setDate(hoje.getDate() - 7)
          break
        case '30d':
          dataInicio.setDate(hoje.getDate() - 30)
          break
        case '90d':
          dataInicio.setDate(hoje.getDate() - 90)
          break
        case '12m':
          dataInicio.setMonth(hoje.getMonth() - 12)
          break
      }

      // Buscar estatísticas
      const [
        totalObras,
        obrasAtivas,
        totalEquipamentos,
        equipamentosDisponiveis,
        equipamentosEmUso,
        equipamentosEmManutencao,
        manutencoesPendentes,
        manutencoesAtrasadas,
        custos,
        topEquipamentos,
        atividadesRecentes,
        proximasManutencoes
      ] = await Promise.all([
        prisma.obra.count({ where: { empresaId } }),
        prisma.obra.count({ where: { empresaId, status: 'ativa' } }),
        prisma.equipamento.count({ where: { empresaId } }),
        prisma.equipamento.count({ where: { empresaId, status: 'disponivel' } }),
        prisma.equipamento.count({ where: { empresaId, status: 'em_uso' } }),
        prisma.equipamento.count({ where: { empresaId, status: 'manutencao' } }),
        prisma.manutencao.count({ 
          where: { 
            equipamento: { empresaId },
            status: { in: ['programada', 'em_andamento'] }
          } 
        }),
        prisma.manutencao.count({ 
          where: { 
            equipamento: { empresaId },
            status: 'programada',
            dataProgramada: { lt: new Date() }
          } 
        }),
        this.calcularCustos(empresaId, dataInicio, hoje),
        this.buscarTopEquipamentos(empresaId),
        this.buscarAtividadesRecentes(empresaId),
        this.buscarProximasManutencoes(empresaId)
      ])

      // Calcular indicadores
      const indicadores = await this.calcularIndicadores(empresaId, dataInicio, hoje)

      // Alertas
      const alertas = {
        criticos: manutencoesAtrasadas,
        atencao: await prisma.manutencao.count({ 
          where: { 
            equipamento: { empresaId },
            prioridade: 'alta',
            status: 'programada'
          } 
        }),
        info: await prisma.manutencao.count({ 
          where: { 
            equipamento: { empresaId },
            prioridade: 'media',
            status: 'programada'
          } 
        })
      }

      res.json({
        resumo: {
          totalObras,
          obrasAtivas,
          totalEquipamentos,
          equipamentosDisponiveis,
          equipamentosEmUso,
          equipamentosEmManutencao,
          manutencoesPendentes,
          manutencoesAtrasadas,
          indicadores,
          financeiro: {
            custoTotal: custos.total,
            custoManutencao: custos.manutencao,
            custoCombustivel: custos.combustivel,
            faturamento: custos.faturamento
          }
        },
        alertas,
        topEquipamentos,
        atividadesRecentes,
        proximasManutencoes
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  private async calcularIndicadores(empresaId: number, dataInicio: Date, dataFim: Date) {
    // Calcular IHO médio
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      include: {
        manutencoes: {
          where: {
            createdAt: { gte: dataInicio, lte: dataFim }
          }
        },
        apontamentos: {
          where: {
            data: { gte: dataInicio, lte: dataFim }
          }
        }
      }
    })

    let totalIho = 0
    let totalDisponibilidade = 0
    let totalMtbf = 0
    let totalMttr = 0
    let totalOee = 0
    let count = 0

    equipamentos.forEach(eq => {
      // IHO simplificado (exemplo)
      const disponibilidade = eq.status === 'disponivel' ? 100 : 
                             eq.status === 'em_uso' ? 100 : 
                             eq.status === 'manutencao' ? 0 : 50
      
      const manutencoesCount = eq.manutencoes.length
      const horasParadas = eq.manutencoes.reduce((acc, m) => acc + (m.custo || 0), 0) / 100 // simplificação
      const horasTrabalhadas = eq.apontamentos.reduce((acc, a) => acc + a.horasTrabalhadas, 0)
      
      const mtbf = manutencoesCount > 0 ? horasTrabalhadas / manutencoesCount : 1000
      const mttr = manutencoesCount > 0 ? horasParadas / manutencoesCount : 0
      const oee = (disponibilidade / 100) * 0.9 * 0.95 * 100 // simplificação
      const iho = (disponibilidade * 0.4 + mtbf * 0.3 + (100 - mttr) * 0.3) / 100

      totalIho += iho
      totalDisponibilidade += disponibilidade
      totalMtbf += mtbf
      totalMttr += mttr
      totalOee += oee
      count++
    })

    return {
      iho: count > 0 ? Math.round(totalIho / count) : 0,
      disponibilidade: count > 0 ? Math.round(totalDisponibilidade / count) : 0,
      mtbf: count > 0 ? Math.round(totalMtbf / count) : 0,
      mttr: count > 0 ? Math.round(totalMttr / count) : 0,
      oee: count > 0 ? Math.round(totalOee / count) : 0
    }
  }

  private async calcularCustos(empresaId: number, dataInicio: Date, dataFim: Date) {
    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        createdAt: { gte: dataInicio, lte: dataFim }
      }
    })

    const apontamentos = await prisma.apontamento.findMany({
      where: {
        equipamento: { empresaId },
        data: { gte: dataInicio, lte: dataFim }
      }
    })

    const custoManutencao = manutencoes.reduce((acc, m) => acc + (m.custo || 0), 0)
    const custoCombustivel = apontamentos.reduce((acc, a) => acc + (a.combustivelLitros || 0) * 5.50, 0) // R$ 5,50 por litro
    const total = custoManutencao + custoCombustivel

    // Faturamento fictício (exemplo)
    const faturamento = apontamentos.reduce((acc, a) => acc + a.horasTrabalhadas * 150, 0) // R$ 150 por hora

    return {
      total,
      manutencao: custoManutencao,
      combustivel: custoCombustivel,
      faturamento
    }
  }

  private async buscarTopEquipamentos(empresaId: number) {
    const equipamentos = await prisma.equipamento.findMany({
      where: { empresaId },
      take: 5,
      include: {
        manutencoes: {
          take: 10
        },
        apontamentos: {
          take: 10
        }
      }
    })

    return equipamentos.map(eq => {
      const manutencoesCount = eq.manutencoes.length
      const horasTrabalhadas = eq.apontamentos.reduce((acc, a) => acc + a.horasTrabalhadas, 0)
      const mtbf = manutencoesCount > 0 ? horasTrabalhadas / manutencoesCount : 100
      const iho = Math.min(100, Math.max(0, 70 + mtbf / 10)) // simplificação

      return {
        id: eq.id,
        nome: eq.nome,
        tag: eq.tag,
        iho: Math.round(iho),
        horas: eq.horaAtual,
        status: eq.status
      }
    }).sort((a, b) => b.iho - a.iho)
  }

  private async buscarAtividadesRecentes(empresaId: number) {
    const logs = await prisma.log.findMany({
      where: { empresaId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: {
          select: { nome: true }
        }
      }
    })

    return logs.map(log => ({
      id: log.id,
      descricao: `${log.acao} em ${log.entidade}`,
      tipo: log.acao.toLowerCase().includes('criar') ? 'create' :
            log.acao.toLowerCase().includes('atualizar') ? 'update' :
            log.acao.toLowerCase().includes('excluir') ? 'delete' : 'info',
      data: log.createdAt,
      usuario: log.usuario?.nome || 'Sistema'
    }))
  }

  private async buscarProximasManutencoes(empresaId: number) {
    const manutencoes = await prisma.manutencao.findMany({
      where: {
        equipamento: { empresaId },
        status: 'programada',
        dataProgramada: { gte: new Date() }
      },
      take: 5,
      orderBy: { dataProgramada: 'asc' },
      include: {
        equipamento: {
          select: { nome: true }
        }
      }
    })

    return manutencoes.map(m => ({
      id: m.id,
      equipamento: m.equipamento.nome,
      tipo: m.tipo,
      data: m.dataProgramada,
      prioridade: m.prioridade
    }))
  }
}

export const empresaDashboardController = new EmpresaDashboardController()