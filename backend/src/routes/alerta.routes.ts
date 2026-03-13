import { Router } from 'express'
import { alertaController } from '../controllers/AlertaController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de alertas exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar
router.get(
  '/dashboard',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => alertaController.dashboard(req, res)
)

router.get(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => alertaController.listar(req, res)
)

router.get(
  '/estatisticas',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => alertaController.estatisticas(req, res)
)

router.get(
  '/combustivel',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => alertaController.listarCombustivel(req, res)
)

router.get(
  '/manutencao',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => alertaController.listarManutencao(req, res)
)

router.get(
  '/estoque',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => alertaController.listarEstoque(req, res)
)

router.get(
  '/configuracoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => alertaController.buscarConfiguracoes(req, res)
)

router.get(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => alertaController.buscarPorId(req, res)
)

// Rotas para atualizar alertas (usuários autenticados podem resolver/ignorar)
router.patch(
  '/:id/status',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => alertaController.atualizarStatus(req, res)
)

router.post(
  '/:id/ignorar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => alertaController.ignorar(req, res)
)

// Rotas que apenas admin empresa e controladores podem acessar
router.use(roleMiddleware(['adm_empresa', 'controlador']))

router.post(
  '/configuracoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => alertaController.salvarConfiguracoes(req, res)
)

// Apenas admin empresa pode excluir alertas
router.use(roleMiddleware(['adm_empresa']))

router.delete(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  (req, res) => alertaController.excluir(req, res)
)

export default router