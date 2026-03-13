import { Request, Response } from 'express'
import prisma from '../config/database'
import { z } from 'zod'
import { medicaoService } from '../services/MedicaoService'
import { pdfService } from '../services/PdfService'
import { excelService } from '../services/ExcelService'

// Validações
const criarMedicaoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  obraId: z.number().int().positive(),
  periodoInicio: z.string().datetime(),
  periodoFim: z.string().datetime(),
  equipamentos: z.array(z.object({
    equipamentoId: z.number().int().positive(),
    horasTrabalhadas: z.number().positive(),
    valorUnitario: z.number().positive(),
    valorTotal: z.number().positive()
  })),
  observacoes: z.string().optional(),
  modeloId: z.number().int().positive().optional()
})

const listarMedicoesSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  obraId: z.string().optional().transform(Number).optional(),
  periodoInicio: z.string().optional(),
  periodoFim: z.string().optional(),
  status: z.enum(['rascunho', 'emitida', 'aprovada', 'cancelada']).optional()
})

export class MedicaoController {
  /**
   * Listar medições
   */
  async listar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page, limit, obraId, periodoInicio, periodoFim, status } = 
        listarMedicoesSchema.parse(req.query)

      const result = await medicaoService.listar(empresaId, {
        page,
        limit,
        obraId,
        periodoInicio,
        periodoFim,
        status
      })

      res.json({
        success: true,
        ...result
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao listar medições:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar medição por ID
   */
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const medicao = await prisma.medicao.findFirst({
        where: { 
          id: parseInt(id),
          obra: {
            empresaId
          }
        },
        include: {
          obra: {
            include: {
              cliente: true
            }
          },
          equipamentos: {
            include: {
              equipamento: true
            }
          },
          modelo: true,
          createdBy: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      })

      if (!medicao) {
        return res.status(404).json({ error: 'Medição não encontrada' })
      }

      res.json({
        success: true,
        data: medicao
      })
    } catch (error) {
      console.error('Erro ao buscar medição:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Criar nova medição
   */
  async criar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = criarMedicaoSchema.parse(req.body)

      // Verificar se obra existe e pertence à empresa
      const obra = await prisma.obra.findFirst({
        where: {
          id: dados.obraId,
          empresaId
        }
      })

      if (!obra) {
        return res.status(404).json({ error: 'Obra não encontrada' })
      }

      // Calcular totais
      const valorTotal = dados.equipamentos.reduce((sum, item) => sum + item.valorTotal, 0)
      const horasTotal = dados.equipamentos.reduce((sum, item) => sum + item.horasTrabalhadas, 0)

      // Criar medição
      const medicao = await prisma.medicao.create({
        data: {
          titulo: dados.titulo,
          obraId: dados.obraId,
          periodoInicio: new Date(dados.periodoInicio),
          periodoFim: new Date(dados.periodoFim),
          valorTotal,
          horasTotal,
          observacoes: dados.observacoes,
          status: 'rascunho',
          modeloId: dados.modeloId,
          createdById: (req as any).usuario.id,
          equipamentos: {
            create: dados.equipamentos.map(item => ({
              equipamentoId: item.equipamentoId,
              horasTrabalhadas: item.horasTrabalhadas,
              valorUnitario: item.valorUnitario,
              valorTotal: item.valorTotal
            }))
          }
        },
        include: {
          equipamentos: {
            include: {
              equipamento: true
            }
          }
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'CRIAR_MEDICAO',
          entidade: 'medicao',
          entidadeId: medicao.id,
          dadosNovos: JSON.stringify(medicao),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.status(201).json({
        success: true,
        message: 'Medição criada com sucesso',
        data: medicao
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao criar medição:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar medição
   */
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const dados = criarMedicaoSchema.partial().parse(req.body)

      const medicaoAtual = await prisma.medicao.findFirst({
        where: { 
          id: parseInt(id),
          obra: {
            empresaId
          }
        }
      })

      if (!medicaoAtual) {
        return res.status(404).json({ error: 'Medição não encontrada' })
      }

      if (medicaoAtual.status !== 'rascunho') {
        return res.status(400).json({ error: 'Apenas medições em rascunho podem ser editadas' })
      }

      const medicao = await prisma.medicao.update({
        where: { id: parseInt(id) },
        data: {
          titulo: dados.titulo,
          periodoInicio: dados.periodoInicio ? new Date(dados.periodoInicio) : undefined,
          periodoFim: dados.periodoFim ? new Date(dados.periodoFim) : undefined,
          observacoes: dados.observacoes
        },
        include: {
          equipamentos: {
            include: {
              equipamento: true
            }
          }
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'ATUALIZAR_MEDICAO',
          entidade: 'medicao',
          entidadeId: medicao.id,
          dadosAntigos: JSON.stringify(medicaoAtual),
          dadosNovos: JSON.stringify(medicao),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Medição atualizada com sucesso',
        data: medicao
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao atualizar medição:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Emitir medição (gerar PDF)
   */
  async emitir(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { formato = 'pdf' } = req.query
      const { id: empresaId } = (req as any).empresa

      const medicao = await prisma.medicao.findFirst({
        where: { 
          id: parseInt(id),
          obra: {
            empresaId
          }
        },
        include: {
          obra: {
            include: {
              cliente: true
            }
          },
          equipamentos: {
            include: {
              equipamento: true
            }
          },
          createdBy: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      })

      if (!medicao) {
        return res.status(404).json({ error: 'Medição não encontrada' })
      }

      // Atualizar status para emitida
      await prisma.medicao.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'emitida',
          dataEmissao: new Date()
        }
      })

      if (formato === 'pdf') {
        const pdf = await pdfService.gerarMedicao(medicao)
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=medicao-${medicao.id}.pdf`)
        res.send(pdf)
      } else if (formato === 'excel') {
        const excel = await excelService.gerarMedicao(medicao)
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=medicao-${medicao.id}.xlsx`)
        res.send(excel)
      }
    } catch (error) {
      console.error('Erro ao emitir medição:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Aprovar medição
   */
  async aprovar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { observacoes } = req.body
      const { id: empresaId } = (req as any).empresa

      const medicao = await prisma.medicao.findFirst({
        where: { 
          id: parseInt(id),
          obra: {
            empresaId
          }
        }
      })

      if (!medicao) {
        return res.status(404).json({ error: 'Medição não encontrada' })
      }

      if (medicao.status !== 'emitida') {
        return res.status(400).json({ error: 'Apenas medições emitidas podem ser aprovadas' })
      }

      const updated = await prisma.medicao.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'aprovada',
          observacoesAprovacao: observacoes,
          dataAprovacao: new Date(),
          aprovadoPorId: (req as any).usuario.id
        }
      })

      res.json({
        success: true,
        message: 'Medição aprovada com sucesso',
        data: updated
      })
    } catch (error) {
      console.error('Erro ao aprovar medição:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Cancelar medição
   */
  async cancelar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { motivo } = req.body
      const { id: empresaId } = (req as any).empresa

      const medicao = await prisma.medicao.findFirst({
        where: { 
          id: parseInt(id),
          obra: {
            empresaId
          }
        }
      })

      if (!medicao) {
        return res.status(404).json({ error: 'Medição não encontrada' })
      }

      const updated = await prisma.medicao.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'cancelada',
          motivoCancelamento: motivo
        }
      })

      res.json({
        success: true,
        message: 'Medição cancelada com sucesso',
        data: updated
      })
    } catch (error) {
      console.error('Erro ao cancelar medição:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar modelos de medição
   */
  async listarModelos(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const modelos = await prisma.modeloMedicao.findMany({
        where: { 
          OR: [
            { empresaId },
            { isPublic: true }
          ]
        },
        orderBy: { nome: 'asc' }
      })

      res.json({
        success: true,
        data: modelos
      })
    } catch (error) {
      console.error('Erro ao listar modelos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar modelo por ID
   */
  async buscarModeloPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const modelo = await prisma.modeloMedicao.findFirst({
        where: { 
          id: parseInt(id),
          OR: [
            { empresaId },
            { isPublic: true }
          ]
        }
      })

      if (!modelo) {
        return res.status(404).json({ error: 'Modelo não encontrado' })
      }

      res.json({
        success: true,
        data: modelo
      })
    } catch (error) {
      console.error('Erro ao buscar modelo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Download de medição
   */
  async download(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { formato = 'pdf' } = req.query
      const { id: empresaId } = (req as any).empresa

      const medicao = await prisma.medicao.findFirst({
        where: { 
          id: parseInt(id),
          obra: {
            empresaId
          }
        },
        include: {
          obra: {
            include: {
              cliente: true
            }
          },
          equipamentos: {
            include: {
              equipamento: true
            }
          }
        }
      })

      if (!medicao) {
        return res.status(404).json({ error: 'Medição não encontrada' })
      }

      if (formato === 'pdf') {
        const pdf = await pdfService.gerarMedicao(medicao)
        
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=medicao-${medicao.id}.pdf`)
        res.send(pdf)
      } else if (formato === 'excel') {
        const excel = await excelService.gerarMedicao(medicao)
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename=medicao-${medicao.id}.xlsx`)
        res.send(excel)
      }
    } catch (error) {
      console.error('Erro ao fazer download da medição:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Excluir medição
   */
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const medicao = await prisma.medicao.findFirst({
        where: { 
          id: parseInt(id),
          obra: {
            empresaId
          }
        }
      })

      if (!medicao) {
        return res.status(404).json({ error: 'Medição não encontrada' })
      }

      if (medicao.status !== 'rascunho') {
        return res.status(400).json({ error: 'Apenas medições em rascunho podem ser excluídas' })
      }

      // Excluir equipamentos relacionados
      await prisma.medicaoEquipamento.deleteMany({
        where: { medicaoId: parseInt(id) }
      })

      // Excluir medição
      await prisma.medicao.delete({
        where: { id: parseInt(id) }
      })

      res.json({
        success: true,
        message: 'Medição excluída com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir medição:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const medicaoController = new MedicaoController()