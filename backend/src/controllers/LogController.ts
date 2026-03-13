import { Request, Response } from 'express'
import prisma from '../config/database'

export class LogController {
  async listar(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        nivel,
        entidade,
        usuarioId,
        empresaId,
        dataInicio,
        dataFim,
        search
      } = req.query

      const where: any = {}

      if (nivel) where.nivel = nivel
      if (entidade) where.entidade = entidade
      if (usuarioId) where.usuarioId = parseInt(usuarioId as string)
      if (empresaId) where.empresaId = parseInt(empresaId as string)

      if (dataInicio || dataFim) {
        where.createdAt = {}
        if (dataInicio) where.createdAt.gte = new Date(dataInicio as string)
        if (dataFim) where.createdAt.lte = new Date(dataFim as string)
      }

      if (search) {
        where.OR = [
          { acao: { contains: search as string } },
          { entidade: { contains: search as string } }
        ]
      }

      const [logs, total] = await Promise.all([
        prisma.log.findMany({
          where,
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                avatar: true
              }
            },
            empresa: {
              select: {
                id: true,
                nome: true,
                cnpj: true
              }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.log.count({ where })
      ])

      // Adicionar nível baseado na ação
      const logsComNivel = logs.map(log => ({
        ...log,
        nivel: this.determinarNivel(log.acao)
      }))

      res.json({
        data: logsComNivel,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar logs:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const log = await prisma.log.findUnique({
        where: { id: parseInt(id) },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              avatar: true
            }
          },
          empresa: {
            select: {
              id: true,
              nome: true,
              cnpj: true
            }
          }
        }
      })

      if (!log) {
        return res.status(404).json({ error: 'Log não encontrado' })
      }

      const logComNivel = {
        ...log,
        nivel: this.determinarNivel(log.acao)
      }

      res.json(logComNivel)
    } catch (error) {
      console.error('Erro ao buscar log:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const hoje = new Date()
      const inicioHoje = new Date(hoje.setHours(0, 0, 0, 0))
      const inicioUltimaHora = new Date(Date.now() - 60 * 60 * 1000)

      const [
        total,
        logsPorNivel,
        logsHoje,
        logsUltimaHora
      ] = await Promise.all([
        prisma.log.count(),
        this.contarPorNivel(),
        prisma.log.count({
          where: { createdAt: { gte: inicioHoje } }
        }),
        prisma.log.count({
          where: { createdAt: { gte: inicioUltimaHora } }
        })
      ])

      res.json({
        total,
        ...logsPorNivel,
        hoje: logsHoje,
        ultimaHora: logsUltimaHora
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getEntidades(req: Request, res: Response) {
    try {
      const entidades = await prisma.log.groupBy({
        by: ['entidade'],
        _count: true
      })

      res.json(entidades.map(e => e.entidade))
    } catch (error) {
      console.error('Erro ao listar entidades:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async exportar(req: Request, res: Response) {
    try {
      const {
        nivel,
        entidade,
        usuarioId,
        empresaId,
        dataInicio,
        dataFim,
        search
      } = req.query

      const where: any = {}

      if (nivel) where.nivel = nivel
      if (entidade) where.entidade = entidade
      if (usuarioId) where.usuarioId = parseInt(usuarioId as string)
      if (empresaId) where.empresaId = parseInt(empresaId as string)

      if (dataInicio || dataFim) {
        where.createdAt = {}
        if (dataInicio) where.createdAt.gte = new Date(dataInicio as string)
        if (dataFim) where.createdAt.lte = new Date(dataFim as string)
      }

      if (search) {
        where.OR = [
          { acao: { contains: search as string } },
          { entidade: { contains: search as string } }
        ]
      }

      const logs = await prisma.log.findMany({
        where,
        include: {
          usuario: {
            select: { nome: true }
          },
          empresa: {
            select: { nome: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      // Gerar CSV
      const csv = this.gerarCSV(logs)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=logs-${Date.now()}.csv`)
      res.send(csv)
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  private determinarNivel(acao: string): string {
    const acaoLower = acao.toLowerCase()

    if (acaoLower.includes('erro') || acaoLower.includes('error')) return 'erro'
    if (acaoLower.includes('critico') || acaoLower.includes('critical')) return 'critico'
    if (acaoLower.includes('aviso') || acaoLower.includes('warning')) return 'aviso'
    if (acaoLower.includes('sucesso') || acaoLower.includes('success')) return 'sucesso'
    if (acaoLower.includes('criar') || acaoLower.includes('create')) return 'sucesso'
    if (acaoLower.includes('atualizar') || acaoLower.includes('update')) return 'info'
    if (acaoLower.includes('excluir') || acaoLower.includes('delete')) return 'aviso'
    if (acaoLower.includes('login')) return 'sucesso'
    if (acaoLower.includes('logout')) return 'info'

    return 'info'
  }

  private async contarPorNivel() {
    const todosLogs = await prisma.log.findMany({
      select: { acao: true }
    })

    const resultado = {
      info: 0,
      sucesso: 0,
      aviso: 0,
      erro: 0,
      critico: 0
    }

    todosLogs.forEach(log => {
      const nivel = this.determinarNivel(log.acao)
      resultado[nivel as keyof typeof resultado]++
    })

    return resultado
  }

  private gerarCSV(logs: any[]): string {
    const headers = ['ID', 'Data', 'Usuário', 'Empresa', 'Ação', 'Entidade', 'ID Entidade', 'IP', 'Nível']
    const linhas = logs.map(log => [
      log.id,
      log.createdAt.toISOString(),
      log.usuario?.nome || 'Sistema',
      log.empresa?.nome || '-',
      log.acao,
      log.entidade,
      log.entidadeId || '-',
      log.ip || '-',
      this.determinarNivel(log.acao)
    ])

    const csv = [
      headers.join(','),
      ...linhas.map(linha => linha.map(celula => `"${celula}"`).join(','))
    ].join('\n')

    return csv
  }
}

export const logController = new LogController()