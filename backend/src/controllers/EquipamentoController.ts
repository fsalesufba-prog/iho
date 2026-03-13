import { Request, Response } from 'express'
import prisma from '../config/database'
import { z } from 'zod'
import { equipamentoService } from '../services/EquipamentoService'
import { logService } from '../services/LogService'

// Validações
const criarEquipamentoSchema = z.object({
  tag: z.string().min(1, 'Tag é obrigatória'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  anoFabricacao: z.number().int().min(1900).max(new Date().getFullYear()),
  numeroSerie: z.string().min(1, 'Número de série é obrigatório'),
  placa: z.string().optional().nullable(),
  horaAtual: z.number().int().default(0),
  kmAtual: z.number().int().optional().nullable(),
  status: z.enum(['disponivel', 'em_uso', 'manutencao', 'inativo']).default('disponivel'),
  obraId: z.number().optional().nullable(),
  frenteServicoId: z.number().optional().nullable(),
  centroCustoId: z.number().optional().nullable(),
  valorAquisicao: z.number().optional().nullable(),
  valorDepreciacaoAnual: z.number().optional().nullable(),
  dataAquisicao: z.string().datetime().optional().nullable(),
  vidaUtilAnos: z.number().int().default(5),
  valorResidual: z.number().default(0),
  valorLocacaoDiaria: z.number().optional().nullable(),
  valorLocacaoMensal: z.number().optional().nullable(),
  comOperador: z.boolean().default(false),
  planoManutencao: z.string().optional().nullable() // JSON string
})

const atualizarEquipamentoSchema = z.object({
  tag: z.string().optional(),
  nome: z.string().optional(),
  tipo: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anoFabricacao: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  numeroSerie: z.string().optional(),
  placa: z.string().optional().nullable(),
  horaAtual: z.number().int().optional(),
  kmAtual: z.number().int().optional().nullable(),
  status: z.enum(['disponivel', 'em_uso', 'manutencao', 'inativo']).optional(),
  obraId: z.number().optional().nullable(),
  frenteServicoId: z.number().optional().nullable(),
  centroCustoId: z.number().optional().nullable(),
  valorAquisicao: z.number().optional().nullable(),
  valorDepreciacaoAnual: z.number().optional().nullable(),
  dataAquisicao: z.string().datetime().optional().nullable(),
  vidaUtilAnos: z.number().int().optional(),
  valorResidual: z.number().optional(),
  valorLocacaoDiaria: z.number().optional().nullable(),
  valorLocacaoMensal: z.number().optional().nullable(),
  comOperador: z.boolean().optional(),
  planoManutencao: z.string().optional().nullable()
})

const listarEquipamentosSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  search: z.string().optional(),
  status: z.enum(['disponivel', 'em_uso', 'manutencao', 'inativo']).optional(),
  tipo: z.string().optional(),
  obraId: z.string().optional().transform(Number).optional(),
  frenteServicoId: z.string().optional().transform(Number).optional(),
  centroCustoId: z.string().optional().transform(Number).optional()
})

