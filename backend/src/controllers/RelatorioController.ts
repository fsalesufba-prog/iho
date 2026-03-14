import { Request, Response } from 'express'
import prisma from '../config/database'
import { relatorioService } from '../services/RelatorioService'
import { pdfService } from '../services/PdfService'
import { excelService } from '../services/ExcelService'
import { z } from 'zod'

// Validações
const gerarRelatorioSchema = z.object({
  tipo: z.enum(['gerencial', 'operacional', 'financeiro', 'manutencao', 'personalizado']),
  formato: z.enum(['pdf', 'excel', 'csv', 'json']).default('pdf'),
  periodoInicio: z.string().optional(),
  periodoFim: z.string().optional(),
  filtros: z.record(z.any()).optional(),
  agruparPor: z.string().optional(),
  ordenarPor: z.string().optional(),
  limite: z.number().int().optional()
})

const criarRelatorioPersonalizadoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['operacional', 'financeiro', 'manutencao', 'equipamentos', 'obras']),
  configuracoes: z.object({
    colunas: z.array(z.string()),
    filtros: z.record(z.any()).optional(),
    agrupamento: z.string().optional(),
    ordenacao: z.string().optional(),
    graficos: z.array(z.object({
      tipo: z.enum(['barra', 'linha', 'pizza', 'tabela']),
      titulo: z.string(),
      dados: z.array(z.string())
    })).optional()
  }),
  agendado: z.boolean().default(false),
  frequencia: z.enum(['diario', 'semanal', 'mensal']).optional(),
  destinatarios: z.array(z.string().email()).optional()
})

const atualizarRelatorioPersonalizadoSchema = criarRelatorioPersonalizadoSchema.partial()

