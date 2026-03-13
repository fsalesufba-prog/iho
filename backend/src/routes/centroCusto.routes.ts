import { Router } from 'express'
import { centroCustoController } from '../controllers/CentroCustoController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Todas as rotas de centros de custo requerem autenticação
router.use(authMiddleware)

// Estatísticas
router.get('/stats', centroCustoController.getStats)

// CRUD Centros de Custo
router.get('/', centroCustoController.listar)
router.get('/:id', centroCustoController.buscarPorId)
router.post('/', centroCustoController.criar)
router.put('/:id', centroCustoController.atualizar)
router.delete('/:id', centroCustoController.excluir)

// Avaliações
router.get('/:id/avaliacoes/stats', centroCustoController.getAvaliacaoStats)
router.get('/:id/avaliacoes', centroCustoController.listarAvaliacoes)
router.post('/avaliacoes', centroCustoController.criarAvaliacao)
router.get('/avaliacoes/:id', centroCustoController.getAvaliacaoPorId)
router.delete('/avaliacoes/:id', centroCustoController.excluirAvaliacao)

export default router