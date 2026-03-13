import { Router } from 'express'
import { authController } from '../controllers/AuthController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Rotas públicas
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)
router.post('/refresh', authController.refreshToken)

// Rotas protegidas
router.use(authMiddleware)
router.post('/logout', authController.logout)
router.get('/me', authController.me)

export default router