export class RelatorioController {
  /**
   * Dashboard de relatórios
   */
  async dashboard(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const [relatoriosRecentes, relatoriosAgendados, estatisticas] = await Promise.all([
        relatorioService.listarRecentes(empresaId),
        relatorioService.listarAgendados(empresaId),
        relatorioService.obterEstatisticas(empresaId)
      ])

      res.json({
        success: true,
        data: {
          recentes: relatoriosRecentes,
          agendados: relatoriosAgendados,
          estatisticas
        }
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard de relatórios:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Gerar relatório
   */
  async gerar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = gerarRelatorioSchema.parse(req.body)

      let relatorio: any
      let filename: string

      switch (dados.tipo) {
        case 'gerencial':
          relatorio = await relatorioService.gerarRelatorioGerencial(empresaId, dados)
          filename = 'relatorio-gerencial'
          break
        case 'operacional':
          relatorio = await relatorioService.gerarRelatorioOperacional(empresaId, dados)
          filename = 'relatorio-operacional'
          break
        case 'financeiro':
          relatorio = await relatorioService.gerarRelatorioFinanceiro(empresaId, dados)
          filename = 'relatorio-financeiro'
          break
        case 'manutencao':
          relatorio = await relatorioService.gerarRelatorioManutencao(empresaId, dados)
          filename = 'relatorio-manutencao'
          break
        default:
          return res.status(400).json({ error: 'Tipo de relatório inválido' })
      }

      // Registrar geração do relatório
<<<<<<< HEAD
      await prisma.relatorioLog.create({
=======
      await (prisma as any).relatorioLog.create({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        data: {
          empresaId,
          tipo: dados.tipo,
          formato: dados.formato,
          usuarioId: (req as any).usuario.id,
          parametros: dados
        }
      })

      if (dados.formato === 'json') {
        res.json({
          success: true,
          data: relatorio
        })
      } else if (dados.formato === 'csv') {
        const csv = await relatorioService.converterParaCSV(relatorio)
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`)
        res.send(csv)
      } else if (dados.formato === 'excel') {
        const excel = await excelService.gerarRelatorio(relatorio, dados.tipo)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`)
        res.send(excel)
      } else {
        const pdf = await pdfService.gerarRelatorio(relatorio, dados.tipo)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`)
        res.send(pdf)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao gerar relatório:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar relatórios gerenciais
   */
  async listarGerenciais(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page = 1, limit = 10 } = req.query

      const relatorios = await relatorioService.listarGerenciais(empresaId, {
        page: Number(page),
        limit: Number(limit)
      })

      res.json({
        success: true,
        ...relatorios
      })
    } catch (error) {
      console.error('Erro ao listar relatórios gerenciais:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Gerar relatório operacional
   */
  async gerarOperacional(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { formato = 'pdf', periodo } = req.query

      const dados = {
        tipo: 'operacional',
        formato: formato as string,
        periodoInicio: periodo ? String(periodo) : undefined
      }

      const relatorio = await relatorioService.gerarRelatorioOperacional(empresaId, dados)

      if (formato === 'json') {
        res.json({ success: true, data: relatorio })
      } else {
        const pdf = await pdfService.gerarRelatorio(relatorio, 'operacional')
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-operacional.pdf')
        res.send(pdf)
      }
    } catch (error) {
      console.error('Erro ao gerar relatório operacional:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Gerar relatório financeiro
   */
  async gerarFinanceiro(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { formato = 'pdf', periodo } = req.query

      const dados = {
        tipo: 'financeiro',
        formato: formato as string,
        periodoInicio: periodo ? String(periodo) : undefined
      }

      const relatorio = await relatorioService.gerarRelatorioFinanceiro(empresaId, dados)

      if (formato === 'json') {
        res.json({ success: true, data: relatorio })
      } else {
        const pdf = await pdfService.gerarRelatorio(relatorio, 'financeiro')
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-financeiro.pdf')
        res.send(pdf)
      }
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Gerar relatório de manutenção
   */
  async gerarManutencao(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { formato = 'pdf', periodo, equipamentoId } = req.query

      const dados = {
        tipo: 'manutencao',
        formato: formato as string,
        periodoInicio: periodo ? String(periodo) : undefined,
        filtros: equipamentoId ? { equipamentoId: Number(equipamentoId) } : undefined
      }

      const relatorio = await relatorioService.gerarRelatorioManutencao(empresaId, dados)

      if (formato === 'json') {
        res.json({ success: true, data: relatorio })
      } else {
        const pdf = await pdfService.gerarRelatorio(relatorio, 'manutencao')
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-manutencao.pdf')
        res.send(pdf)
      }
    } catch (error) {
      console.error('Erro ao gerar relatório de manutenção:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar relatórios personalizados
   */
  async listarPersonalizados(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

<<<<<<< HEAD
      const relatorios = await prisma.relatorioPersonalizado.findMany({
=======
      const relatorios = await (prisma as any).relatorioPersonalizado.findMany({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { 
          OR: [
            { empresaId },
            { isPublico: true }
          ]
        },
        orderBy: { nome: 'asc' }
      })

      res.json({
        success: true,
        data: relatorios
      })
    } catch (error) {
      console.error('Erro ao listar relatórios personalizados:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Criar relatório personalizado
   */
  async criarPersonalizado(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = criarRelatorioPersonalizadoSchema.parse(req.body)

<<<<<<< HEAD
      const relatorio = await prisma.relatorioPersonalizado.create({
=======
      const relatorio = await (prisma as any).relatorioPersonalizado.create({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        data: {
          ...dados,
          empresaId,
          createdById: (req as any).usuario.id
        }
      })

      // Se for agendado, criar job
      if (dados.agendado && dados.frequencia && dados.destinatarios) {
        await relatorioService.agendarRelatorio(relatorio.id, dados)
      }

      res.status(201).json({
        success: true,
        message: 'Relatório personalizado criado com sucesso',
        data: relatorio
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao criar relatório personalizado:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar relatório personalizado por ID
   */
  async buscarPersonalizadoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

<<<<<<< HEAD
      const relatorio = await prisma.relatorioPersonalizado.findFirst({
=======
      const relatorio = await (prisma as any).relatorioPersonalizado.findFirst({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { 
          id: parseInt(id),
          OR: [
            { empresaId },
            { isPublico: true }
          ]
        },
        include: {
          createdBy: {
            select: { id: true, nome: true }
          }
        }
      })

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' })
      }

      res.json({
        success: true,
        data: relatorio
      })
    } catch (error) {
      console.error('Erro ao buscar relatório personalizado:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar relatório personalizado
   */
  async atualizarPersonalizado(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const dados = atualizarRelatorioPersonalizadoSchema.parse(req.body)

<<<<<<< HEAD
      const relatorio = await prisma.relatorioPersonalizado.findFirst({
=======
      const relatorio = await (prisma as any).relatorioPersonalizado.findFirst({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { 
          id: parseInt(id),
          empresaId 
        }
      })

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' })
      }

<<<<<<< HEAD
      const updated = await prisma.relatorioPersonalizado.update({
=======
      const updated = await (prisma as any).relatorioPersonalizado.update({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { id: parseInt(id) },
        data: dados
      })

      // Atualizar agendamento se necessário
      if (dados.agendado !== undefined || dados.frequencia || dados.destinatarios) {
        await relatorioService.atualizarAgendamento(updated.id, updated)
      }

      res.json({
        success: true,
        message: 'Relatório atualizado com sucesso',
        data: updated
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao atualizar relatório personalizado:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Executar relatório personalizado
   */
  async executarPersonalizado(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { formato = 'pdf', periodo } = req.query

<<<<<<< HEAD
      const relatorio = await prisma.relatorioPersonalizado.findFirst({
=======
      const relatorio = await (prisma as any).relatorioPersonalizado.findFirst({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { 
          id: parseInt(id),
          OR: [
            { empresaId },
            { isPublico: true }
          ]
        }
      })

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' })
      }

      const dados = {
        tipo: 'personalizado',
        formato: formato as string,
        periodoInicio: periodo ? String(periodo) : undefined,
        configuracao: relatorio.configuracoes
      }

      const resultado = await relatorioService.executarRelatorioPersonalizado(empresaId, relatorio, dados)

      if (formato === 'json') {
        res.json({ success: true, data: resultado })
      } else if (formato === 'csv') {
        const csv = await relatorioService.converterParaCSV(resultado)
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=${relatorio.nome}.csv`)
        res.send(csv)
      } else if (formato === 'excel') {
        const excel = await excelService.gerarRelatorio(resultado, 'personalizado')
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=${relatorio.nome}.xlsx`)
        res.send(excel)
      } else {
        const pdf = await pdfService.gerarRelatorio(resultado, 'personalizado')
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=${relatorio.nome}.pdf`)
        res.send(pdf)
      }
    } catch (error) {
      console.error('Erro ao executar relatório personalizado:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Excluir relatório personalizado
   */
  async excluirPersonalizado(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

<<<<<<< HEAD
      const relatorio = await prisma.relatorioPersonalizado.findFirst({
=======
      const relatorio = await (prisma as any).relatorioPersonalizado.findFirst({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { 
          id: parseInt(id),
          empresaId 
        }
      })

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' })
      }

      // Remover agendamento se existir
      if (relatorio.agendado) {
        await relatorioService.removerAgendamento(relatorio.id)
      }

<<<<<<< HEAD
      await prisma.relatorioPersonalizado.delete({
=======
      await (prisma as any).relatorioPersonalizado.delete({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { id: parseInt(id) }
      })

      res.json({
        success: true,
        message: 'Relatório excluído com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir relatório personalizado:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar relatórios agendados
   */
  async listarAgendados(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

<<<<<<< HEAD
      const agendados = await prisma.relatorioPersonalizado.findMany({
=======
      const agendados = await (prisma as any).relatorioPersonalizado.findMany({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { 
          empresaId,
          agendado: true
        },
        orderBy: { createdAt: 'desc' }
      })

      res.json({
        success: true,
        data: agendados
      })
    } catch (error) {
      console.error('Erro ao listar relatórios agendados:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar relatório agendado por ID
   */
  async buscarAgendadoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

<<<<<<< HEAD
      const agendado = await prisma.relatorioPersonalizado.findFirst({
=======
      const agendado = await (prisma as any).relatorioPersonalizado.findFirst({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { 
          id: parseInt(id),
          empresaId,
          agendado: true
        }
      })

      if (!agendado) {
        return res.status(404).json({ error: 'Relatório agendado não encontrado' })
      }

      res.json({
        success: true,
        data: agendado
      })
    } catch (error) {
      console.error('Erro ao buscar relatório agendado:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Ativar/desativar agendamento
   */
  async toggleAgendamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const { ativo } = req.body

<<<<<<< HEAD
      const relatorio = await prisma.relatorioPersonalizado.findFirst({
=======
      const relatorio = await (prisma as any).relatorioPersonalizado.findFirst({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { 
          id: parseInt(id),
          empresaId 
        }
      })

      if (!relatorio) {
        return res.status(404).json({ error: 'Relatório não encontrado' })
      }

<<<<<<< HEAD
      const updated = await prisma.relatorioPersonalizado.update({
=======
      const updated = await (prisma as any).relatorioPersonalizado.update({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { id: parseInt(id) },
        data: { agendado: ativo }
      })

      if (ativo) {
        await relatorioService.agendarRelatorio(updated.id, updated)
      } else {
        await relatorioService.removerAgendamento(updated.id)
      }

      res.json({
        success: true,
        message: ativo ? 'Agendamento ativado' : 'Agendamento desativado',
        data: updated
      })
    } catch (error) {
      console.error('Erro ao alterar agendamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Histórico de relatórios gerados
   */
  async historico(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page = 1, limit = 20 } = req.query

<<<<<<< HEAD
      const historico = await prisma.relatorioLog.findMany({
=======
      const historico = await (prisma as any).relatorioLog.findMany({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { empresaId },
        include: {
          usuario: {
            select: { id: true, nome: true }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      })

<<<<<<< HEAD
      const total = await prisma.relatorioLog.count({
=======
      const total = await (prisma as any).relatorioLog.count({
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        where: { empresaId }
      })

      res.json({
        success: true,
        data: historico,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const relatorioController = new RelatorioController()