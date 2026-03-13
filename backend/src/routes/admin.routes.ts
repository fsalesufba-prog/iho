import { Router } from 'express'
import { adminController } from '../controllers/AdminController'
import { authMiddleware } from '../middlewares/auth'
import { adminSistemaOnly } from '../middlewares/role'

const router = Router()

// Todas as rotas de admin requerem autenticação e role de admin_sistema
router.use(authMiddleware)
router.use(adminSistemaOnly)

router.get('/dashboard', adminController.getDashboard)

export default router