import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import 'express-async-errors'

import routes from './routes'
import { errorHandler } from './middlewares/errorHandler'
import { logger } from './config/logger'

const app: Application = express()

// Segurança
app.use(helmet({
  contentSecurityPolicy: false,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
})
app.use('/api', limiter)

// Compressão
app.use(compression())

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}))

// Parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Arquivos estáticos
app.use('/uploads', express.static('uploads'))

// Rotas
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV 
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Error handler global
app.use(errorHandler)

export default app