import { Request, Response } from 'express'
import prisma from '../config/database'
import { z } from 'zod'

const configuracaoSchema = z.object({
  tipo: z.enum(['combustivel', 'manutencao', 'estoque']),
  limite: z.number().positive(),
  unidade: z.string(),
  notificarEmail: z.boolean().default(false),
  notificarSistema: z.boolean().default(true),
  destinatarios: z.array(z.string().email()).optional(),
  diasAntecedencia: z.number().int().min(0).optional(),
  horarioNotificacao: z.string().optional()
})

export class AlertaController {
  /**
   * Listar todos os alertas
   */
  async listar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { tipo, status, page = 1, limit = 20 } = req.query

      const where: any = { empresaId }

      if (tipo) where.tipo = tipo
      if (status) where.status = status

      const [alertas, total] = await Promise.all([
        (prisma as any).alerta.findMany({
          where,
          include: {
            equipamento: {
              select: {
                id: true,
                tag: true,
                nome: true
              }
            },
            itemEstoque: {
              select: {
                id: true,
                nome: true,
                codigo: true
              }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: [
            { gravidade: 'desc' },
            { createdAt: 'desc' }
          ]
        }),
        (prisma as any).alerta.count({ where })
      ])

      res.json({
        success: true,
        data: alertas,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar alertas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar alerta por ID
   */
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const alerta = await (prisma as any).alerta.findFirst({
        where: {
          id: parseInt(id),
          empresaId
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
          },
          itemEstoque: {
            select: {
              id: true,
              nome: true,
              codigo: true,
              estoqueAtual: true,
              estoqueMinimo: true
            }
          }
        }
      })

      if (!alerta) {
        return res.status(404).json({ error: 'Alerta não encontrado' })
      }

      res.json({
        success: true,
        data: alerta
      })
    } catch (error) {
      console.error('Erro ao buscar alerta:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar status do alerta
   */
  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status, observacao } = req.body
      const { id: empresaId, usuario } = (req as any)

      const alerta = await (prisma as any).alerta.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!alerta) {
        return res.status(404).json({ error: 'Alerta não encontrado' })
      }

      const updated = await (prisma as any).alerta.update({
        where: { id: parseInt(id) },
        data: {
          status,
          resolvidoEm: status === 'resolvido' ? new Date() : null,
          resolvidoPorId: status === 'resolvido' ? usuario.id : null,
          observacaoResolucao: observacao
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: usuario.id,
          empresaId,
          acao: `ATUALIZAR_ALERTA_${status.toUpperCase()}`,
          entidade: 'alerta',
          entidadeId: updated.id,
          dadosNovos: JSON.stringify({ status, observacao }),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Status do alerta atualizado',
        data: updated
      })
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Ignorar alerta
   */
  async ignorar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { motivo } = req.body
      const { id: empresaId, usuario } = (req as any)

      const alerta = await (prisma as any).alerta.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!alerta) {
        return res.status(404).json({ error: 'Alerta não encontrado' })
      }

      const updated = await (prisma as any).alerta.update({
        where: { id: parseInt(id) },
        data: {
          status: 'ignorado',
          resolvidoEm: new Date(),
          resolvidoPorId: usuario.id,
          observacaoResolucao: motivo
        }
      })

      res.json({
        success: true,
        message: 'Alerta ignorado',
        data: updated
      })
    } catch (error) {
      console.error('Erro ao ignorar alerta:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Dashboard de alertas
   */
  async dashboard(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const [
        totais,
        porGravidade,
        porTipo,
        recentes
      ] = await Promise.all([
        (prisma as any).alerta.groupBy({
          by: ['status'],
          where: { empresaId },
          _count: true
        }),
        (prisma as any).alerta.groupBy({
          by: ['gravidade'],
          where: { 
            empresaId,
            status: 'pendente'
          },
          _count: true
        }),
        (prisma as any).alerta.groupBy({
          by: ['tipo'],
          where: { 
            empresaId,
            status: 'pendente'
          },
          _count: true
        }),
        (prisma as any).alerta.findMany({
          where: { 
            empresaId,
            status: 'pendente'
          },
          include: {
            equipamento: {
              select: { tag: true, nome: true }
            },
            itemEstoque: {
              select: { nome: true, codigo: true }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        })
      ])

      res.json({
        success: true,
        data: {
          totais,
          porGravidade,
          porTipo,
          recentes
        }
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard de alertas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Alertas de combustível
   */
  async listarCombustivel(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page = 1, limit = 20 } = req.query

      const alertas = await (prisma as any).alerta.findMany({
        where: {
          empresaId,
          tipo: 'combustivel',
          status: 'pendente'
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
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      })

      const total = await (prisma as any).alerta.count({
        where: {
          empresaId,
          tipo: 'combustivel',
          status: 'pendente'
        }
      })

      res.json({
        success: true,
        data: alertas,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar alertas de combustível:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Alertas de manutenção
   */
  async listarManutencao(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page = 1, limit = 20 } = req.query

      const alertas = await (prisma as any).alerta.findMany({
        where: {
          empresaId,
          tipo: 'manutencao',
          status: 'pendente'
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
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      })

      const total = await (prisma as any).alerta.count({
        where: {
          empresaId,
          tipo: 'manutencao',
          status: 'pendente'
        }
      })

      res.json({
        success: true,
        data: alertas,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar alertas de manutenção:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Alertas de estoque
   */
  async listarEstoque(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page = 1, limit = 20 } = req.query

      const alertas = await (prisma as any).alerta.findMany({
        where: {
          empresaId,
          tipo: 'estoque',
          status: 'pendente'
        },
        include: {
          itemEstoque: {
            select: {
              id: true,
              nome: true,
              codigo: true,
              categoria: true
            }
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      })

      const total = await (prisma as any).alerta.count({
        where: {
          empresaId,
          tipo: 'estoque',
          status: 'pendente'
        }
      })

      res.json({
        success: true,
        data: alertas,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar alertas de estoque:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar configurações
   */
  async buscarConfiguracoes(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const configuracoes = await (prisma as any).configuracaoAlerta.findMany({
        where: { empresaId }
      })

      res.json({
        success: true,
        data: configuracoes
      })
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Salvar configurações
   */
  async salvarConfiguracoes(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = configuracaoSchema.parse(req.body)

      const configuracao = await (prisma as any).configuracaoAlerta.upsert({
        where: {
          empresaId_tipo: {
            empresaId,
            tipo: dados.tipo
          }
        },
        update: dados,
        create: {
          ...dados,
          empresaId
        }
      })

      res.json({
        success: true,
        message: 'Configurações salvas com sucesso',
        data: configuracao
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao salvar configurações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Estatísticas de alertas
   */
  async estatisticas(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const [pendentes, porDia] = await Promise.all([
        (prisma as any).alerta.count({
          where: {
            empresaId,
            status: 'pendente'
          }
        }),
        prisma.$queryRaw`
          SELECT 
            DATE(createdAt) as data,
            COUNT(*) as total
          FROM alerta
          WHERE empresaId = ${empresaId}
            AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY DATE(createdAt)
          ORDER BY data DESC
        `
      ])

      res.json({
        success: true,
        data: {
          pendentes,
          historico: porDia
        }
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Excluir alerta (apenas admin)
   */
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const alerta = await (prisma as any).alerta.findFirst({
        where: {
          id: parseInt(id),
          empresaId
        }
      })

      if (!alerta) {
        return res.status(404).json({ error: 'Alerta não encontrado' })
      }

      await (prisma as any).alerta.delete({
        where: { id: parseInt(id) }
      })

      res.json({
        success: true,
        message: 'Alerta excluído com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir alerta:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const alertaController = new AlertaController()