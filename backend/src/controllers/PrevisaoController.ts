import { Request, Response } from 'express'
import prisma from '../config/database'
import { previsaoService } from '../services/PrevisaoService'
import { z } from 'zod'

export class PrevisaoController {
  /**
   * Dashboard de previsões
   */
  async dashboard(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { meses = '12' } = req.query

      const dashboard = await previsaoService.getDashboard(empresaId, parseInt(meses as string))

      res.json({
        success: true,
        data: dashboard
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard de previsões:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Previsão de uso de equipamentos
   */
  async previsaoUsoEquipamentos(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { meses = '12' } = req.query

      const previsao = await previsaoService.preverUsoEquipamentos(empresaId, parseInt(meses as string))

      res.json({
        success: true,
        data: previsao
      })
    } catch (error) {
      console.error('Erro ao calcular previsão de uso:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Previsão de uso por equipamento
   */
  async previsaoUsoPorEquipamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { meses = '12' } = req.query

      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const previsao = await previsaoService.preverUsoPorEquipamento(
        parseInt(id),
        parseInt(meses as string)
      )

      const historico = await previsaoService.getHistoricoUsoEquipamento(parseInt(id), 30)

      res.json({
        success: true,
        data: {
          equipamento,
          previsao,
          historico,
          confiabilidade: previsaoService.calcularConfiabilidadePrevisao(historico)
        }
      })
    } catch (error) {
      console.error('Erro ao calcular previsão de uso do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Previsão de manutenções
   */
  async previsaoManutencoes(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { meses = '12' } = req.query

      const previsao = await previsaoService.preverManutencoes(empresaId, parseInt(meses as string))

      res.json({
        success: true,
        data: previsao
      })
    } catch (error) {
      console.error('Erro ao calcular previsão de manutenções:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Previsão de manutenções por equipamento
   */
  async previsaoManutencoesPorEquipamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { meses = '12' } = req.query

      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const previsao = await previsaoService.preverManutencoesPorEquipamento(
        parseInt(id),
        parseInt(meses as string)
      )

      const historico = await previsaoService.getHistoricoManutencoesEquipamento(parseInt(id), 12)

      res.json({
        success: true,
        data: {
          equipamento,
          previsao,
          historico,
          recomendacoes: previsaoService.gerarRecomendacoesManutencao(previsao)
        }
      })
    } catch (error) {
      console.error('Erro ao calcular previsão de manutenções do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Previsão de custos
   */
  async previsaoCustos(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { meses = '12' } = req.query

      const previsao = await previsaoService.preverCustos(empresaId, parseInt(meses as string))

      res.json({
        success: true,
        data: previsao
      })
    } catch (error) {
      console.error('Erro ao calcular previsão de custos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Análise de tendências
   */
  async analiseTendencias(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { meses = '12' } = req.query

      const tendencias = await previsaoService.analisarTendencias(empresaId, parseInt(meses as string))

      res.json({
        success: true,
        data: tendencias
      })
    } catch (error) {
      console.error('Erro ao analisar tendências:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Alertas preditivos
   */
  async alertasPreditivos(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const alertas = await previsaoService.gerarAlertasPreditivos(empresaId)

      res.json({
        success: true,
        data: alertas
      })
    } catch (error) {
      console.error('Erro ao gerar alertas preditivos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Cenários simulados
   */
  async cenariosSimulados(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { tipo, parametros } = req.body

      const cenarios = await previsaoService.simularCenarios(empresaId, tipo, parametros)

      res.json({
        success: true,
        data: cenarios
      })
    } catch (error) {
      console.error('Erro ao simular cenários:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Recomendações baseadas em previsões
   */
  async recomendacoes(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const recomendacoes = await previsaoService.gerarRecomendacoes(empresaId)

      res.json({
        success: true,
        data: recomendacoes
      })
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Exportar relatório de previsões
   */
  async exportar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { formato = 'pdf', tipo = 'completo', meses = '12' } = req.query

      const relatorio = await previsaoService.gerarRelatorioPrevisoes(
        empresaId,
        tipo as string,
        parseInt(meses as string)
      )

      if (formato === 'json') {
        res.json({
          success: true,
          data: relatorio
        })
      } else if (formato === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=previsoes-${tipo}.csv`)
        res.send(relatorio)
      } else {
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=previsoes-${tipo}.pdf`)
        res.send(relatorio)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const previsaoController = new PrevisaoController()