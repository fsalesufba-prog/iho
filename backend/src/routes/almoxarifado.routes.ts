import { Router } from 'express'
import { almoxarifadoController } from '../controllers/AlmoxarifadoController'
import { authMiddleware } from '../middlewares/auth'
import { roleMiddleware } from '../middlewares/role'
import { empresaStatusMiddleware } from '../middlewares/empresaStatus'
import { rateLimiter } from '../middlewares/rateLimiter'

const router = Router()

// Todas as rotas de almoxarifado exigem autenticação
router.use(authMiddleware)
router.use(empresaStatusMiddleware)

// Rotas que qualquer usuário autenticado pode acessar (visualização)
router.get(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => almoxarifadoController.listar(req, res)
)

router.get(
  '/categorias',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => almoxarifadoController.listarCategorias(req, res)
)

router.get(
  '/movimentacoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => almoxarifadoController.listarMovimentacoes(req, res)
)

router.get(
  '/movimentacoes/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => almoxarifadoController.buscarMovimentacaoPorId(req, res)
)

router.get(
  '/analise/consumo',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => almoxarifadoController.analiseConsumo(req, res)
)

router.get(
  '/analise/estoque-minimo',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => almoxarifadoController.analiseEstoqueMinimo(req, res)
)

router.get(
  '/analise/custos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => almoxarifadoController.analiseCustos(req, res)
)

router.get(
  '/relatorios/:tipo',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => almoxarifadoController.relatorio(req, res)
)

router.get(
  '/relatorios/exportar/:tipo',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => almoxarifadoController.exportarRelatorio(req, res)
)

router.get(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  (req, res) => almoxarifadoController.buscarPorId(req, res)
)

// Rotas que apenas admin empresa e controladores podem acessar (criação/edição)
router.use(roleMiddleware(['adm_empresa', 'controlador']))

router.post(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => almoxarifadoController.criar(req, res)
)

router.put(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 }),
  (req, res) => almoxarifadoController.atualizar(req, res)
)

router.post(
  '/:id/movimentacoes',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  (req, res) => almoxarifadoController.movimentacao(req, res)
)

// Apenas admin empresa pode excluir
router.use(roleMiddleware(['adm_empresa']))

router.delete(
  '/:id',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  (req, res) => almoxarifadoController.excluir(req, res)
)

export default router