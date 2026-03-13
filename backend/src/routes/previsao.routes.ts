import { Router } from 'express'
import { previsaoController } from '../controllers/PrevisaoController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de previsão exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar
router.get(
  '/dashboard',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => previsaoController.dashboard(req, res)
)

router.get(
  '/uso-equipamentos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => previsaoController.previsaoUsoEquipamentos(req, res)
)

router.get(
  '/uso-equipamentos/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => previsaoController.previsaoUsoPorEquipamento(req, res)
)

router.get(
  '/manutencao',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => previsaoController.previsaoManutencoes(req, res)
)

router.get(
  '/manutencao/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => previsaoController.previsaoManutencoesPorEquipamento(req, res)
)

router.get(
  '/custos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => previsaoController.previsaoCustos(req, res)
)

router.get(
  '/tendencias',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => previsaoController.analiseTendencias(req, res)
)

router.get(
  '/alertas',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => previsaoController.alertasPreditivos(req, res)
)

router.get(
  '/recomendacoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => previsaoController.recomendacoes(req, res)
)

router.post(
  '/cenarios',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => previsaoController.cenariosSimulados(req, res)
)

router.get(
  '/exportar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => previsaoController.exportar(req, res)
)

export default router