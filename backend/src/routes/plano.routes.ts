import { Router } from 'express'
import { planoController } from '../controllers/PlanoController'
import { authMiddleware } from '../middlewares/auth'
import { adminSistemaOnly } from '../middlewares/role'

const router = Router()

// Todas as rotas de planos requerem autenticação e role de admin_sistema
router.use(authMiddleware)
router.use(adminSistemaOnly)

router.get('/stats', planoController.getStats)
router.get('/', planoController.listar)
router.get('/:id', planoController.buscarPorId)
router.post('/', planoController.criar)
router.put('/:id', planoController.atualizar)
router.delete('/:id', planoController.excluir)

export default router