import { Router } from 'express'
import { blogController } from '../controllers/BlogController'
import { authMiddleware } from '../middlewares/auth'
import { adminBlogController } from '../controllers/AdminBlogController'
import { adminSistemaOnly } from '../middlewares/role'

const router = Router()

// Rotas públicas
router.get('/', blogController.listar)
router.get('/destaques', blogController.getDestaques)
router.get('/categorias', blogController.getCategorias)
router.get('/tags', blogController.getTags)
router.get('/:slug', blogController.getBySlug)
router.post('/:slug/view', blogController.registrarView)

// Rotas protegidas (requer autenticação)
router.use(authMiddleware)
router.use(adminSistemaOnly)

router.post('/:slug/like', blogController.like)
router.delete('/:slug/like', blogController.unlike)
router.post('/:slug/comments', blogController.comentar)
router.get('/stats', adminBlogController.getStats)
router.get('/categorias', adminBlogController.getCategorias)
router.get('/', adminBlogController.listar)
router.get('/:id', adminBlogController.buscarPorId)
router.get('/slug/:slug', adminBlogController.buscarPorSlug)
router.post('/', adminBlogController.criar)
router.put('/:id', adminBlogController.atualizar)
router.patch('/:id/publicar', adminBlogController.togglePublicacao)
router.patch('/:id/destaque', adminBlogController.toggleDestaque)
router.delete('/:id', adminBlogController.excluir)
export default router