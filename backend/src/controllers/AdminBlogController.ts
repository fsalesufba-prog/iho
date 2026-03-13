import { Request, Response } from 'express'
import prisma from '../config/database'
import { slugify } from '../utils/string'

export class AdminBlogController {
  async listar(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, categoria, publicado, search } = req.query

      const where: any = {}

      if (categoria) where.categoria = categoria
      if (publicado !== undefined) where.publicado = publicado === 'true'
      if (search) {
        where.OR = [
          { titulo: { contains: search as string } },
          { resumo: { contains: search as string } },
          { autor: { contains: search as string } }
        ]
      }

      const [posts, total] = await Promise.all([
        prisma.blog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        prisma.blog.count({ where })
      ])

      res.json({
        data: posts,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar posts:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const post = await prisma.blog.findUnique({
        where: { id: parseInt(id) }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' })
      }

      res.json(post)
    } catch (error) {
      console.error('Erro ao buscar post:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorSlug(req: Request, res: Response) {
    try {
      const { slug } = req.params

      const post = await prisma.blog.findUnique({
        where: { slug }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' })
      }

      res.json(post)
    } catch (error) {
      console.error('Erro ao buscar post por slug:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const {
        titulo,
        slug,
        resumo,
        conteudo,
        imagem,
        autor,
        categoria,
        tags,
        destaque,
        publicado,
        dataPublicacao
      } = req.body

      // Verificar se slug já existe
      const postExistente = await prisma.blog.findUnique({
        where: { slug }
      })

      if (postExistente) {
        return res.status(400).json({ error: 'Slug já utilizado' })
      }

      const post = await prisma.blog.create({
        data: {
          titulo,
          slug,
          resumo,
          conteudo,
          imagem,
          autor,
          categoria,
          tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]'),
          destaque: destaque || false,
          publicado: publicado || false,
          dataPublicacao: publicado ? (dataPublicacao ? new Date(dataPublicacao) : new Date()) : null
        }
      })

      res.status(201).json(post)
    } catch (error) {
      console.error('Erro ao criar post:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        titulo,
        slug,
        resumo,
        conteudo,
        imagem,
        autor,
        categoria,
        tags,
        destaque,
        publicado,
        dataPublicacao
      } = req.body

      // Verificar se slug já existe (exceto para o próprio post)
      if (slug) {
        const postExistente = await prisma.blog.findFirst({
          where: {
            slug,
            NOT: { id: parseInt(id) }
          }
        })

        if (postExistente) {
          return res.status(400).json({ error: 'Slug já utilizado' })
        }
      }

      const post = await prisma.blog.update({
        where: { id: parseInt(id) },
        data: {
          titulo,
          slug,
          resumo,
          conteudo,
          imagem,
          autor,
          categoria,
          tags: tags !== undefined ? (Array.isArray(tags) ? JSON.stringify(tags) : tags) : undefined,
          destaque,
          publicado,
          dataPublicacao: publicado ? (dataPublicacao ? new Date(dataPublicacao) : new Date()) : null
        }
      })

      res.json(post)
    } catch (error) {
      console.error('Erro ao atualizar post:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async togglePublicacao(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { publicado } = req.body

      const post = await prisma.blog.update({
        where: { id: parseInt(id) },
        data: {
          publicado,
          dataPublicacao: publicado ? new Date() : null
        }
      })

      res.json(post)
    } catch (error) {
      console.error('Erro ao alterar publicação:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async toggleDestaque(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { destaque } = req.body

      const post = await prisma.blog.update({
        where: { id: parseInt(id) },
        data: { destaque }
      })

      res.json(post)
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params

      await prisma.blog.delete({
        where: { id: parseInt(id) }
      })

      res.json({ message: 'Post excluído com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const [total, publicados, rascunhos, visualizacoes, likes, comentarios] = await Promise.all([
        prisma.blog.count(),
        prisma.blog.count({ where: { publicado: true } }),
        prisma.blog.count({ where: { publicado: false } }),
        prisma.blog.aggregate({ _sum: { visualizacoes: true } }),
        prisma.blog.aggregate({ _sum: { likes: true } }),
        prisma.comentario.count()
      ])

      res.json({
        total,
        publicados,
        rascunhos,
        visualizacoes: visualizacoes._sum.visualizacoes || 0,
        likes: likes._sum.likes || 0,
        comentarios
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getCategorias(req: Request, res: Response) {
    try {
      const categorias = await prisma.blog.groupBy({
        by: ['categoria'],
        _count: true
      })

      res.json(categorias.map(c => c.categoria))
    } catch (error) {
      console.error('Erro ao listar categorias:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const adminBlogController = new AdminBlogController()