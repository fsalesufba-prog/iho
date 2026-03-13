import { Router } from 'express'
import { ComercialController } from '../controllers/ComercialController'

const router = Router()
const controller = new ComercialController()

router.get('/stats', controller.getStats)
router.get('/features', controller.getFeatures)
router.get('/testimonials', controller.getTestimonials)
router.get('/faq', controller.getFAQ)
router.post('/newsletter', controller.subscribeNewsletter)
router.post('/contact', controller.contact)

router.get('/planos', controller.listarPlanos)
router.post('/pagamento/iniciar', controller.iniciarPagamento)
router.get('/pagamento/:id/status', controller.getStatusPagamento)

export default router
