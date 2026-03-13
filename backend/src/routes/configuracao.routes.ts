import { Router } from 'express'
import { configuracaoController } from '../controllers/ConfiguracaoController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de configurações exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar
router.get(
  '/empresa',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => configuracaoController.buscarEmpresa(req, res)
)

router.get(
  '/notificacoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => configuracaoController.buscarNotificacoes(req, res)
)

router.get(
  '/assinatura',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => configuracaoController.buscarAssinatura(req, res)
)

router.get(
  '/estatisticas',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => configuracaoController.estatisticasUso(req, res)
)

router.post(
  '/alterar-senha',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  (req, res) => configuracaoController.alterarSenha(req, res)
)

// Rotas que apenas admin empresa podem acessar
router.use(roleMiddleware(['adm_empresa']))

router.put(
  '/empresa',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => configuracaoController.atualizarEmpresa(req, res)
)

router.put(
  '/notificacoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => configuracaoController.atualizarNotificacoes(req, res)
)

router.get(
  '/usuarios',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => configuracaoController.listarUsuarios(req, res)
)

router.post(
  '/assinatura/cancelar',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  (req, res) => configuracaoController.cancelarAssinatura(req, res)
)

export default router