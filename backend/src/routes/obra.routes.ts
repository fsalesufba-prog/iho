import { Router } from 'express'
import { obraController } from '../controllers/ObraController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Todas as rotas de obras requerem autenticação
router.use(authMiddleware)

router.get('/stats', obraController.getStats)
router.get('/', obraController.listar)
router.get('/:id', obraController.buscarPorId)
router.post('/', obraController.criar)
router.put('/:id', obraController.atualizar)
router.delete('/:id', obraController.excluir)

export default router