export class EquipamentoController {
  /**
   * Listar equipamentos da empresa
   */
  async listar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page, limit, search, status, tipo, obraId, frenteServicoId, centroCustoId } = 
        listarEquipamentosSchema.parse(req.query)

      const result = await equipamentoService.listar(empresaId, {
        page,
        limit,
        search,
        status,
        tipo,
        obraId,
        frenteServicoId,
        centroCustoId
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
      console.error('Erro ao listar equipamentos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar equipamento por ID
   */
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const equipamento = await prisma.equipamento.findFirst({
        where: { 
          id: parseInt(id),
          empresaId 
        },
        include: {
          obra: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          },
          frenteServico: {
            select: {
              id: true,
              nome: true
            }
          },
          centroCusto: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          },
          manutencoes: {
            take: 10,
            orderBy: { dataProgramada: 'desc' },
            include: {
              itens: true
            }
          },
          apontamentos: {
            take: 20,
            orderBy: { data: 'desc' }
          },
          historico: {
            take: 20,
            orderBy: { data: 'desc' },
            include: {
              obraOrigem: {
                select: { id: true, nome: true }
              },
              obraDestino: {
                select: { id: true, nome: true }
              },
              usuario: {
                select: { id: true, nome: true }
              }
            }
          }
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      res.json(equipamento)
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar equipamento por tag
   */
  async buscarPorTag(req: Request, res: Response) {
    try {
      const { tag } = req.params
      const { id: empresaId } = (req as any).empresa

      const equipamento = await prisma.equipamento.findFirst({
        where: { 
          tag,
          empresaId 
        },
        include: {
          obra: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          },
          frenteServico: {
            select: {
              id: true,
              nome: true
            }
          },
          centroCusto: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          }
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      res.json(equipamento)
    } catch (error) {
      console.error('Erro ao buscar equipamento por tag:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Criar novo equipamento
   */
  async criar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = criarEquipamentoSchema.parse(req.body)

      // Verificar se tag já existe
      const tagExistente = await prisma.equipamento.findFirst({
        where: { 
          tag: dados.tag,
          empresaId 
        }
      })

      if (tagExistente) {
        return res.status(400).json({ error: 'Tag já cadastrada' })
      }

      // Verificar se número de série já existe
      const serieExistente = await prisma.equipamento.findFirst({
        where: { 
          numeroSerie: dados.numeroSerie,
          empresaId 
        }
      })

      if (serieExistente) {
        return res.status(400).json({ error: 'Número de série já cadastrado' })
      }

      // Verificar limite de equipamentos do plano
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        include: { plano: true }
      })

      if (!empresa || !empresa.plano) {
        return res.status(400).json({ error: 'Empresa não possui plano' })
      }

      const equipamentosCount = await prisma.equipamento.count({
        where: { empresaId }
      })

      if (equipamentosCount >= empresa.plano.limiteEquipamentos) {
        return res.status(400).json({ 
          error: 'Limite de equipamentos do plano atingido',
          limite: empresa.plano.limiteEquipamentos,
          atual: equipamentosCount
        })
      }

      // Criar equipamento
      const equipamento = await prisma.equipamento.create({
        data: {
          ...dados,
          empresaId,
          dataAquisicao: dados.dataAquisicao ? new Date(dados.dataAquisicao) : null
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'CRIAR_EQUIPAMENTO',
          entidade: 'equipamento',
          entidadeId: equipamento.id,
          dadosNovos: JSON.stringify(equipamento),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      // Criar entrada no histórico
      await prisma.historicoEquipamento.create({
        data: {
          equipamentoId: equipamento.id,
          tipo: 'cadastro',
          descricao: 'Equipamento cadastrado no sistema',
          usuarioId: (req as any).usuario?.id
        }
      })

      res.status(201).json({
        success: true,
        message: 'Equipamento criado com sucesso',
        data: equipamento
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao criar equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar equipamento
   */
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const dados = atualizarEquipamentoSchema.parse(req.body)

      // Buscar equipamento atual
      const equipamentoAtual = await prisma.equipamento.findFirst({
        where: { 
          id: parseInt(id),
          empresaId 
        }
      })

      if (!equipamentoAtual) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      // Verificar se tag já existe (se alterada)
      if (dados.tag && dados.tag !== equipamentoAtual.tag) {
        const tagExistente = await prisma.equipamento.findFirst({
          where: { 
            tag: dados.tag,
            empresaId,
            NOT: { id: parseInt(id) }
          }
        })

        if (tagExistente) {
          return res.status(400).json({ error: 'Tag já cadastrada' })
        }
      }

      // Verificar se número de série já existe (se alterado)
      if (dados.numeroSerie && dados.numeroSerie !== equipamentoAtual.numeroSerie) {
        const serieExistente = await prisma.equipamento.findFirst({
          where: { 
            numeroSerie: dados.numeroSerie,
            empresaId,
            NOT: { id: parseInt(id) }
          }
        })

        if (serieExistente) {
          return res.status(400).json({ error: 'Número de série já cadastrado' })
        }
      }

      // Atualizar equipamento
      const equipamento = await prisma.equipamento.update({
        where: { id: parseInt(id) },
        data: {
          ...dados,
          dataAquisicao: dados.dataAquisicao ? new Date(dados.dataAquisicao) : undefined
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'ATUALIZAR_EQUIPAMENTO',
          entidade: 'equipamento',
          entidadeId: equipamento.id,
          dadosAntigos: JSON.stringify(equipamentoAtual),
          dadosNovos: JSON.stringify(equipamento),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      // Criar entrada no histórico se houve alteração de obra
      if (dados.obraId !== undefined && dados.obraId !== equipamentoAtual.obraId) {
        await prisma.historicoEquipamento.create({
          data: {
            equipamentoId: equipamento.id,
            tipo: 'transferencia',
            descricao: `Equipamento transferido de obra`,
            obraOrigemId: equipamentoAtual.obraId,
            obraDestinoId: dados.obraId,
            usuarioId: (req as any).usuario?.id
          }
        })
      }

      res.json({
        success: true,
        message: 'Equipamento atualizado com sucesso',
        data: equipamento
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao atualizar equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar status do equipamento
   */
  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status, observacao } = req.body
      const { id: empresaId } = (req as any).empresa

      const equipamentoAtual = await prisma.equipamento.findFirst({
        where: { 
          id: parseInt(id),
          empresaId 
        }
      })

      if (!equipamentoAtual) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      const equipamento = await prisma.equipamento.update({
        where: { id: parseInt(id) },
        data: { status }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: `ALTERAR_STATUS_EQUIPAMENTO_${status.toUpperCase()}`,
          entidade: 'equipamento',
          entidadeId: equipamento.id,
          dadosAntigos: JSON.stringify({ status: equipamentoAtual.status }),
          dadosNovos: JSON.stringify({ status }),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      // Criar entrada no histórico
      await prisma.historicoEquipamento.create({
        data: {
          equipamentoId: equipamento.id,
          tipo: 'status',
          descricao: `Status alterado de ${equipamentoAtual.status} para ${status}${observacao ? ': ' + observacao : ''}`,
          usuarioId: (req as any).usuario?.id
        }
      })

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: equipamento
      })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Excluir equipamento
   */
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const equipamento = await prisma.equipamento.findFirst({
        where: { 
          id: parseInt(id),
          empresaId 
        },
        include: {
          manutencoes: true,
          apontamentos: true
        }
      })

      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' })
      }

      // Verificar se existem manutenções ou apontamentos
      if (equipamento.manutencoes.length > 0 || equipamento.apontamentos.length > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir equipamento com manutenções ou apontamentos',
          manutencoes: equipamento.manutencoes.length,
          apontamentos: equipamento.apontamentos.length
        })
      }

      // Registrar log antes de excluir
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'EXCLUIR_EQUIPAMENTO',
          entidade: 'equipamento',
          entidadeId: equipamento.id,
          dadosAntigos: JSON.stringify(equipamento),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      // Excluir histórico
      await prisma.historicoEquipamento.deleteMany({
        where: { equipamentoId: equipamento.id }
      })

      // Excluir equipamento
      await prisma.equipamento.delete({
        where: { id: parseInt(id) }
      })

      res.json({
        success: true,
        message: 'Equipamento excluído com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Obter estatísticas de equipamentos
   */
  async obterStats(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const [
        total,
        disponivel,
        emUso,
        manutencao,
        inativo,
        porTipo,
        depreciacaoTotal,
        valorTotal
      ] = await Promise.all([
        prisma.equipamento.count({ where: { empresaId } }),
        prisma.equipamento.count({ where: { empresaId, status: 'disponivel' } }),
        prisma.equipamento.count({ where: { empresaId, status: 'em_uso' } }),
        prisma.equipamento.count({ where: { empresaId, status: 'manutencao' } }),
        prisma.equipamento.count({ where: { empresaId, status: 'inativo' } }),
        prisma.equipamento.groupBy({
          by: ['tipo'],
          where: { empresaId },
          _count: true
        }),
        prisma.equipamento.aggregate({
          where: { empresaId },
          _sum: { valorDepreciacaoAnual: true }
        }),
        prisma.equipamento.aggregate({
          where: { empresaId },
          _sum: { valorAquisicao: true }
        })
      ])

      res.json({
        success: true,
        data: {
          total,
          disponivel,
          emUso,
          manutencao,
          inativo,
          porTipo: porTipo.map(t => ({
            tipo: t.tipo,
            quantidade: t._count
          })),
          depreciacaoTotal: depreciacaoTotal._sum.valorDepreciacaoAnual || 0,
          valorTotal: valorTotal._sum.valorAquisicao || 0
        }
      })
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Obter histórico do equipamento
   */
  async obterHistorico(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { page = 1, limit = 20 } = req.query
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

      const skip = (Number(page) - 1) * Number(limit)

      const [historico, total] = await Promise.all([
        prisma.historicoEquipamento.findMany({
          where: { equipamentoId: parseInt(id) },
          include: {
            obraOrigem: {
              select: { id: true, nome: true }
            },
            obraDestino: {
              select: { id: true, nome: true }
            },
            usuario: {
              select: { id: true, nome: true }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { data: 'desc' }
        }),
        prisma.historicoEquipamento.count({
          where: { equipamentoId: parseInt(id) }
        })
      ])

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
      console.error('Erro ao obter histórico:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Obter manutenções do equipamento
   */
  async obterManutencoes(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { page = 1, limit = 10, status, tipo } = req.query
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

      const where: any = { equipamentoId: parseInt(id) }
      if (status) where.status = status
      if (tipo) where.tipo = tipo

      const skip = (Number(page) - 1) * Number(limit)

      const [manutencoes, total] = await Promise.all([
        prisma.manutencao.findMany({
          where,
          include: {
            itens: true
          },
          skip,
          take: Number(limit),
          orderBy: { dataProgramada: 'desc' }
        }),
        prisma.manutencao.count({ where })
      ])

      res.json({
        success: true,
        data: manutencoes,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao obter manutenções:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Exportar equipamentos (para relatórios)
   */
  async exportar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { format = 'json', status, tipo } = req.query

      const where: any = { empresaId }
      if (status) where.status = status
      if (tipo) where.tipo = tipo

      const equipamentos = await prisma.equipamento.findMany({
        where,
        include: {
          obra: {
            select: { id: true, nome: true }
          },
          frenteServico: {
            select: { id: true, nome: true }
          },
          centroCusto: {
            select: { id: true, nome: true }
          }
        },
        orderBy: { tag: 'asc' }
      })

      if (format === 'csv') {
        // Implementar exportação CSV
        const csv = equipamentos.map(e => ({
          tag: e.tag,
          nome: e.nome,
          tipo: e.tipo,
          marca: e.marca,
          modelo: e.modelo,
          status: e.status,
          horaAtual: e.horaAtual,
          obra: e.obra?.nome || '',
          valorAquisicao: e.valorAquisicao
        }))

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=equipamentos.csv')
        return res.send(csv)
      }

      res.json({
        success: true,
        data: equipamentos
      })
    } catch (error) {
      console.error('Erro ao exportar equipamentos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const equipamentoController = new EquipamentoController()