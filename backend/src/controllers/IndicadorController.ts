import { Request, Response } from 'express'
import prisma from '../config/database'
import { indicadorService } from '../services/IndicadorService'

export class IndicadorController {
  /**
   * Dashboard principal de indicadores
   */
  async dashboard(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const [
        ihoGeral,
        disponibilidadeGeral,
        performanceGeral,
        mtbfGeral,
        mttrGeral,
        custos,
        alertas
      ] = await Promise.all([
        indicadorService.calcularIHOGeral(empresaId),
        indicadorService.calcularDisponibilidadeGeral(empresaId),
        indicadorService.calcularPerformanceGeral(empresaId),
        indicadorService.calcularMTBFGeral(empresaId),
        indicadorService.calcularMTTRGeral(empresaId),
        indicadorService.calcularCustos(empresaId),
        indicadorService.obterAlertas(empresaId)
      ])

      res.json({
        success: true,
        data: {
          iho: ihoGeral,
          disponibilidade: disponibilidadeGeral,
          performance: performanceGeral,
          mtbf: mtbfGeral,
          mttr: mttrGeral,
          custos,
          alertas
        }
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * IHO - Índice de Saúde Operacional
   */
  async iho(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const iho = await indicadorService.calcularIHODetalhado(empresaId, parseInt(periodo as string))

      res.json({
        success: true,
        data: iho
      })
    } catch (error) {
      console.error('Erro ao calcular IHO:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * IHO por equipamento
   */
  async ihoPorEquipamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const iho = await indicadorService.calcularIHOPorEquipamento(
        parseInt(id),
        parseInt(periodo as string)
      )

      const historico = await indicadorService.calcularIHOHistoricoEquipamento(
        parseInt(id),
        30
      )

      res.json({
        success: true,
        data: {
          equipamento,
          iho: iho.atual,
          tendencia: iho.tendencia,
          componentes: iho.componentes,
          historico
        }
      })
    } catch (error) {
      console.error('Erro ao calcular IHO do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * IHO por classe de equipamento
   */
  async ihoPorClasse(req: Request, res: Response) {
    try {
      const { tipo } = req.params
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const equipamentos = await prisma.equipamento.findMany({
        where: {
          empresaId,
          tipo
        }
      })

      if (equipamentos.length === 0) {
        return res.status(404).json({ error: 'Nenhum equipamento encontrado para esta classe' })
      }

      const ihoClasse = await indicadorService.calcularIHOPorClasse(
        empresaId,
        tipo,
        parseInt(periodo as string)
      )

      const ihoEquipamentos = await Promise.all(
        equipamentos.map(async (eq) => ({
          equipamento: eq,
          iho: await indicadorService.calcularIHOPorEquipamento(eq.id, parseInt(periodo as string))
        }))
      )

      res.json({
        success: true,
        data: {
          classe: tipo,
          totalEquipamentos: equipamentos.length,
          ihoClasse,
          equipamentos: ihoEquipamentos
        }
      })
    } catch (error) {
      console.error('Erro ao calcular IHO por classe:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * IHO por obra
   */
  async ihoPorObra(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const obra = await prisma.obra.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!obra) {
        return res.status(404).json({ error: 'Obra não encontrada' })
      }

      const ihoObra = await indicadorService.calcularIHOPorObra(
        parseInt(id),
        parseInt(periodo as string)
      )

      const equipamentos = await prisma.equipamento.findMany({
        where: {
          obraId: parseInt(id)
        }
      })

      const ihoEquipamentos = await Promise.all(
        equipamentos.map(async (eq) => ({
          equipamento: eq,
          iho: await indicadorService.calcularIHOPorEquipamento(eq.id, parseInt(periodo as string))
        }))
      )

      res.json({
        success: true,
        data: {
          obra,
          iho: ihoObra,
          totalEquipamentos: equipamentos.length,
          equipamentos: ihoEquipamentos
        }
      })
    } catch (error) {
      console.error('Erro ao calcular IHO por obra:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * IHO por centro de custo
   */
  async ihoPorCentroCusto(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const centroCusto = await prisma.centroCusto.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!centroCusto) {
        return res.status(404).json({ error: 'Centro de custo não encontrado' })
      }

      const ihoCentro = await indicadorService.calcularIHOPorCentroCusto(
        parseInt(id),
        parseInt(periodo as string)
      )

      const equipamentos = await prisma.equipamento.findMany({
        where: {
          centroCustoId: parseInt(id)
        }
      })

      res.json({
        success: true,
        data: {
          centroCusto,
          iho: ihoCentro,
          totalEquipamentos: equipamentos.length
        }
      })
    } catch (error) {
      console.error('Erro ao calcular IHO por centro de custo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Disponibilidade de equipamentos
   */
  async disponibilidade(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const disponibilidade = await indicadorService.calcularDisponibilidadeDetalhada(
        empresaId,
        parseInt(periodo as string)
      )

      res.json({
        success: true,
        data: disponibilidade
      })
    } catch (error) {
      console.error('Erro ao calcular disponibilidade:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Disponibilidade por equipamento
   */
  async disponibilidadePorEquipamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const disponibilidade = await indicadorService.calcularDisponibilidadePorEquipamento(
        parseInt(id),
        parseInt(periodo as string)
      )

      const historico = await indicadorService.calcularDisponibilidadeHistorico(
        parseInt(id),
        30
      )

      res.json({
        success: true,
        data: {
          equipamento,
          disponibilidade: disponibilidade.atual,
          tendencia: disponibilidade.tendencia,
          paradas: disponibilidade.paradas,
          historico
        }
      })
    } catch (error) {
      console.error('Erro ao calcular disponibilidade do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Performance de equipamentos
   */
  async performance(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const performance = await indicadorService.calcularPerformanceDetalhada(
        empresaId,
        parseInt(periodo as string)
      )

      res.json({
        success: true,
        data: performance
      })
    } catch (error) {
      console.error('Erro ao calcular performance:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Performance por equipamento
   */
  async performancePorEquipamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const performance = await indicadorService.calcularPerformancePorEquipamento(
        parseInt(id),
        parseInt(periodo as string)
      )

      const historico = await indicadorService.calcularPerformanceHistorico(
        parseInt(id),
        30
      )

      res.json({
        success: true,
        data: {
          equipamento,
          performance: performance.atual,
          tendencia: performance.tendencia,
          metricas: performance.metricas,
          historico
        }
      })
    } catch (error) {
      console.error('Erro ao calcular performance do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * MTBF (Mean Time Between Failures)
   */
  async mtbf(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const mtbf = await indicadorService.calcularMTBFDetalhado(
        empresaId,
        parseInt(periodo as string)
      )

      res.json({
        success: true,
        data: mtbf
      })
    } catch (error) {
      console.error('Erro ao calcular MTBF:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * MTBF por equipamento
   */
  async mtbfPorEquipamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const mtbf = await indicadorService.calcularMTBFPorEquipamento(
        parseInt(id),
        parseInt(periodo as string)
      )

      const historico = await indicadorService.calcularMTBFHistorico(
        parseInt(id),
        30
      )

      res.json({
        success: true,
        data: {
          equipamento,
          mtbf: mtbf.atual,
          tendencia: mtbf.tendencia,
          falhas: mtbf.falhas,
          historico
        }
      })
    } catch (error) {
      console.error('Erro ao calcular MTBF do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * MTTR (Mean Time To Repair)
   */
  async mttr(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const mttr = await indicadorService.calcularMTTRDetalhado(
        empresaId,
        parseInt(periodo as string)
      )

      res.json({
        success: true,
        data: mttr
      })
    } catch (error) {
      console.error('Erro ao calcular MTTR:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * MTTR por equipamento
   */
  async mttrPorEquipamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const mttr = await indicadorService.calcularMTTRPorEquipamento(
        parseInt(id),
        parseInt(periodo as string)
      )

      const historico = await indicadorService.calcularMTTRHistorico(
        parseInt(id),
        30
      )

      res.json({
        success: true,
        data: {
          equipamento,
          mttr: mttr.atual,
          tendencia: mttr.tendencia,
          reparos: mttr.reparos,
          historico
        }
      })
    } catch (error) {
      console.error('Erro ao calcular MTTR do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Custos de manutenção
   */
  async custos(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const custos = await indicadorService.calcularCustosDetalhados(
        empresaId,
        parseInt(periodo as string)
      )

      res.json({
        success: true,
        data: custos
      })
    } catch (error) {
      console.error('Erro ao calcular custos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Alertas e não conformidades
   */
  async alertas(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const alertas = await indicadorService.obterAlertasDetalhados(empresaId)

      res.json({
        success: true,
        data: alertas
      })
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Exportar relatório de indicadores
   */
  async exportar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { formato = 'pdf', periodo = '30' } = req.query

      const dados = await indicadorService.calcularTodosIndicadores(
        empresaId,
        parseInt(periodo as string)
      )

      if (formato === 'json') {
        res.json({
          success: true,
          data: dados
        })
      } else {
        // Implementar geração de PDF
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=indicadores.pdf')
        // Gerar PDF...
        res.send(dados)
      }
    } catch (error) {
      console.error('Erro ao exportar indicadores:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const indicadorController = new IndicadorController()