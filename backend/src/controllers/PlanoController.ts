import { Request, Response } from 'express'
import prisma from '../config/database'

export class PlanoController {
  async listar(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search } = req.query

      const where: any = {}

      if (search) {
        where.OR = [
          { nome: { contains: search as string } },
          { descricao: { contains: search as string } }
        ]
      }

      const [planos, total] = await Promise.all([
        prisma.plano.findMany({
          where,
          include: {
            _count: {
              select: { empresas: true }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.plano.count({ where })
      ])

      const planosComContagem = planos.map(plano => ({
        ...plano,
        empresasCount: plano._count.empresas
      }))

      res.json({
        data: planosComContagem,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar planos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const plano = await prisma.plano.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresas: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              status: true,
              createdAt: true
            }
          }
        }
      })

      if (!plano) {
        return res.status(404).json({ error: 'Plano não encontrado' })
      }

      res.json(plano)
    } catch (error) {
      console.error('Erro ao buscar plano:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const {
        nome,
        descricao,
        valorImplantacao,
        valorMensal,
        limiteAdm,
        limiteControlador,
        limiteApontador,
        limiteEquipamentos,
        recursos
      } = req.body

      const plano = await prisma.plano.create({
        data: {
          nome,
          descricao,
          valorImplantacao,
          valorMensal,
          limiteAdm,
          limiteControlador,
          limiteApontador,
          limiteEquipamentos,
          recursos
        }
      })

      res.status(201).json(plano)
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        nome,
        descricao,
        valorImplantacao,
        valorMensal,
        limiteAdm,
        limiteControlador,
        limiteApontador,
        limiteEquipamentos,
        recursos
      } = req.body

      const plano = await prisma.plano.update({
        where: { id: parseInt(id) },
        data: {
          nome,
          descricao,
          valorImplantacao,
          valorMensal,
          limiteAdm,
          limiteControlador,
          limiteApontador,
          limiteEquipamentos,
          recursos
        }
      })

      res.json(plano)
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params

      const empresas = await prisma.empresa.count({
        where: { planoId: parseInt(id) }
      })

      if (empresas > 0) {
        return res.status(400).json({
          error: 'Não é possível excluir um plano que possui empresas vinculadas'
        })
      }

      await prisma.plano.delete({
        where: { id: parseInt(id) }
      })

      res.json({ message: 'Plano excluído com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir plano:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const [total, empresas] = await Promise.all([
        prisma.plano.count(),
        prisma.empresa.count()
      ])

      const todos = await prisma.plano.findMany({
        include: {
          _count: {
            select: { empresas: true }
          }
        }
      })

      const faturamentoMensal = todos.reduce(
        (acc, plano) => acc + (plano.valorMensal * plano._count.empresas),
        0
      )

      res.json({
        total,
        empresas,
        faturamentoMensal
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const planoController = new PlanoController()
