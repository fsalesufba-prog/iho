import { Request, Response } from 'express'
import prisma from '../config/database'

export class ObraController {
  async listar(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, search, empresaId } = req.query

      const where: any = {
        empresaId: parseInt(empresaId as string)
      }

      if (status) where.status = status
      if (search) {
        where.OR = [
          { nome: { contains: search as string } },
          { codigo: { contains: search as string } }
        ]
      }

      const [obras, total] = await Promise.all([
        prisma.obra.findMany({
          where,
          include: {
            _count: {
              select: {
                frenteServicos: true,
                equipamentos: true
              }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.obra.count({ where })
      ])

      const obrasComCount = obras.map(obra => ({
        ...obra,
        frentesCount: obra._count.frenteServicos,
        equipamentosCount: obra._count.equipamentos
      }))

      res.json({
        data: obrasComCount,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar obras:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const obra = await prisma.obra.findUnique({
        where: { id: parseInt(id) },
        include: {
          frenteServicos: {
            select: {
              id: true,
              nome: true,
              status: true,
              progresso: true
            }
          },
          equipamentos: {
            select: {
              id: true,
              nome: true,
              tag: true,
              status: true,
              horaAtual: true
            }
          }
        }
      })

      if (!obra) {
        return res.status(404).json({ error: 'Obra não encontrada' })
      }

      // Buscar funcionários (usuários) alocados
      const funcionarios = await prisma.usuario.findMany({
        where: {
          empresaId: obra.empresaId,
          tipo: { in: ['controlador', 'apontador'] }
        },
        select: {
          id: true,
          nome: true,
          tipo: true
        },
        take: 10
      })

      // Calcular progresso baseado nas frentes de serviço
      const progresso = obra.frenteServicos.length > 0
        ? Math.round(obra.frenteServicos.reduce((acc, f) => acc + (f.progresso || 0), 0) / obra.frenteServicos.length)
        : 0

      res.json({
        ...obra,
        progresso,
        funcionarios: funcionarios.map(f => ({
          id: f.id,
          nome: f.nome,
          funcao: f.tipo === 'controlador' ? 'Controlador' : 'Apontador',
          horas: Math.floor(Math.random() * 100) // Exemplo
        })),
        documentos: [] // Implementar depois
      })
    } catch (error) {
      console.error('Erro ao buscar obra:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const {
        nome,
        codigo,
        cnpj,
        endereco,
        cidade,
        estado,
        cep,
        dataInicio,
        dataPrevisaoTermino,
        valor,
        observacoes,
        empresaId
      } = req.body

      const obra = await prisma.obra.create({
        data: {
          nome,
          codigo,
          cnpj,
          endereco,
          cidade,
          estado,
          cep,
          dataInicio: dataInicio ? new Date(dataInicio) : null,
          dataPrevisaoTermino: dataPrevisaoTermino ? new Date(dataPrevisaoTermino) : null,
          valor: valor ? parseFloat(valor) : null,
          observacoes,
          empresaId: parseInt(empresaId),
          status: 'ativa'
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          empresaId: obra.empresaId,
          acao: 'CRIAR_OBRA',
          entidade: 'obra',
          entidadeId: obra.id,
          usuarioId: (req as any).user?.id
        }
      })

      res.status(201).json(obra)
    } catch (error) {
      console.error('Erro ao criar obra:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        nome,
        codigo,
        cnpj,
        endereco,
        cidade,
        estado,
        cep,
        status,
        dataInicio,
        dataPrevisaoTermino,
        dataTermino,
        valor,
        observacoes
      } = req.body

      const obra = await prisma.obra.update({
        where: { id: parseInt(id) },
        data: {
          nome,
          codigo,
          cnpj,
          endereco,
          cidade,
          estado,
          cep,
          status,
          dataInicio: dataInicio ? new Date(dataInicio) : null,
          dataPrevisaoTermino: dataPrevisaoTermino ? new Date(dataPrevisaoTermino) : null,
          dataTermino: dataTermino ? new Date(dataTermino) : null,
          valor: valor ? parseFloat(valor) : null,
          observacoes
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          empresaId: obra.empresaId,
          acao: 'ATUALIZAR_OBRA',
          entidade: 'obra',
          entidadeId: obra.id,
          usuarioId: (req as any).user?.id
        }
      })

      res.json(obra)
    } catch (error) {
      console.error('Erro ao atualizar obra:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params

      await prisma.obra.delete({
        where: { id: parseInt(id) }
      })

      res.json({ message: 'Obra excluída com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir obra:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { empresaId } = req.query

      const where = { empresaId: parseInt(empresaId as string) }

      const [total, ativas, paralisadas, concluidas, canceladas, valorTotal] = await Promise.all([
        prisma.obra.count({ where }),
        prisma.obra.count({ where: { ...where, status: 'ativa' } }),
        prisma.obra.count({ where: { ...where, status: 'paralisada' } }),
        prisma.obra.count({ where: { ...where, status: 'concluida' } }),
        prisma.obra.count({ where: { ...where, status: 'cancelada' } }),
        prisma.obra.aggregate({
          where: { ...where, status: { in: ['ativa', 'concluida'] } },
          _sum: { valor: true }
        })
      ])

      res.json({
        total,
        ativas,
        paralisadas,
        concluidas,
        canceladas,
        valorTotal: valorTotal._sum.valor || 0
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const obraController = new ObraController()