import { Router } from 'express'
import { financeiroController } from '../controllers/FinanceiroController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de financeiro exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar (visualização)
router.get(
  '/dashboard',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => financeiroController.dashboard(req, res)
)

router.get(
  '/fluxo-caixa',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => financeiroController.fluxoCaixa(req, res)
)

router.get(
  '/projecoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => financeiroController.projecoes(req, res)
)

router.get(
  '/exportar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => financeiroController.exportar(req, res)
)

// Rotas de depreciação
router.get(
  '/depreciacao',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => financeiroController.depreciacao(req, res)
)

router.get(
  '/depreciacao/equipamentos/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => financeiroController.depreciacaoPorEquipamento(req, res)
)

router.get(
  '/depreciacao/classes/:tipo',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => financeiroController.depreciacaoPorClasse(req, res)
)

// Rotas de patrimônio
router.get(
  '/patrimonio',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => financeiroController.patrimonio(req, res)
)

router.get(
  '/patrimonio/relatorio',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => financeiroController.relatorioPatrimonio(req, res)
)

// Rotas de custos
router.get(
  '/custos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => financeiroController.custos(req, res)
)

router.get(
  '/custos/por-equipamento/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => financeiroController.custosPorEquipamento(req, res)
)

// Rotas de receitas
router.get(
  '/receitas',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => financeiroController.receitas(req, res)
)

export default router