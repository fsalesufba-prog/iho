import { Request, Response } from 'express'
import prisma from '../config/database'
import { z } from 'zod'
import { almoxarifadoService } from '../services/AlmoxarifadoService'
import { logService } from '../services/LogService'

// Validações
const criarItemSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  unidade: z.enum(['un', 'kg', 'l', 'm', 'cx', 'pc']),
  estoqueMinimo: z.number().int().min(0),
  estoqueMaximo: z.number().int().min(0),
  estoqueAtual: z.number().int().default(0),
  valorUnitario: z.number().optional(),
  localizacao: z.string().optional()
})

const atualizarItemSchema = z.object({
  nome: z.string().optional(),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  unidade: z.enum(['un', 'kg', 'l', 'm', 'cx', 'pc']).optional(),
  estoqueMinimo: z.number().int().min(0).optional(),
  estoqueMaximo: z.number().int().min(0).optional(),
  valorUnitario: z.number().optional(),
  localizacao: z.string().optional()
})

const movimentacaoSchema = z.object({
  tipo: z.enum(['entrada', 'saida', 'ajuste']),
  quantidade: z.number().int().positive(),
  valorUnitario: z.number().optional(),
  equipamentoId: z.number().int().optional(),
  observacao: z.string().optional()
})

const listarItemsSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  search: z.string().optional(),
  categoria: z.string().optional(),
  estoqueBaixo: z.string().optional().transform(val => val === 'true')
})

