import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../config/database'
import { usuarioController } from '../controllers/UsuarioController'
import { authMiddleware } from '../middlewares/auth'
import { adminSistemaOnly, roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Rotas que qualquer usuário autenticado pode acessar (devem vir antes dos middlewares restritivos)
router.get(
  '/me',
  authMiddleware,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: (req as any).usuario.id },
        include: {
          empresa: {
            include: {
              plano: true
            }
          }
        }
      })
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }
      
      const { senha, ...usuarioSemSenha } = usuario
      res.json(usuarioSemSenha)
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
)

router.post(
  '/alterar-senha',
  authMiddleware,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  (req, res) => usuarioController.alterarSenha(req, res)
)

// Rotas para administradores da empresa
router.use(authMiddleware)
router.use(empresaStatusMiddleware)
router.use(roleMiddleware(['adm_empresa']))

// Estatísticas
router.get(
  '/stats',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => usuarioController.obterStats(req, res)
)

// Listar usuários da empresa
router.get(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => usuarioController.listar(req, res)
)

// Verificar limites da empresa
router.get(
  '/limites/:empresaId',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => usuarioController.verificarLimites(req, res)
)

// Criar novo usuário
router.post(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => usuarioController.criar(req, res)
)

// Rotas com ID de usuário
router.get(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => usuarioController.buscarPorId(req, res)
)

router.put(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => usuarioController.atualizar(req, res)
)

router.patch(
  '/:id/status',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => usuarioController.atualizarStatus(req, res)
)

router.post(
  '/:id/resetar-senha',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  (req, res) => usuarioController.resetarSenhaAdmin(req, res)
)

router.delete(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => usuarioController.excluir(req, res)
)

// Rotas específicas para admin do sistema (DEVEM VIR POR ÚLTIMO)
const adminRouter = Router()
adminRouter.use(authMiddleware)
adminRouter.use(adminSistemaOnly)

// Listar todos os usuários (admin sistema)
adminRouter.get(
  '/admin/todos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search, tipo, empresaId } = req.query

      const where: any = {}
      
      if (search) {
        where.OR = [
          { nome: { contains: search as string } },
          { email: { contains: search as string } }
        ]
      }
      
      if (tipo) where.tipo = tipo
      if (empresaId) where.empresaId = parseInt(empresaId as string)

      const [usuarios, total] = await Promise.all([
        prisma.usuario.findMany({
          where,
          include: {
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
        prisma.usuario.count({ where })
      ])

      const usuariosSemSenha = usuarios.map(({ senha, ...rest }) => rest)

      res.json({
        data: usuariosSemSenha,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar todos usuários:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
)

// Criar usuário admin sistema
adminRouter.post(
  '/admin',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const { nome, email, senha, tipo } = req.body

      if (tipo !== 'adm_sistema') {
        return res.status(400).json({ error: 'Tipo inválido para admin do sistema' })
      }

      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      })

      if (usuarioExistente) {
        return res.status(400).json({ error: 'E-mail já cadastrado' })
      }

      const senhaHash = await bcrypt.hash(senha, 10)

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          tipo: 'adm_sistema',
          ativo: true
        }
      })

      const { senha: _, ...usuarioSemSenha } = usuario

      res.status(201).json(usuarioSemSenha)
    } catch (error) {
      console.error('Erro ao criar admin:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
)

// Aplicar rotas de admin
router.use(adminRouter)

export default router