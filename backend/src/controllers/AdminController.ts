import { Request, Response } from 'express'
import prisma from '../config/database'

export class AdminController {
  async getDashboard(req: Request, res: Response) {
    try {
      const { periodo = '30d' } = req.query

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
        totalEmpresas,
        empresasAtivas,
        empresasInativas,
        empresasAtrasadas,
        totalUsuarios,
        usuariosAtivos,
        totalPlanos,
        faturamentoMes,
        faturamentoAno,
        empresasRecentes,
        atividadesRecentes,
        distribuicaoPlanos
      ] = await Promise.all([
        prisma.empresa.count(),
        prisma.empresa.count({ where: { status: 'ativo' } }),
        prisma.empresa.count({ where: { status: 'inativo' } }),
        prisma.empresa.count({ where: { status: 'atrasado' } }),
        prisma.usuario.count(),
        prisma.usuario.count({ where: { ativo: true } }),
        prisma.plano.count(),
        this.calcularFaturamentoPeriodo(dataInicio, hoje),
        this.calcularFaturamentoAno(),
        this.buscarEmpresasRecentes(),
        this.buscarAtividadesRecentes(),
        this.buscarDistribuicaoPlanos()
      ])

      // Calcular crescimento
      const mesAnterior = new Date(dataInicio)
      mesAnterior.setMonth(mesAnterior.getMonth() - 1)
      const faturamentoMesAnterior = await this.calcularFaturamentoPeriodo(mesAnterior, dataInicio)
      
      const crescimento = faturamentoMesAnterior > 0 
        ? ((faturamentoMes - faturamentoMesAnterior) / faturamentoMesAnterior) * 100
        : 0

      // Calcular ticket médio
      const ticketMedio = empresasAtivas > 0 ? faturamentoMes / empresasAtivas : 0

      // Calcular inadimplência
      const inadimplencia = totalEmpresas > 0 ? (empresasAtrasadas / totalEmpresas) * 100 : 0

      // Alertas (exemplo)
      const alertas = {
        criticos: empresasAtrasadas,
        atencao: await prisma.empresa.count({ 
          where: { 
            status: 'ativo',
            nextBillingAt: {
              lt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 dias
            }
          }
        }),
        info: await prisma.empresa.count({ where: { status: 'pendente' } })
      }

      res.json({
        resumo: {
          totalEmpresas,
          empresasAtivas,
          empresasInativas,
          empresasAtrasadas,
          totalUsuarios,
          usuariosAtivos,
          totalPlanos,
          faturamentoMes,
          faturamentoAno,
          ticketMedio,
          crescimento,
          inadimplencia
        },
        distribuicaoPlanos,
        empresasRecentes,
        atividadesRecentes,
        alertas
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  private async calcularFaturamentoPeriodo(dataInicio: Date, dataFim: Date): Promise<number> {
    const pagamentos = await prisma.pagamento.aggregate({
      where: {
        status: 'pago',
        dataPagamento: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      _sum: {
        valor: true
      }
    })

    return pagamentos._sum.valor || 0
  }

  private async calcularFaturamentoAno(): Promise<number> {
    const inicioAno = new Date(new Date().getFullYear(), 0, 1)
    const fimAno = new Date(new Date().getFullYear(), 11, 31)

    return this.calcularFaturamentoPeriodo(inicioAno, fimAno)
  }

  private async buscarEmpresasRecentes() {
    const empresas = await prisma.empresa.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        plano: true
      }
    })

    return empresas.map(emp => ({
      id: emp.id,
      nome: emp.nome,
      cnpj: emp.cnpj,
      plano: emp.plano.nome,
      status: emp.status,
      dataCadastro: emp.createdAt.toLocaleDateString('pt-BR')
    }))
  }

  private async buscarAtividadesRecentes() {
    const logs = await prisma.log.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        usuario: true
      }
    })

    return logs.map(log => {
      let tipo = 'info'
      if (log.acao.includes('CRIAR')) tipo = 'success'
      if (log.acao.includes('ATUALIZAR')) tipo = 'info'
      if (log.acao.includes('EXCLUIR')) tipo = 'error'
      if (log.acao.includes('LOGIN')) tipo = 'success'
      if (log.acao.includes('ERRO')) tipo = 'error'

      return {
        id: log.id,
        usuario: log.usuario?.nome || 'Sistema',
        acao: log.acao,
        entidade: log.entidade,
        data: log.createdAt.toLocaleString('pt-BR'),
        tipo
      }
    })
  }

  private async buscarDistribuicaoPlanos() {
    const planos = await prisma.plano.findMany({
      include: {
        _count: {
          select: { empresas: true }
        }
      }
    })

    const total = planos.reduce((acc, p) => acc + p._count.empresas, 0)

    const cores = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-orange-500'
    ]

    return planos.map((plano, index) => ({
      nome: plano.nome,
      total: plano._count.empresas,
      percentual: total > 0 ? (plano._count.empresas / total) * 100 : 0,
      cor: cores[index % cores.length]
    }))
  }
}

export const adminController = new AdminController()