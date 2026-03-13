import { Router } from 'express'
import { relatorioController } from '../controllers/RelatorioController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de relatórios exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar
router.get(
  '/dashboard',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => relatorioController.dashboard(req, res)
)

router.get(
  '/gerenciais',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => relatorioController.listarGerenciais(req, res)
)

router.get(
  '/gerenciais/operacional',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => relatorioController.gerarOperacional(req, res)
)

router.get(
  '/gerenciais/financeiro',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => relatorioController.gerarFinanceiro(req, res)
)

router.get(
  '/gerenciais/manutencao',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => relatorioController.gerarManutencao(req, res)
)

router.post(
  '/gerar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => relatorioController.gerar(req, res)
)

router.get(
  '/historico',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => relatorioController.historico(req, res)
)

// Rotas para relatórios personalizados
router.get(
  '/personalizados',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => relatorioController.listarPersonalizados(req, res)
)

router.get(
  '/personalizados/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => relatorioController.buscarPersonalizadoPorId(req, res)
)

router.get(
  '/personalizados/:id/executar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => relatorioController.executarPersonalizado(req, res)
)

// Rotas para relatórios agendados
router.get(
  '/agendados',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => relatorioController.listarAgendados(req, res)
)

router.get(
  '/agendados/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => relatorioController.buscarAgendadoPorId(req, res)
)

router.patch(
  '/agendados/:id/toggle',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => relatorioController.toggleAgendamento(req, res)
)

// Rotas que apenas admin empresa e controladores podem acessar
router.use(roleMiddleware(['adm_empresa', 'controlador']))

router.post(
  '/personalizados',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => relatorioController.criarPersonalizado(req, res)
)

router.put(
  '/personalizados/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => relatorioController.atualizarPersonalizado(req, res)
)

// Apenas admin empresa pode excluir
router.use(roleMiddleware(['adm_empresa']))

router.delete(
  '/personalizados/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  (req, res) => relatorioController.excluirPersonalizado(req, res)
)

export default router