import { Request, Response } from 'express'
import prisma from '../config/database'
import { z } from 'zod'
import { manutencaoService } from '../services/ManutencaoService'
import { logService } from '../services/LogService'

// Validações
const criarManutencaoSchema = z.object({
  equipamentoId: z.number().int().positive(),
  tipo: z.enum(['preventiva', 'corretiva', 'preditiva']),
  dataProgramada: z.string().datetime(),
  dataRealizada: z.string().datetime().optional().nullable(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  observacoes: z.string().optional().nullable(),
  horasEquipamento: z.number().int().default(0),
  custo: z.number().optional().nullable(),
  status: z.enum(['programada', 'em_andamento', 'concluida', 'cancelada']).default('programada'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']).default('media'),
  itens: z.array(z.object({
    descricao: z.string().min(1),
    quantidade: z.number().int().positive(),
    valorUnitario: z.number().optional().nullable(),
    tipo: z.enum(['servico', 'peca', 'insumo'])
  })).optional().default([])
})

const atualizarManutencaoSchema = z.object({
  dataProgramada: z.string().datetime().optional(),
  dataRealizada: z.string().datetime().optional().nullable(),
  descricao: z.string().optional(),
  observacoes: z.string().optional().nullable(),
  horasEquipamento: z.number().int().optional(),
  custo: z.number().optional().nullable(),
  status: z.enum(['programada', 'em_andamento', 'concluida', 'cancelada']).optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']).optional()
})

const listarManutencoesSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  equipamentoId: z.string().optional().transform(Number).optional(),
  tipo: z.enum(['preventiva', 'corretiva', 'preditiva']).optional(),
  status: z.enum(['programada', 'em_andamento', 'concluida', 'cancelada']).optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional()
})

