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
import fs from 'fs'

import { connectDB } from './config/database'
import routes from './routes'

const devMode = process.env.DEV_MODE === 'true'
const PORT = Number(process.env.PORT || 3000)

async function startServer() {

  await connectDB()

  const app = express()

  // Security — disable headers that block Next.js assets in production
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
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

  // Rate limit (API only)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente mais tarde'
  })
  app.use('/api', limiter)

  // Body parser
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // User uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  // API routes
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
    // Development mode: API only
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
    // PRODUCTION MODE
    console.log('🚀 Iniciando em modo produção...')

    const frontendDir = path.join(process.cwd(), 'frontend')

    // 1. SERVE ARQUIVOS ESTÁTICOS DO NEXT.JS
    const nextStaticDir = path.join(frontendDir, '.next', 'static')
    console.log('📁 Servindo arquivos estáticos de:', nextStaticDir)

    // Verifica se a pasta existe
    if (!fs.existsSync(nextStaticDir)) {
      console.error('❌ ERRO CRÍTICO: Pasta não encontrada!', nextStaticDir)
      process.exit(1)
    }

    // Lista os arquivos CSS disponíveis (para debug)
    try {
      const cssFiles = fs.readdirSync(path.join(nextStaticDir, 'css'))
      console.log('📁 Arquivos CSS disponíveis:', cssFiles)
    } catch (error) {
      console.log('⚠️ Nenhum arquivo CSS encontrado ainda')
    }

    // Middleware para servir arquivos estáticos com headers corretos
    app.use('/_next/static', (req, res, next) => {
      // Log para debug (remova em produção se quiser)
      console.log('📦 Requisição para /_next/static:', req.url)
      
      // Configura headers específicos para CSS
      if (req.url.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
      
      // Passa para o express.static
      express.static(nextStaticDir, {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css')
          }
        }
      })(req, res, next)
    })

    // 2. SERVE ARQUIVOS DA PASTA PUBLIC
    const publicDir = path.join(frontendDir, 'public')
    app.use(express.static(publicDir, { maxAge: '1d' }))

    // 3. NEXT.JS HANDLER PARA TODAS AS OUTRAS ROTAS
    const next = require('next')
    const nextApp = next({ dev: false, dir: frontendDir })
    const handle = nextApp.getRequestHandler()

    await nextApp.prepare()
    console.log('✅ Next.js preparado')

    // Todas as rotas que não foram capturadas acima vão para o Next.js
    app.all('*', (req, res) => {
      return handle(req, res)
    })

    // Inicia o servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 IHO rodando na porta ${PORT}`)
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`)
      console.log(`📡 API disponível em /api`)
      console.log(`📁 Arquivos estáticos sendo servidos de /_next/static`)
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