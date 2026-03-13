import { Router } from 'express'
import { manutencaoController } from '../controllers/ManutencaoController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de manutenção exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar (visualização)
router.get(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => manutencaoController.listar(req, res)
)

router.get(
  '/stats',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => manutencaoController.obterStats(req, res)
)

router.get(
  '/calendario',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => manutencaoController.obterCalendario(req, res)
)

router.get(
  '/preventivas',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => manutencaoController.obterPreventivas(req, res)
)

router.get(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => manutencaoController.buscarPorId(req, res)
)

// Rotas que apenas admin empresa e controladores podem acessar (criação/edição)
router.use(roleMiddleware(['adm_empresa', 'controlador']))

router.post(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => manutencaoController.criar(req, res)
)

router.put(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => manutencaoController.atualizar(req, res)
)

router.patch(
  '/:id/status',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => manutencaoController.atualizarStatus(req, res)
)

router.post(
  '/:id/itens',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => manutencaoController.adicionarItem(req, res)
)

router.delete(
  '/:id/itens/:itemId',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => manutencaoController.removerItem(req, res)
)

// Apenas admin empresa pode excluir
router.use(roleMiddleware(['adm_empresa']))

router.delete(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => manutencaoController.excluir(req, res)
)

export default router