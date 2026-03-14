import { Request, Response } from 'express'
import prisma from '../config/database'

export class BlogController {
  /**
   * Listar posts do blog
   */
  async listar(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        categoria, 
        tag, 
        search,
        related,
        destaque 
      } = req.query

      const where: any = { publicado: true }

      if (categoria) where.categoria = categoria
      if (tag) where.tags = { has: tag }
      if (search) {
        where.OR = [
          { titulo: { contains: String(search) } },
          { resumo: { contains: String(search) } },
          { conteudo: { contains: String(search) } }
        ]
      }
      if (related) {
        where.slug = { not: String(related) }
      }
      if (destaque) where.destaque = true

      const [posts, total] = await Promise.all([
        prisma.blog.findMany({
          where,
          orderBy: { dataPublicacao: 'desc' },
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

  /**
   * Buscar posts em destaque
   */
  async getDestaques(req: Request, res: Response) {
    try {
      const { limit = 3 } = req.query

      const posts = await prisma.blog.findMany({
        where: { 
          publicado: true,
          destaque: true 
        },
        orderBy: { dataPublicacao: 'desc' },
        take: Number(limit)
      })

      res.json(posts)
    } catch (error) {
      console.error('Erro ao buscar destaques:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar post por slug
   */
  async getBySlug(req: Request, res: Response) {
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
      console.error('Erro ao buscar post:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Registrar visualização
   */
  async registrarView(req: Request, res: Response) {
    try {
      const { slug } = req.params

      await prisma.blog.update({
        where: { slug },
        data: { visualizacoes: { increment: 1 } }
      })

      res.json({ sucesso: true })
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Curtir post
   */
  async like(req: Request, res: Response) {
    try {
      const { slug } = req.params
      const usuarioId = (req as any).user?.id

      // Verificar se já curtiu
      const like = await prisma.like.findUnique({
        where: {
          usuarioId_blogId: {
            usuarioId,
            blogId: (await prisma.blog.findUnique({ where: { slug } }))!.id
          }
        }
      })

      if (like) {
        return res.status(400).json({ error: 'Você já curtiu este post' })
      }

      // Registrar like
      await prisma.$transaction([
        prisma.like.create({
          data: {
            usuarioId,
            blogId: (await prisma.blog.findUnique({ where: { slug } }))!.id
          }
        }),
        prisma.blog.update({
          where: { slug },
          data: { likes: { increment: 1 } }
        })
      ])

      res.json({ sucesso: true })
    } catch (error) {
      console.error('Erro ao curtir post:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Remover like
   */
  async unlike(req: Request, res: Response) {
    try {
      const { slug } = req.params
      const usuarioId = (req as any).user?.id

      await prisma.$transaction([
        prisma.like.delete({
          where: {
            usuarioId_blogId: {
              usuarioId,
              blogId: (await prisma.blog.findUnique({ where: { slug } }))!.id
            }
          }
        }),
        prisma.blog.update({
          where: { slug },
          data: { likes: { decrement: 1 } }
        })
      ])

      res.json({ sucesso: true })
    } catch (error) {
      console.error('Erro ao remover like:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Comentar em post
   */
  async comentar(req: Request, res: Response) {
    try {
      const { slug } = req.params
      const { comentario, parentId } = req.body
      const usuarioId = (req as any).user?.id
      const nome = (req as any).user?.nome
      const email = (req as any).user?.email

      const post = await prisma.blog.findUnique({
        where: { slug }
      })

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' })
      }

      const novoComentario = await prisma.comentario.create({
        data: {
          blogId: post.id,
          usuarioId,
          nome: nome || 'Visitante',
          email,
          comentario,
          parentId: parentId ? parseInt(parentId) : null
        }
      })

      res.json(novoComentario)
    } catch (error) {
      console.error('Erro ao comentar:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar categorias
   */
  async getCategorias(req: Request, res: Response) {
    try {
      const categorias = await prisma.blog.groupBy({
        by: ['categoria'],
        _count: true,
        where: { publicado: true }
      })

      res.json(categorias.map(c => ({
        nome: c.categoria,
        count: c._count
      })))
    } catch (error) {
      console.error('Erro ao listar categorias:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar tags
   */
  async getTags(req: Request, res: Response) {
    try {
      const posts = await prisma.blog.findMany({
        where: { publicado: true },
        select: { tags: true }
      })

      const tags: Record<string, number> = {}
      posts.forEach(post => {
<<<<<<< HEAD
        post.tags?.forEach(tag => {
=======
        const tagList: string[] = post.tags ? JSON.parse(post.tags) : []
        tagList.forEach((tag: string) => {
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          tags[tag] = (tags[tag] || 0) + 1
        })
      })

      res.json(Object.entries(tags).map(([nome, count]) => ({ nome, count })))
    } catch (error) {
      console.error('Erro ao listar tags:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const blogController = new BlogController()