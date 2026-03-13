import { Router } from 'express'
import { ComercialController } from '../controllers/ComercialController'

const router = Router()
const controller = new ComercialController()

// Rotas públicas
router.get('/stats', controller.getStats)
router.get('/features', controller.getFeatures)
router.get('/testimonials', controller.getTestimonials)
router.get('/faq', controller.getFAQ)
router.post('/newsletter', controller.subscribeNewsletter)
router.post('/contact', controller.contact)

export default router