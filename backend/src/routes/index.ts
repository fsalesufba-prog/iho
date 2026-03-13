import { Router } from 'express'
import authRoutes from './auth.routes'
import empresaRoutes from './empresa.routes'
import usuarioRoutes from './usuario.routes'
import planoRoutes from './plano.routes'
import pagamentoRoutes from './pagamento.routes'
import obraRoutes from './obra.routes'
import frenteServicoRoutes from './frenteServico.routes'
import equipamentoRoutes from './equipamento.routes'
import manutencaoRoutes from './manutencao.routes'
import centroCustoRoutes from './centroCusto.routes'
import almoxarifadoRoutes from './almoxarifado.routes'
import indicadorRoutes from './indicador.routes'
import financeiroRoutes from './financeiro.routes'
import relatorioRoutes from './relatorio.routes'
import blogRoutes from './blog.routes'
import logRoutes from './log.routes'
import webhookRoutes from './webhook.routes'
import { authMiddleware } from '../middlewares/auth'
import comercialRoutes from './comercial.routes'
import adminRoutes from './admin.routes'
import medicaoRoutes from './medicao.routes'
import previsaoRoutes from './previsao.routes'
import alertaRoutes from './alerta.routes'
import configuracaoRoutes from './configuracao.routes'
const router = Router()

// Rotas públicas
router.use('/auth', authRoutes)
router.use('/webhook', webhookRoutes)
router.use('/blog', blogRoutes)
router.use('/comercial', comercialRoutes)

// Rotas protegidas
router.use('/empresas', authMiddleware, empresaRoutes)
router.use('/usuarios', authMiddleware, usuarioRoutes)
router.use('/planos', authMiddleware, planoRoutes)
router.use('/pagamentos', authMiddleware, pagamentoRoutes)
router.use('/obras', authMiddleware, obraRoutes)
router.use('/frentes-servico', authMiddleware, frenteServicoRoutes)
router.use('/equipamentos', authMiddleware, equipamentoRoutes)
router.use('/manutencoes', authMiddleware, manutencaoRoutes)
router.use('/centros-custo', authMiddleware, centroCustoRoutes)
router.use('/almoxarifado', authMiddleware, almoxarifadoRoutes)
router.use('/indicadores', authMiddleware, indicadorRoutes)
router.use('/financeiro', authMiddleware, financeiroRoutes)
router.use('/relatorios', authMiddleware, relatorioRoutes)
router.use('/logs', authMiddleware, logRoutes)
router.use('/api/admin', adminRoutes)
router.use('api/medicao', authMiddleware, medicaoRoutes)
router.use('api/previsao', authMiddleware, previsaoRoutes)
router.use('api/alerta', authMiddleware, alertaRoutes)
router.use('api/configuracao', authMiddleware, configuracaoRoutes)
export default router