export class ManutencaoController {
  /**
   * Listar manutenções
   */
  async listar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page, limit, equipamentoId, tipo, status, prioridade, dataInicio, dataFim } = 
        listarManutencoesSchema.parse(req.query)

      const result = await manutencaoService.listar(empresaId, {
        page,
        limit,
        equipamentoId,
        tipo,
        status,
        prioridade,
        dataInicio,
        dataFim
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
      console.error('Erro ao listar manutenções:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar manutenção por ID
   */
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const manutencao = await prisma.manutencao.findFirst({
        where: { 
          id: parseInt(id),
          equipamento: {
            empresaId
          }
        },
        include: {
          equipamento: {
            include: {
              obra: {
                select: { id: true, nome: true }
              }
            }
          },
          itens: true
        }
      })

      if (!manutencao) {
        return res.status(404).json({ error: 'Manutenção não encontrada' })
      }

      res.json(manutencao)
    } catch (error) {
      console.error('Erro ao buscar manutenção:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Criar nova manutenção
   */
  async criar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = criarManutencaoSchema.parse(req.body)

      // Verificar se equipamento existe e pertence à empresa
      const equipamento = await prisma.equipamento.findFirst({
        where: {
          id: dados.equipamentoId,
          empresaId
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      // Criar manutenção com itens
      const manutencao = await prisma.manutencao.create({
        data: {
          equipamentoId: dados.equipamentoId,
          tipo: dados.tipo,
          dataProgramada: new Date(dados.dataProgramada),
          dataRealizada: dados.dataRealizada ? new Date(dados.dataRealizada) : null,
          descricao: dados.descricao,
          observacoes: dados.observacoes,
          horasEquipamento: dados.horasEquipamento,
          custo: dados.custo,
          status: dados.status,
          prioridade: dados.prioridade,
          itens: {
            create: dados.itens.map(item => ({
              descricao: item.descricao,
              quantidade: item.quantidade,
              valorUnitario: item.valorUnitario,
              tipo: item.tipo
            }))
          }
        },
        include: {
          itens: true
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'CRIAR_MANUTENCAO',
          entidade: 'manutencao',
          entidadeId: manutencao.id,
          dadosNovos: JSON.stringify(manutencao),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      // Criar entrada no histórico do equipamento
      await prisma.historicoEquipamento.create({
        data: {
          equipamentoId: dados.equipamentoId,
          tipo: 'manutencao',
          descricao: `Manutenção ${dados.tipo} programada: ${dados.descricao.substring(0, 100)}`,
          usuarioId: (req as any).usuario?.id
        }
      })

      res.status(201).json({
        success: true,
        message: 'Manutenção criada com sucesso',
        data: manutencao
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao criar manutenção:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar manutenção
   */
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const dados = atualizarManutencaoSchema.parse(req.body)

      // Buscar manutenção atual
      const manutencaoAtual = await prisma.manutencao.findFirst({
        where: { 
          id: parseInt(id),
          equipamento: {
            empresaId
          }
        }
      })

      if (!manutencaoAtual) {
        return res.status(404).json({ error: 'Manutenção não encontrada' })
      }

      // Atualizar manutenção
      const manutencao = await prisma.manutencao.update({
        where: { id: parseInt(id) },
        data: {
          dataProgramada: dados.dataProgramada ? new Date(dados.dataProgramada) : undefined,
          dataRealizada: dados.dataRealizada ? new Date(dados.dataRealizada) : undefined,
          descricao: dados.descricao,
          observacoes: dados.observacoes,
          horasEquipamento: dados.horasEquipamento,
          custo: dados.custo,
          status: dados.status,
          prioridade: dados.prioridade
        },
        include: {
          itens: true
        }
      })

      // Se status mudou para concluida, atualizar status do equipamento se necessário
      if (dados.status === 'concluida' && manutencaoAtual.status !== 'concluida') {
        await prisma.equipamento.update({
          where: { id: manutencao.equipamentoId },
          data: { status: 'disponivel' }
        })

        // Registrar no histórico
        await prisma.historicoEquipamento.create({
          data: {
            equipamentoId: manutencao.equipamentoId,
            tipo: 'manutencao',
            descricao: `Manutenção concluída: ${manutencao.descricao.substring(0, 100)}`,
            usuarioId: (req as any).usuario?.id
          }
        })
      }

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'ATUALIZAR_MANUTENCAO',
          entidade: 'manutencao',
          entidadeId: manutencao.id,
          dadosAntigos: JSON.stringify(manutencaoAtual),
          dadosNovos: JSON.stringify(manutencao),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Manutenção atualizada com sucesso',
        data: manutencao
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao atualizar manutenção:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar status da manutenção
   */
  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body
      const { id: empresaId } = (req as any).empresa

      const manutencaoAtual = await prisma.manutencao.findFirst({
        where: { 
          id: parseInt(id),
          equipamento: {
            empresaId
          }
        }
      })

      if (!manutencaoAtual) {
        return res.status(404).json({ error: 'Manutenção não encontrada' })
      }

      const manutencao = await prisma.manutencao.update({
        where: { id: parseInt(id) },
        data: { status }
      })

      // Se status mudou para 'em_andamento', atualizar status do equipamento
      if (status === 'em_andamento') {
        await prisma.equipamento.update({
          where: { id: manutencao.equipamentoId },
          data: { status: 'manutencao' }
        })
      }

      // Se status mudou para 'concluida', atualizar data de realização
      if (status === 'concluida') {
        await prisma.manutencao.update({
          where: { id: parseInt(id) },
          data: { dataRealizada: new Date() }
        })

        await prisma.equipamento.update({
          where: { id: manutencao.equipamentoId },
          data: { status: 'disponivel' }
        })
      }

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: `ATUALIZAR_STATUS_MANUTENCAO_${status.toUpperCase()}`,
          entidade: 'manutencao',
          entidadeId: manutencao.id,
          dadosAntigos: JSON.stringify({ status: manutencaoAtual.status }),
          dadosNovos: JSON.stringify({ status }),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: manutencao
      })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Adicionar item à manutenção
   */
  async adicionarItem(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { descricao, quantidade, valorUnitario, tipo } = req.body
      const { id: empresaId } = (req as any).empresa

      const manutencao = await prisma.manutencao.findFirst({
        where: { 
          id: parseInt(id),
          equipamento: {
            empresaId
          }
        }
      })

      if (!manutencao) {
        return res.status(404).json({ error: 'Manutenção não encontrada' })
      }

      const item = await prisma.manutencaoItem.create({
        data: {
          manutencaoId: parseInt(id),
          descricao,
          quantidade,
          valorUnitario,
          tipo
        }
      })

      // Atualizar custo total da manutenção
      if (valorUnitario) {
        const novoCusto = (manutencao.custo || 0) + (valorUnitario * quantidade)
        await prisma.manutencao.update({
          where: { id: parseInt(id) },
          data: { custo: novoCusto }
        })
      }

      res.status(201).json({
        success: true,
        message: 'Item adicionado com sucesso',
        data: item
      })
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Remover item da manutenção
   */
  async removerItem(req: Request, res: Response) {
    try {
      const { id, itemId } = req.params
      const { id: empresaId } = (req as any).empresa

      const manutencao = await prisma.manutencao.findFirst({
        where: { 
          id: parseInt(id),
          equipamento: {
            empresaId
          }
        }
      })

      if (!manutencao) {
        return res.status(404).json({ error: 'Manutenção não encontrada' })
      }

      const item = await prisma.manutencaoItem.findFirst({
        where: {
          id: parseInt(itemId),
          manutencaoId: parseInt(id)
        }
      })

      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado' })
      }

      // Remover item
      await prisma.manutencaoItem.delete({
        where: { id: parseInt(itemId) }
      })

      // Atualizar custo total
      if (item.valorUnitario) {
        const novoCusto = (manutencao.custo || 0) - (item.valorUnitario * item.quantidade)
        await prisma.manutencao.update({
          where: { id: parseInt(id) },
          data: { custo: Math.max(0, novoCusto) }
        })
      }

      res.json({
        success: true,
        message: 'Item removido com sucesso'
      })
    } catch (error) {
      console.error('Erro ao remover item:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Excluir manutenção
   */
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const manutencao = await prisma.manutencao.findFirst({
        where: { 
          id: parseInt(id),
          equipamento: {
            empresaId
          }
        },
        include: {
          itens: true
        }
      })

      if (!manutencao) {
        return res.status(404).json({ error: 'Manutenção não encontrada' })
      }

      // Registrar log antes de excluir
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'EXCLUIR_MANUTENCAO',
          entidade: 'manutencao',
          entidadeId: manutencao.id,
          dadosAntigos: JSON.stringify(manutencao),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      // Excluir itens
      await prisma.manutencaoItem.deleteMany({
        where: { manutencaoId: parseInt(id) }
      })

      // Excluir manutenção
      await prisma.manutencao.delete({
        where: { id: parseInt(id) }
      })

      res.json({
        success: true,
        message: 'Manutenção excluída com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir manutenção:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Obter estatísticas de manutenções
   */
  async obterStats(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { equipamentoId } = req.query

      const where: any = {
        equipamento: {
          empresaId
        }
      }

      if (equipamentoId) {
        where.equipamentoId = parseInt(equipamentoId as string)
      }

      const [
        total,
        programadas,
        emAndamento,
        concluidas,
        canceladas,
        preventivas,
        corretivas,
        preditivas,
        custoTotal,
        porPrioridade
      ] = await Promise.all([
        prisma.manutencao.count({ where }),
        prisma.manutencao.count({ where: { ...where, status: 'programada' } }),
        prisma.manutencao.count({ where: { ...where, status: 'em_andamento' } }),
        prisma.manutencao.count({ where: { ...where, status: 'concluida' } }),
        prisma.manutencao.count({ where: { ...where, status: 'cancelada' } }),
        prisma.manutencao.count({ where: { ...where, tipo: 'preventiva' } }),
        prisma.manutencao.count({ where: { ...where, tipo: 'corretiva' } }),
        prisma.manutencao.count({ where: { ...where, tipo: 'preditiva' } }),
        prisma.manutencao.aggregate({
          where: { ...where, status: 'concluida' },
          _sum: { custo: true }
        }),
        prisma.manutencao.groupBy({
          by: ['prioridade'],
          where,
          _count: true
        })
      ])

      res.json({
        success: true,
        data: {
          total,
          programadas,
          emAndamento,
          concluidas,
          canceladas,
          preventivas,
          corretivas,
          preditivas,
          custoTotal: custoTotal._sum.custo || 0,
          porPrioridade: porPrioridade.map(p => ({
            prioridade: p.prioridade,
            quantidade: p._count
          }))
        }
      })
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Obter calendário de manutenções
   */
  async obterCalendario(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { mes, ano } = req.query

      const startDate = new Date(parseInt(ano as string), parseInt(mes as string) - 1, 1)
      const endDate = new Date(parseInt(ano as string), parseInt(mes as string), 0)

      const manutencoes = await prisma.manutencao.findMany({
        where: {
          equipamento: {
            empresaId
          },
          dataProgramada: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          equipamento: {
            select: {
              id: true,
              tag: true,
              nome: true,
              modelo: true
            }
          }
        },
        orderBy: {
          dataProgramada: 'asc'
        }
      })

      // Agrupar por dia
      const calendario: Record<string, any[]> = {}
      
      manutencoes.forEach(m => {
<<<<<<< HEAD
        const dia = m.dataProgramada.toISOString().split('T')[0]
=======
        const dia = m.dataProgramada!.toISOString().split('T')[0]
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        if (!calendario[dia]) {
          calendario[dia] = []
        }
        calendario[dia].push(m)
      })

      res.json({
        success: true,
        data: calendario
      })
    } catch (error) {
      console.error('Erro ao obter calendário:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Obter manutenções preventivas programadas
   */
  async obterPreventivas(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { dias = 30 } = req.query

      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() + parseInt(dias as string))

      const manutencoes = await prisma.manutencao.findMany({
        where: {
          equipamento: {
            empresaId
          },
          tipo: 'preventiva',
          status: 'programada',
          dataProgramada: {
            lte: dataLimite
          }
        },
        include: {
          equipamento: {
            select: {
              id: true,
              tag: true,
              nome: true,
              modelo: true,
              horaAtual: true
            }
          }
        },
        orderBy: {
          dataProgramada: 'asc'
        }
      })

      res.json({
        success: true,
        data: manutencoes
      })
    } catch (error) {
      console.error('Erro ao obter preventivas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const manutencaoController = new ManutencaoController()