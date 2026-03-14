import dotenv from 'dotenv'
dotenv.config({ override: true })

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import http from 'http'
import { parse } from 'url'

import next from 'next'

import { connectDB } from './config/database'
import routes from './routes'

const dev = process.env.NODE_ENV !== 'production'
const PORT = Number(process.env.PORT || 3000)

const nextApp = next({
  dev,
  dir: path.join(process.cwd(), 'frontend')
})

const handle = nextApp.getRequestHandler()

async function startServer() {

  await connectDB()

  const app = express()

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  )

  // CORS
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    'http://localhost:5000',
    'http://localhost:3000'
  ].filter(Boolean)

  app.use(
    cors({
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
    })
  )

  // Compression
  app.use(compression())

  // Logging
  app.use(morgan('combined'))

  // Rate limit
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente mais tarde'
  })

  app.use('/api', limiter)

  // Body parser
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Static
  app.use('/uploads', express.static('uploads'))

  // API
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

  // Prepare Next
  await nextApp.prepare()

  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url || '/', true)
    const pathname = parsedUrl.pathname || '/'

    // Se for API ou health → Express
    if (pathname.startsWith('/api') || pathname === '/health') {
      app(req as any, res as any)
      return
    }

    // Caso contrário → Next.js
    handle(req, res, parsedUrl)
  })

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 IHO rodando na porta ${PORT}`)
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`)
    console.log(`📡 API disponível em /api`)
  })

  process.on('SIGTERM', () => {
    console.log('SIGTERM recebido, encerrando...')
    server.close(() => process.exit(0))
  })

  process.on('SIGINT', () => {
    console.log('SIGINT recebido, encerrando...')
    server.close(() => process.exit(0))
  })
}

startServer().catch((err) => {
  console.error('Erro ao iniciar servidor:', err)
  process.exit(1)
})