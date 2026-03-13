import { Router } from 'express'
import { logController } from '../controllers/LogController'
import { authMiddleware } from '../middlewares/auth'
import { adminSistemaOnly } from '../middlewares/role'

const router = Router()

// Todas as rotas de logs requerem autenticação e role de admin_sistema
router.use(authMiddleware)
router.use(adminSistemaOnly)

router.get('/stats', logController.getStats)
router.get('/entidades', logController.getEntidades)
router.get('/exportar', logController.exportar)
router.get('/', logController.listar)
router.get('/:id', logController.buscarPorId)

export default router