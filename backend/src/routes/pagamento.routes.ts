import { Router } from 'express'
import { pagamentoController } from '../controllers/PagamentoController'
import { authMiddleware } from '../middlewares/auth'
import { adminSistemaOnly } from '../middlewares/role'

const router = Router()

// Rotas públicas (checkout)
router.post('/comercial/iniciar', pagamentoController.iniciarPagamentoComercial)
router.get('/comercial/:id', pagamentoController.getPagamento)
router.get('/comercial/:id/status', pagamentoController.getStatusPagamento)
router.post('/comercial/:id/reenviar', pagamentoController.reenviarInstrucoes)
router.post('/comercial/:id/cancelar', pagamentoController.cancelarPagamento)
router.get('/comercial/:id/comprovante', pagamentoController.gerarComprovante)

// Webhook (público)
router.post('/webhook', pagamentoController.webhook)

// Rotas protegidas (admin)
router.use(authMiddleware)
router.use(adminSistemaOnly)

router.post('/implantacao', pagamentoController.criarLinkImplantacao)
router.post('/mensalidade', pagamentoController.criarLinkMensalidade)
router.get('/empresa/:empresaId', pagamentoController.listarPagamentos)
router.delete('/assinatura/:empresaId', pagamentoController.cancelarAssinatura)

router.use(authMiddleware)
router.use(adminSistemaOnly)

router.get('/stats', pagamentoController.getStats)
router.get('/', pagamentoController.listar)
router.get('/:id', pagamentoController.buscarPorId)
router.patch('/:id/status', pagamentoController.atualizarStatus)
router.post('/:id/reenviar-email', pagamentoController.reenviarEmail)
router.delete('/:id', pagamentoController.excluir)


export default router