import { Router } from 'express'
import { medicaoController } from '../controllers/MedicaoController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de medição exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar
router.get(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => medicaoController.listar(req, res)
)

router.get(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => medicaoController.buscarPorId(req, res)
)

router.get(
  '/:id/download',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => medicaoController.download(req, res)
)

// Rotas de modelos (públicas)
router.get(
  '/modelos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => medicaoController.listarModelos(req, res)
)

router.get(
  '/modelos/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => medicaoController.buscarModeloPorId(req, res)
)

// Rotas que apenas admin empresa e controladores podem acessar
router.use(roleMiddleware(['adm_empresa', 'controlador']))

router.post(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => medicaoController.criar(req, res)
)

router.put(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => medicaoController.atualizar(req, res)
)

router.post(
  '/:id/emitir',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => medicaoController.emitir(req, res)
)

router.post(
  '/:id/aprovar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => medicaoController.aprovar(req, res)
)

router.post(
  '/:id/cancelar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => medicaoController.cancelar(req, res)
)

// Apenas admin empresa pode excluir
router.use(roleMiddleware(['adm_empresa']))

router.delete(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => medicaoController.excluir(req, res)
)

export default router