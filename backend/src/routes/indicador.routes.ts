import { Router } from 'express'
import { indicadorController } from '../controllers/IndicadorController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de indicadores exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Dashboard principal
router.get(
  '/dashboard',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.dashboard(req, res)
)

// IHO - Índice de Saúde Operacional
router.get(
  '/iho',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.iho(req, res)
)

router.get(
  '/iho/equipamentos/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.ihoPorEquipamento(req, res)
)

router.get(
  '/iho/classes/:tipo',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.ihoPorClasse(req, res)
)

router.get(
  '/iho/obras/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.ihoPorObra(req, res)
)

router.get(
  '/iho/centros-custo/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.ihoPorCentroCusto(req, res)
)

// Disponibilidade
router.get(
  '/disponibilidade',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.disponibilidade(req, res)
)

router.get(
  '/disponibilidade/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.disponibilidadePorEquipamento(req, res)
)

// Performance
router.get(
  '/performance',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.performance(req, res)
)

router.get(
  '/performance/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.performancePorEquipamento(req, res)
)

// MTBF
router.get(
  '/mtbf',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.mtbf(req, res)
)

router.get(
  '/mtbf/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.mtbfPorEquipamento(req, res)
)

// MTTR
router.get(
  '/mttr',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.mttr(req, res)
)

router.get(
  '/mttr/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.mttrPorEquipamento(req, res)
)

// Custos
router.get(
  '/custos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.custos(req, res)
)

// Alertas
router.get(
  '/alertas',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => indicadorController.alertas(req, res)
)

// Exportar
router.get(
  '/exportar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => indicadorController.exportar(req, res)
)

export default router