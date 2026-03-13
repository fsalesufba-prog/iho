import { Router } from 'express'
import { equipamentoController } from '../controllers/EquipamentoController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de equipamentos exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar (visualização)
router.get(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => equipamentoController.listar(req, res)
)

router.get(
  '/stats',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => equipamentoController.obterStats(req, res)
)

router.get(
  '/tag/:tag',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => equipamentoController.buscarPorTag(req, res)
)

router.get(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => equipamentoController.buscarPorId(req, res)
)

router.get(
  '/:id/historico',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => equipamentoController.obterHistorico(req, res)
)

router.get(
  '/:id/manutencoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => equipamentoController.obterManutencoes(req, res)
)

router.get(
  '/exportar/:formato',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => equipamentoController.exportar(req, res)
)

// Rotas que apenas admin empresa e controladores podem acessar (criação/edição)
router.use(roleMiddleware(['adm_empresa', 'controlador']))

router.post(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => equipamentoController.criar(req, res)
)

router.put(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => equipamentoController.atualizar(req, res)
)

router.patch(
  '/:id/status',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => equipamentoController.atualizarStatus(req, res)
)

// Apenas admin empresa pode excluir
router.use(roleMiddleware(['adm_empresa']))

router.delete(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => equipamentoController.excluir(req, res)
)

export default router