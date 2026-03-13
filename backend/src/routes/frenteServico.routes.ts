import { Router } from 'express'
import { frenteServicoController } from '../controllers/FrenteServicoController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Todas as rotas de frentes de serviço requerem autenticação
router.use(authMiddleware)

router.get('/stats', frenteServicoController.getStats)
router.get('/', frenteServicoController.listar)
router.get('/:id', frenteServicoController.buscarPorId)
router.get('/:id/apontamentos', frenteServicoController.listarApontamentos)
router.post('/', frenteServicoController.criar)
router.put('/:id', frenteServicoController.atualizar)
router.delete('/:id', frenteServicoController.excluir)

export default router