export class AlmoxarifadoController {
  /**
   * Listar itens do estoque
   */
  async listar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page, limit, search, categoria, estoqueBaixo } = listarItemsSchema.parse(req.query)

      const result = await almoxarifadoService.listar(empresaId, {
        page,
        limit,
        search,
        categoria,
        estoqueBaixo
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
      console.error('Erro ao listar itens:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar item por ID
   */
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const item = await prisma.estoque.findFirst({
        where: { 
          id: parseInt(id),
          empresaId 
        },
        include: {
          movimentos: {
            take: 20,
            orderBy: { data: 'desc' },
            include: {
              equipamento: {
                select: { id: true, tag: true, nome: true }
              },
              usuario: {
                select: { id: true, nome: true }
              }
            }
          }
        }
      })

      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado' })
      }

      const alerta = await almoxarifadoService.verificarAlertaEstoque(item)

      res.json({
        success: true,
        data: {
          ...item,
          alerta
        }
      })
    } catch (error) {
      console.error('Erro ao buscar item:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Criar novo item
   */
  async criar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = criarItemSchema.parse(req.body)

      // Verificar se código já existe
      const codigoExistente = await prisma.estoque.findFirst({
        where: { 
          codigo: dados.codigo,
          empresaId 
        }
      })

      if (codigoExistente) {
        return res.status(400).json({ error: 'Código já cadastrado' })
      }

      const item = await prisma.estoque.create({
        data: {
          ...dados,
          empresaId
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'CRIAR_ITEM_ESTOQUE',
          entidade: 'estoque',
          entidadeId: item.id,
          dadosNovos: JSON.stringify(item),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.status(201).json({
        success: true,
        message: 'Item criado com sucesso',
        data: item
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao criar item:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar item
   */
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const dados = atualizarItemSchema.parse(req.body)

      const itemAtual = await prisma.estoque.findFirst({
        where: { 
          id: parseInt(id),
          empresaId 
        }
      })

      if (!itemAtual) {
        return res.status(404).json({ error: 'Item não encontrado' })
      }

      const item = await prisma.estoque.update({
        where: { id: parseInt(id) },
        data: dados
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: 'ATUALIZAR_ITEM_ESTOQUE',
          entidade: 'estoque',
          entidadeId: item.id,
          dadosAntigos: JSON.stringify(itemAtual),
          dadosNovos: JSON.stringify(item),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Item atualizado com sucesso',
        data: item
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao atualizar item:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Registrar movimentação
   */
  async movimentacao(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa
      const dados = movimentacaoSchema.parse(req.body)

      const item = await prisma.estoque.findFirst({
        where: { 
          id: parseInt(id),
          empresaId 
        }
      })

      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado' })
      }

      // Validar quantidade para saída
      if (dados.tipo === 'saida' && item.estoqueAtual < dados.quantidade) {
        return res.status(400).json({ 
          error: 'Quantidade insuficiente em estoque',
          disponivel: item.estoqueAtual
        })
      }

      // Calcular novo estoque
      let novoEstoque = item.estoqueAtual
      if (dados.tipo === 'entrada') {
        novoEstoque += dados.quantidade
      } else if (dados.tipo === 'saida') {
        novoEstoque -= dados.quantidade
      } else if (dados.tipo === 'ajuste') {
        novoEstoque = dados.quantidade
      }

      // Verificar limites
      if (novoEstoque > item.estoqueMaximo) {
        // Aviso de estoque acima do máximo
      }
      if (novoEstoque < item.estoqueMinimo) {
        // Aviso de estoque abaixo do mínimo
      }

      // Criar movimentação e atualizar estoque em transação
      const [movimento] = await prisma.$transaction([
        prisma.estoqueMovimento.create({
          data: {
            estoqueId: parseInt(id),
            tipo: dados.tipo,
            quantidade: dados.quantidade,
            valorUnitario: dados.valorUnitario,
            valorTotal: dados.valorUnitario ? dados.valorUnitario * dados.quantidade : undefined,
            equipamentoId: dados.equipamentoId,
            observacao: dados.observacao,
            usuarioId: (req as any).usuario.id
          }
        }),
        prisma.estoque.update({
          where: { id: parseInt(id) },
          data: { estoqueAtual: novoEstoque }
        })
      ])

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId,
          acao: `MOVIMENTACAO_${dados.tipo.toUpperCase()}`,
          entidade: 'estoque',
          entidadeId: item.id,
          dadosNovos: JSON.stringify({ movimento, novoEstoque }),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Movimentação registrada com sucesso',
        data: movimento
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao registrar movimentação:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar categorias
   */
  async listarCategorias(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const categorias = await prisma.estoque.findMany({
        where: { empresaId },
        select: { categoria: true },
        distinct: ['categoria']
      })

      res.json({
        success: true,
        data: categorias.map(c => c.categoria)
      })
    } catch (error) {
      console.error('Erro ao listar categorias:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar movimentações
   */
  async listarMovimentacoes(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page = 1, limit = 20, tipo, itemId } = req.query

      const where: any = {
        estoque: {
          empresaId
        }
      }

      if (tipo) where.tipo = tipo
      if (itemId) where.estoqueId = parseInt(itemId as string)

      const [movimentacoes, total] = await Promise.all([
        prisma.estoqueMovimento.findMany({
          where,
          include: {
            estoque: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                unidade: true
              }
            },
            equipamento: {
              select: {
                id: true,
                tag: true,
                nome: true
              }
            },
            usuario: {
              select: {
                id: true,
                nome: true
              }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { data: 'desc' }
        }),
        prisma.estoqueMovimento.count({ where })
      ])

      res.json({
        success: true,
        data: movimentacoes,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar movimentações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar movimentação por ID
   */
  async buscarMovimentacaoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const movimentacao = await prisma.estoqueMovimento.findFirst({
        where: { 
          id: parseInt(id),
          estoque: {
            empresaId
          }
        },
        include: {
          estoque: {
            select: {
              id: true,
              nome: true,
              codigo: true,
              categoria: true,
              unidade: true
            }
          },
          equipamento: {
            select: {
              id: true,
              tag: true,
              nome: true
            }
          },
          usuario: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      })

      if (!movimentacao) {
        return res.status(404).json({ error: 'Movimentação não encontrada' })
      }

      res.json({
        success: true,
        data: movimentacao
      })
    } catch (error) {
      console.error('Erro ao buscar movimentação:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Análise de consumo
   */
  async analiseConsumo(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = 30 } = req.query

      const analise = await almoxarifadoService.analisarConsumo(empresaId, parseInt(periodo as string))

      res.json({
        success: true,
        data: analise
      })
    } catch (error) {
      console.error('Erro ao analisar consumo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Análise de estoque mínimo
   */
  async analiseEstoqueMinimo(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const itens = await prisma.estoque.findMany({
        where: { empresaId },
        include: {
          movimentos: {
            orderBy: { data: 'desc' },
            take: 10
          }
        }
      })

      const analise = itens.map(item => ({
        ...item,
        alerta: item.estoqueAtual <= item.estoqueMinimo,
        percentual: (item.estoqueAtual / item.estoqueMinimo) * 100,
        diasAteAcabar: almoxarifadoService.calcularDiasAteAcabar(item)
      }))

      res.json({
        success: true,
        data: analise
      })
    } catch (error) {
      console.error('Erro ao analisar estoque mínimo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Análise de custos
   */
  async analiseCustos(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { periodo = 30 } = req.query

      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - parseInt(periodo as string))

      const movimentacoes = await prisma.estoqueMovimento.findMany({
        where: {
          estoque: { empresaId },
          data: { gte: dataLimite }
        },
        include: {
          estoque: {
            select: {
              nome: true,
              categoria: true
            }
          }
        }
      })

      const totalCustos = movimentacoes.reduce((sum, m) => {
        if (m.tipo === 'entrada' && m.valorTotal) {
          return sum + m.valorTotal
        }
        return sum
      }, 0)

      const porCategoria: Record<string, number> = {}
      movimentacoes.forEach(m => {
        if (m.tipo === 'entrada' && m.valorTotal) {
          const cat = m.estoque.categoria
          porCategoria[cat] = (porCategoria[cat] || 0) + m.valorTotal
        }
      })

      res.json({
        success: true,
        data: {
          total: totalCustos,
          porCategoria,
          movimentacoes: movimentacoes.length
        }
      })
    } catch (error) {
      console.error('Erro ao analisar custos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Relatório de estoque
   */
  async relatorio(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { tipo = 'completo' } = req.params

      const relatorio = await almoxarifadoService.gerarRelatorio(empresaId, tipo)

      res.json({
        success: true,
        data: relatorio
      })
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Exportar relatório
   */
  async exportarRelatorio(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { tipo = 'completo', formato = 'pdf' } = req.query

      const relatorio = await almoxarifadoService.gerarRelatorio(empresaId, tipo as string)

      if (formato === 'json') {
        res.json({
          success: true,
          data: relatorio
        })
      } else if (formato === 'csv') {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename=estoque-${tipo}.csv`)
        res.send(relatorio)
      } else {
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=estoque-${tipo}.pdf`)
        res.send(relatorio)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Excluir item
   */
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { id: empresaId } = (req as any).empresa

      const item = await prisma.estoque.findFirst({
        where: { 
          id: parseInt(id),
          empresaId 
        },
        include: {
          movimentos: true
        }
      })

      if (!item) {
        return res.status(404).json({ error: 'Item não encontrado' })
      }

      if (item.movimentos.length > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir item com movimentações',
          movimentacoes: item.movimentos.length
        })
      }

      await prisma.estoque.delete({
        where: { id: parseInt(id) }
      })

      res.json({
        success: true,
        message: 'Item excluído com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir item:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const almoxarifadoController = new AlmoxarifadoController()