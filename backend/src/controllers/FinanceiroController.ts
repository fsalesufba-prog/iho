import { Request, Response } from 'express'
import prisma from '../config/database'
import { financeiroService } from '../services/FinanceiroService'
import { z } from 'zod'

export class FinanceiroController {
  /**
   * Dashboard financeiro principal
   */
  async dashboard(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const dashboard = await financeiroService.getDashboard(empresaId, parseInt(periodo as string))

      res.json({
        success: true,
        data: dashboard
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard financeiro:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Análise de depreciação
   */
  async depreciacao(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const depreciacao = await financeiroService.getAnaliseDepreciacao(empresaId, parseInt(periodo as string))

      res.json({
        success: true,
        data: depreciacao
      })
    } catch (error) {
      console.error('Erro ao carregar análise de depreciação:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Depreciação por equipamento
   */
  async depreciacaoPorEquipamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const depreciacao = await financeiroService.calcularDepreciacaoEquipamento(parseInt(id))

      res.json({
        success: true,
        data: {
          equipamento,
<<<<<<< HEAD
          ...depreciacao
=======
          ...(depreciacao as any)
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        }
      })
    } catch (error) {
      console.error('Erro ao calcular depreciação do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Depreciação por classe de equipamento
   */
  async depreciacaoPorClasse(req: Request, res: Response) {
    try {
      const { tipo } = req.params
      const { id: empresaId } = (req as any).empresa

      const equipamentos = await prisma.equipamento.findMany({
        where: {
          empresaId,
          tipo
        }
      })

      if (equipamentos.length === 0) {
        return res.status(404).json({ error: 'Nenhum equipamento encontrado para esta classe' })
      }

      const depreciacao = await financeiroService.calcularDepreciacaoClasse(empresaId, tipo)

      res.json({
        success: true,
        data: {
          classe: tipo,
<<<<<<< HEAD
          totalEquipamentos: equipamentos.length,
          ...depreciacao
=======
          ...(depreciacao as any),
          totalEquipamentos: equipamentos.length
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        }
      })
    } catch (error) {
      console.error('Erro ao calcular depreciação por classe:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Análise de patrimônio
   */
  async patrimonio(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const patrimonio = await financeiroService.getAnalisePatrimonio(empresaId)

      res.json({
        success: true,
        data: patrimonio
      })
    } catch (error) {
      console.error('Erro ao carregar análise de patrimônio:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Relatório de patrimônio
   */
  async relatorioPatrimonio(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { formato = 'pdf' } = req.query

      const relatorio = await financeiroService.gerarRelatorioPatrimonio(empresaId)

      if (formato === 'json') {
        res.json({
          success: true,
          data: relatorio
        })
      } else {
        // Implementar geração de PDF
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-patrimonio.pdf')
        res.send(relatorio)
      }
    } catch (error) {
      console.error('Erro ao gerar relatório de patrimônio:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Análise de custos
   */
  async custos(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const custos = await financeiroService.getAnaliseCustos(empresaId, parseInt(periodo as string))

      res.json({
        success: true,
        data: custos
      })
    } catch (error) {
      console.error('Erro ao carregar análise de custos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Custos por equipamento
   */
  async custosPorEquipamento(req: Request, res: Response) {
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

      const custos = await financeiroService.calcularCustosEquipamento(
        parseInt(id),
        parseInt(periodo as string)
      )

      res.json({
        success: true,
        data: {
          equipamento,
          ...custos
        }
      })
    } catch (error) {
      console.error('Erro ao calcular custos do equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Análise de receitas
   */
  async receitas(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const receitas = await financeiroService.getAnaliseReceitas(empresaId, parseInt(periodo as string))

      res.json({
        success: true,
        data: receitas
      })
    } catch (error) {
      console.error('Erro ao carregar análise de receitas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Fluxo de caixa
   */
  async fluxoCaixa(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = '30' } = req.query

      const fluxo = await financeiroService.calcularFluxoCaixa(empresaId, parseInt(periodo as string))

      res.json({
        success: true,
        data: fluxo
      })
    } catch (error) {
      console.error('Erro ao calcular fluxo de caixa:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Projeções financeiras
   */
  async projecoes(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { meses = '12' } = req.query

      const projecoes = await financeiroService.calcularProjecoes(empresaId, parseInt(meses as string))

      res.json({
        success: true,
        data: projecoes
      })
    } catch (error) {
      console.error('Erro ao calcular projeções:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Exportar relatório financeiro
   */
  async exportar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { formato = 'pdf', tipo = 'completo', periodo = '30' } = req.query

      const relatorio = await financeiroService.gerarRelatorioFinanceiro(
        empresaId,
        tipo as string,
        parseInt(periodo as string)
      )

      if (formato === 'json') {
        res.json({
          success: true,
          data: relatorio
        })
      } else if (formato === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-${tipo}.csv`)
        res.send(relatorio)
      } else {
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-${tipo}.pdf`)
        res.send(relatorio)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const financeiroController = new FinanceiroController()