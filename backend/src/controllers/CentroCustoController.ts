import { Request, Response } from 'express'
import prisma from '../config/database'

export class CentroCustoController {
  async listar(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, obraId, search, empresaId } = req.query

      const where: any = {
        empresaId: parseInt(empresaId as string)
      }

      if (status) where.status = status
      if (obraId) where.obraId = parseInt(obraId as string)
      if (search) {
        where.OR = [
          { nome: { contains: search as string } },
          { codigo: { contains: search as string } }
        ]
      }

      const [centros, total] = await Promise.all([
        prisma.centroCusto.findMany({
          where,
          include: {
            obra: {
              select: { nome: true }
            },
            avaliacoes: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.centroCusto.count({ where })
      ])

      // Calcular médias
      const centrosComDados = await Promise.all(
        centros.map(async (centro) => {
          const todasAvaliacoes = await prisma.avaliacaoCentroCusto.findMany({
            where: { centroCustoId: centro.id }
          })

          const media = todasAvaliacoes.length > 0
            ? todasAvaliacoes.reduce((acc, a) => acc + a.notaFinal, 0) / todasAvaliacoes.length
            : 0

          const mediasPorCategoria = {
            precoCondicoes: todasAvaliacoes.length > 0
              ? todasAvaliacoes.reduce((acc, a) => acc + a.precoCondicoes, 0) / todasAvaliacoes.length
              : 0,
            qualidadeServico: todasAvaliacoes.length > 0
              ? todasAvaliacoes.reduce((acc, a) => acc + a.qualidadeServico, 0) / todasAvaliacoes.length
              : 0,
            qualidadeEntrega: todasAvaliacoes.length > 0
              ? todasAvaliacoes.reduce((acc, a) => acc + a.qualidadeEntrega, 0) / todasAvaliacoes.length
              : 0,
            segurancaSaude: todasAvaliacoes.length > 0
              ? todasAvaliacoes.reduce((acc, a) => acc + a.segurançaSaude, 0) / todasAvaliacoes.length
              : 0,
            estoque: todasAvaliacoes.length > 0
              ? todasAvaliacoes.reduce((acc, a) => acc + a.estoque, 0) / todasAvaliacoes.length
              : 0,
            administracao: todasAvaliacoes.length > 0
              ? todasAvaliacoes.reduce((acc, a) => acc + a.administracao, 0) / todasAvaliacoes.length
              : 0
          }

          return {
            ...centro,
            obraNome: centro.obra?.nome,
            avaliacoes: {
              total: todasAvaliacoes.length,
              ultima: centro.avaliacoes[0]?.createdAt,
              media,
              categorias: mediasPorCategoria
            }
          }
        })
      )

      res.json({
        data: centrosComDados,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar centros de custo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const centro = await prisma.centroCusto.findUnique({
        where: { id: parseInt(id) },
        include: {
          obra: {
            select: {
              id: true,
              nome: true,
              codigo: true
            }
          },
          avaliacoes: {
            orderBy: { createdAt: 'desc' },
            include: {
              avaliador: {
                select: { nome: true }
              }
            }
          }
        }
      })

      if (!centro) {
        return res.status(404).json({ error: 'Centro de custo não encontrado' })
      }

      // Calcular estatísticas
      const mediasPorCategoria = {
        precoCondicoes: centro.avaliacoes.length > 0
          ? centro.avaliacoes.reduce((acc, a) => acc + a.precoCondicoes, 0) / centro.avaliacoes.length
          : 0,
        qualidadeServico: centro.avaliacoes.length > 0
          ? centro.avaliacoes.reduce((acc, a) => acc + a.qualidadeServico, 0) / centro.avaliacoes.length
          : 0,
        qualidadeEntrega: centro.avaliacoes.length > 0
          ? centro.avaliacoes.reduce((acc, a) => acc + a.qualidadeEntrega, 0) / centro.avaliacoes.length
          : 0,
        segurancaSaude: centro.avaliacoes.length > 0
          ? centro.avaliacoes.reduce((acc, a) => acc + a.segurançaSaude, 0) / centro.avaliacoes.length
          : 0,
        estoque: centro.avaliacoes.length > 0
          ? centro.avaliacoes.reduce((acc, a) => acc + a.estoque, 0) / centro.avaliacoes.length
          : 0,
        administracao: centro.avaliacoes.length > 0
          ? centro.avaliacoes.reduce((acc, a) => acc + a.administracao, 0) / centro.avaliacoes.length
          : 0
      }

      const mediaGeral = centro.avaliacoes.length > 0
        ? centro.avaliacoes.reduce((acc, a) => acc + a.notaFinal, 0) / centro.avaliacoes.length
        : 0

      // Calcular tendência (comparar últimas 3 avaliações)
      let tendencia: 'up' | 'down' | 'stable' = 'stable'
      if (centro.avaliacoes.length >= 3) {
        const ultimas = centro.avaliacoes.slice(0, 3)
        const medias = ultimas.map(a => a.notaFinal)
        if (medias[0] > medias[1] && medias[1] > medias[2]) tendencia = 'up'
        else if (medias[0] < medias[1] && medias[1] < medias[2]) tendencia = 'down'
      }

      res.json({
        ...centro,
        avaliacoes: centro.avaliacoes.map(a => ({
          ...a,
          avaliador: a.avaliador?.nome || 'Sistema'
        })),
        estatisticas: {
          totalAvaliacoes: centro.avaliacoes.length,
          mediaGeral,
          ultimaAvaliacao: centro.avaliacoes[0]?.createdAt,
          tendencia,
          mediasPorCategoria
        }
      })
    } catch (error) {
      console.error('Erro ao buscar centro de custo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const {
        nome,
        codigo,
        obraId,
        contato,
        telefone,
        email,
        endereco,
        observacoes,
        empresaId,
        status
      } = req.body

      const centro = await prisma.centroCusto.create({
        data: {
          nome,
          codigo,
          obraId: obraId ? parseInt(obraId) : null,
          contato,
          telefone,
          email,
          endereco,
          observacoes,
          empresaId: parseInt(empresaId),
          status
        }
      })

      res.status(201).json(centro)
    } catch (error) {
      console.error('Erro ao criar centro de custo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        nome,
        codigo,
        obraId,
        contato,
        telefone,
        email,
        endereco,
        observacoes,
        status
      } = req.body

      const centro = await prisma.centroCusto.update({
        where: { id: parseInt(id) },
        data: {
          nome,
          codigo,
          obraId: obraId ? parseInt(obraId) : null,
          contato,
          telefone,
          email,
          endereco,
          observacoes,
          status
        }
      })

      res.json(centro)
    } catch (error) {
      console.error('Erro ao atualizar centro de custo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params

      await prisma.centroCusto.delete({
        where: { id: parseInt(id) }
      })

      res.json({ message: 'Centro de custo excluído com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir centro de custo:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async criarAvaliacao(req: Request, res: Response) {
    try {
      const {
        centroCustoId,
        avaliadorId,
        precoCondicoes,
        qualidadeServico,
        qualidadeEntrega,
        segurancaSaude,
        estoque,
        administracao,
        ocorrencias,
        observacoes,
        notaFinal
      } = req.body

      const avaliacao = await prisma.avaliacaoCentroCusto.create({
        data: {
          centroCustoId: parseInt(centroCustoId),
          avaliadorId: parseInt(avaliadorId),
          precoCondicoes,
          qualidadeServico,
          qualidadeEntrega,
          segurancaSaude,
          estoque,
          administracao,
          ocorrencias,
          observacoes,
          notaFinal
        }
      })

      res.status(201).json(avaliacao)
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async listarAvaliacoes(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { page = 1, limit = 10, periodo, search } = req.query

      const where: any = { centroCustoId: parseInt(id) }

      // Filtrar por período
      if (periodo) {
        const hoje = new Date()
        let dataInicio = new Date()

        switch (periodo) {
          case '6m':
            dataInicio.setMonth(hoje.getMonth() - 6)
            break
          case '12m':
            dataInicio.setMonth(hoje.getMonth() - 12)
            break
          case '24m':
            dataInicio.setMonth(hoje.getMonth() - 24)
            break
        }

        where.dataAvaliacao = { gte: dataInicio }
      }

      // Filtrar por busca
      if (search) {
        where.avaliador = {
          nome: { contains: search as string }
        }
      }

      const [avaliacoes, total] = await Promise.all([
        prisma.avaliacaoCentroCusto.findMany({
          where,
          include: {
            avaliador: {
              select: { nome: true }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { dataAvaliacao: 'desc' }
        }),
        prisma.avaliacaoCentroCusto.count({ where })
      ])

      res.json({
        data: avaliacoes.map(a => ({
          id: a.id,
          data: a.dataAvaliacao,
          avaliador: a.avaliador?.nome || 'Sistema',
          notaFinal: a.notaFinal,
          categorias: {
            precoCondicoes: a.precoCondicoes,
            qualidadeServico: a.qualidadeServico,
            qualidadeEntrega: a.qualidadeEntrega,
            segurancaSaude: a.segurançaSaude,
            estoque: a.estoque,
            administracao: a.administracao
          },
          ocorrencias: a.ocorrencias,
          observacoes: a.observacoes
        })),
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar avaliações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { empresaId } = req.query

      const centros = await prisma.centroCusto.findMany({
        where: { empresaId: parseInt(empresaId as string) },
        include: {
          avaliacoes: true
        }
      })

      const total = centros.length
      const ativos = centros.filter(c => c.status === 'ativo').length
      const inativos = centros.filter(c => c.status === 'inativo').length

      let totalAvaliacoes = 0
      let somaNotas = 0

      centros.forEach(c => {
        totalAvaliacoes += c.avaliacoes.length
        c.avaliacoes.forEach(a => {
          somaNotas += a.notaFinal
        })
      })

      const mediaGeral = totalAvaliacoes > 0 ? somaNotas / totalAvaliacoes : 0

      res.json({
        total,
        ativos,
        inativos,
        mediaGeral,
        avaliacoes: totalAvaliacoes
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getAvaliacaoStats(req: Request, res: Response) {
    try {
      const { id } = req.params

      const avaliacoes = await prisma.avaliacaoCentroCusto.findMany({
        where: { centroCustoId: parseInt(id) }
      })

      const total = avaliacoes.length
      const mediaGeral = total > 0
        ? avaliacoes.reduce((acc, a) => acc + a.notaFinal, 0) / total
        : 0

      // Calcular tendência
      let tendencia: 'up' | 'down' | 'stable' = 'stable'
      if (avaliacoes.length >= 3) {
        const ordenadas = avaliacoes.sort((a, b) => 
          new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime()
        )
        const ultimas = ordenadas.slice(0, 3).map(a => a.notaFinal)
        if (ultimas[0] > ultimas[1] && ultimas[1] > ultimas[2]) tendencia = 'up'
        else if (ultimas[0] < ultimas[1] && ultimas[1] < ultimas[2]) tendencia = 'down'
      }

      res.json({
        total,
        mediaGeral,
        tendencia
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas de avaliações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getAvaliacaoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const avaliacao = await prisma.avaliacaoCentroCusto.findUnique({
        where: { id: parseInt(id) },
        include: {
          centroCusto: {
            select: { nome: true }
          },
          avaliador: {
            select: { nome: true }
          }
        }
      })

      if (!avaliacao) {
        return res.status(404).json({ error: 'Avaliação não encontrada' })
      }

      res.json({
        id: avaliacao.id,
        centroCustoId: avaliacao.centroCustoId,
        centroCustoNome: avaliacao.centroCusto.nome,
        data: avaliacao.dataAvaliacao,
        avaliador: avaliacao.avaliador?.nome || 'Sistema',
        notaFinal: avaliacao.notaFinal,
        categorias: {
          precoCondicoes: avaliacao.precoCondicoes,
          qualidadeServico: avaliacao.qualidadeServico,
          qualidadeEntrega: avaliacao.qualidadeEntrega,
          segurancaSaude: avaliacao.segurançaSaude,
          estoque: avaliacao.estoque,
          administracao: avaliacao.administracao
        },
        ocorrencias: avaliacao.ocorrencias,
        observacoes: avaliacao.observacoes,
        createdAt: avaliacao.createdAt,
        updatedAt: avaliacao.updatedAt
      })
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async excluirAvaliacao(req: Request, res: Response) {
    try {
      const { id } = req.params

      await prisma.avaliacaoCentroCusto.delete({
        where: { id: parseInt(id) }
      })

      res.json({ message: 'Avaliação excluída com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const centroCustoController = new CentroCustoController()