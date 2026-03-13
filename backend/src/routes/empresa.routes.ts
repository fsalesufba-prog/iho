import { Router } from 'express'
import { empresaController } from '../controllers/EmpresaController'
import { empresaDashboardController } from '../controllers/EmpresaDashboardController'
import { authMiddleware } from '../middlewares/auth'
import { adminSistemaOnly } from '../middlewares/role'

const router = Router()

// Todas as rotas de empresas requerem autenticação e role de admin_sistema
router.use(authMiddleware)
router.use(adminSistemaOnly)

router.get('/', empresaController.listar)
router.get('/:id', empresaController.buscarPorId)
router.get('/:id/limites', empresaController.verificarLimites)
router.post('/', empresaController.criar)
router.put('/:id', empresaController.atualizar)
router.patch('/:id/status', empresaController.atualizarStatus)
router.delete('/:id', empresaController.excluir)
router.get('/dashboard', empresaDashboardController.getDashboard)

export default router