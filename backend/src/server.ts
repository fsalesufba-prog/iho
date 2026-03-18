import dotenv from 'dotenv'
// Capture shell-level overrides before dotenv replaces them
const _PORT = process.env.PORT
const _DEV_MODE = process.env.DEV_MODE
dotenv.config({ override: true })
if (_PORT) process.env.PORT = _PORT
if (_DEV_MODE) process.env.DEV_MODE = _DEV_MODE

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import http from 'http'
import { parse } from 'url'

import { connectDB } from './config/database'
import routes from './routes'

const devMode = process.env.DEV_MODE === 'true'
const PORT = Number(process.env.PORT || 3000)

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

  if (devMode) {
    // Development mode: serve API only, no Next.js embedding
    app.get('/', (_req, res) => {
      res.json({
        message: 'IHO - Índice de Saúde Operacional',
        mode: 'development',
        api: '/api',
        health: '/health',
        docs: 'Access the full app on Hostinger (production)'
      })
    })

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 IHO API rodando na porta ${PORT} (modo desenvolvimento)`)
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`)
      console.log(`📡 API disponível em /api`)
    })
  } else {
    // Production mode: embed Next.js frontend
    const next = require('next')
    const nextApp = next({
      dev: false,
      dir: path.join(process.cwd(), 'frontend')
    })
    const handle = nextApp.getRequestHandler()

    await nextApp.prepare()

    const server = http.createServer((req, res) => {
      const parsedUrl = parse(req.url || '/', true)
      const pathname = parsedUrl.pathname || '/'

      // Primeiro: Deixa o Next.js lidar com todos os assets estáticos e rotas do Next
      // Isso inclui _next/static, _next/webpack, favicon.ico, etc
      if (pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname.startsWith('/icon-')) {
        handle(req, res, parsedUrl)
        return
      }

      // Segundo: API e health check - mantém no Express
      if (pathname.startsWith('/api') || pathname === '/health') {
        app(req as any, res as any)
        return
      }

      // Terceiro: Para todas as outras rotas (páginas), usa o Next.js
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
}

startServer().catch((err) => {
  console.error('Erro ao iniciar servidor:', err)
  process.exit(1)
})