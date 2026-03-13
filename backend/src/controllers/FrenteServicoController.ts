import { Request, Response } from 'express'
import prisma from '../config/database'

export class FrenteServicoController {
  async listar(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, obraId, search, empresaId } = req.query

      const where: any = {
        obra: {
          empresaId: parseInt(empresaId as string)
        }
      }

      if (status) where.status = status
      if (obraId) where.obraId = parseInt(obraId as string)
      if (search) {
        where.OR = [
          { nome: { contains: search as string } },
          { descricao: { contains: search as string } }
        ]
      }

      const [frentes, total] = await Promise.all([
        prisma.frenteServico.findMany({
          where,
          include: {
            obra: {
              select: { nome: true }
            },
            _count: {
              select: {
                apontamentos: true,
                equipamentos: true
              }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.frenteServico.count({ where })
      ])

      // Calcular horas trabalhadas e consumo de combustível
      const frentesComDados = await Promise.all(
        frentes.map(async (frente) => {
          const apontamentos = await prisma.apontamento.findMany({
            where: { frenteServicoId: frente.id }
          })

          const horasTrabalhadas = apontamentos.reduce((acc, a) => acc + a.horasTrabalhadas, 0)
          const consumoCombustivel = apontamentos.reduce((acc, a) => acc + (a.combustivelLitros || 0), 0)

          return {
            ...frente,
            obraNome: frente.obra.nome,
            apontamentosCount: frente._count.apontamentos,
            equipamentosCount: frente._count.equipamentos,
            horasTrabalhadas,
            consumoCombustivel,
            progresso: Math.min(100, Math.round((horasTrabalhadas / 200) * 100)) // Exemplo
          }
        })
      )

      res.json({
        data: frentesComDados,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar frentes de serviço:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const frente = await prisma.frenteServico.findUnique({
        where: { id: parseInt(id) },
        include: {
          obra: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          },
          apontamentos: {
            take: 10,
            orderBy: { data: 'desc' },
            include: {
              equipamento: {
                select: { nome: true, tag: true }
              },
              operador: {
                select: { nome: true }
              }
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

      if (!frente) {
        return res.status(404).json({ error: 'Frente de serviço não encontrada' })
      }

      // Calcular estatísticas
      const todosApontamentos = await prisma.apontamento.findMany({
        where: { frenteServicoId: frente.id }
      })

      const totalApontamentos = todosApontamentos.length
      const totalHoras = todosApontamentos.reduce((acc, a) => acc + a.horasTrabalhadas, 0)
      const totalCombustivel = todosApontamentos.reduce((acc, a) => acc + (a.combustivelLitros || 0), 0)

      // Calcular médias
      const diasUnicos = new Set(todosApontamentos.map(a => new Date(a.data).toDateString())).size
      const mediaHorasDia = diasUnicos > 0 ? totalHoras / diasUnicos : 0
      const mediaCombustivelDia = diasUnicos > 0 ? totalCombustivel / diasUnicos : 0

      // Calcular produtividade (exemplo)
      const produtividade = Math.min(100, Math.round((totalHoras / (diasUnicos * 8)) * 100))

      res.json({
        ...frente,
        apontamentos: frente.apontamentos.map(a => ({
          id: a.id,
          data: a.data,
          equipamento: a.equipamento.nome,
          equipamentoTag: a.equipamento.tag,
          operador: a.operador?.nome,
          horasTrabalhadas: a.horasTrabalhadas,
          combustivelLitros: a.combustivelLitros
        })),
        estatisticas: {
          totalApontamentos,
          totalHoras,
          totalCombustivel,
          mediaHorasDia,
          mediaCombustivelDia,
          produtividade
        }
      })
    } catch (error) {
      console.error('Erro ao buscar frente de serviço:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { nome, descricao, obraId, empresaId } = req.body

      const frente = await prisma.frenteServico.create({
        data: {
          nome,
          descricao,
          obraId: parseInt(obraId),
          status: 'ativa'
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          empresaId: parseInt(empresaId),
          acao: 'CRIAR_FRENTE_SERVICO',
          entidade: 'frenteServico',
          entidadeId: frente.id,
          usuarioId: (req as any).user?.id
        }
      })

      res.status(201).json(frente)
    } catch (error) {
      console.error('Erro ao criar frente de serviço:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { nome, descricao, status } = req.body

      const frente = await prisma.frenteServico.update({
        where: { id: parseInt(id) },
        data: {
          nome,
          descricao,
          status
        }
      })

      res.json(frente)
    } catch (error) {
      console.error('Erro ao atualizar frente de serviço:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params

      await prisma.frenteServico.delete({
        where: { id: parseInt(id) }
      })

      res.json({ message: 'Frente de serviço excluída com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir frente de serviço:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async listarApontamentos(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { page = 1, limit = 20, periodo, search } = req.query

      const where: any = { frenteServicoId: parseInt(id) }

      // Filtrar por período
      if (periodo) {
        const hoje = new Date()
        let dataInicio = new Date()

        switch (periodo) {
          case '7d':
            dataInicio.setDate(hoje.getDate() - 7)
            break
          case '30d':
            dataInicio.setDate(hoje.getDate() - 30)
            break
          case '90d':
            dataInicio.setDate(hoje.getDate() - 90)
            break
          case '12m':
            dataInicio.setMonth(hoje.getMonth() - 12)
            break
        }

        where.data = { gte: dataInicio }
      }

      // Filtrar por busca
      if (search) {
        where.OR = [
          { equipamento: { nome: { contains: search as string } } },
          { operador: { nome: { contains: search as string } } }
        ]
      }

      const [apontamentos, total] = await Promise.all([
        prisma.apontamento.findMany({
          where,
          include: {
            equipamento: {
              select: { nome: true, tag: true }
            },
            operador: {
              select: { nome: true }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { data: 'desc' }
        }),
        prisma.apontamento.count({ where })
      ])

      res.json({
        data: apontamentos.map(a => ({
          id: a.id,
          data: a.data,
          equipamento: a.equipamento.nome,
          equipamentoTag: a.equipamento.tag,
          operador: a.operador?.nome,
          horasInicial: a.horasInicial,
          horasFinal: a.horasFinal,
          horasTrabalhadas: a.horasTrabalhadas,
          combustivelLitros: a.combustivelLitros,
          observacoes: a.observacoes,
          createdAt: a.createdAt
        })),
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar apontamentos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { empresaId } = req.query

      const frentes = await prisma.frenteServico.findMany({
        where: {
          obra: {
            empresaId: parseInt(empresaId as string)
          }
        },
        include: {
          apontamentos: true
        }
      })

      const total = frentes.length
      const ativas = frentes.filter(f => f.status === 'ativa').length
      const inativas = frentes.filter(f => f.status === 'inativa').length
      const concluidas = frentes.filter(f => f.status === 'concluida').length

      const totalHoras = frentes.reduce(
        (acc, f) => acc + f.apontamentos.reduce((sum, a) => sum + a.horasTrabalhadas, 0),
        0
      )

      const totalCombustivel = frentes.reduce(
        (acc, f) => acc + f.apontamentos.reduce((sum, a) => sum + (a.combustivelLitros || 0), 0),
        0
      )

      res.json({
        total,
        ativas,
        inativas,
        concluidas,
        totalHoras,
        totalCombustivel
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const frenteServicoController = new FrenteServicoController()