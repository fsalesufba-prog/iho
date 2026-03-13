import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/database'
import routes from './routes'

const app = express()
const PORT = process.env.PORT || 3001

// Conectar ao banco de dados
connectDB()

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// CORS - allows Replit dev domains and configured origins
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  'http://localhost:5000',
  'http://localhost:3000',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const replitDomain = process.env.REPLIT_DEV_DOMAIN
    if (
      allowedOrigins.includes(origin) ||
      (replitDomain && origin.includes(replitDomain))
    ) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// Compression
app.use(compression())

// Logging
app.use(morgan('combined'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste IP, tente novamente mais tarde'
})
app.use('/api', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api', routes)

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.SYSTEM_VERSION || '1.0.0'
  })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack)
  
  const status = err.status || 500
  const message = err.message || 'Erro interno do servidor'
  
  res.status(status).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📝 Ambiente: ${process.env.NODE_ENV}`)
  console.log(`🔗 API: https://iho.sqtecnologiadainformacao.com/api`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, fechando servidor...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT recebido, fechando servidor...')
  process.exit(0)
})