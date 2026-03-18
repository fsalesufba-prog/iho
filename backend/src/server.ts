import dotenv from 'dotenv'

// Preserve variáveis do shell
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

  // 🔐 Segurança
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    })
  )

  // 🌐 CORS
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

  // ⚡ Performance
  app.use(compression())

  // 📜 Logs
  app.use(morgan('combined'))

  // 🚫 Rate limit (apenas API)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente mais tarde'
  })

  // 📦 Body parser
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // 📁 Uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  // ❤️ Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.SYSTEM_VERSION || '1.0.0'
    })
  })

  if (devMode) {
    // 🔧 DEV MODE (só API)
    app.use('/api', limiter)
    app.use('/api', routes)

    app.get('/', (_req, res) => {
      res.json({
        message: 'IHO - Índice de Saúde Operacional',
        mode: 'development',
        api: '/api',
        health: '/health'
      })
    })

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API rodando na porta ${PORT} (DEV)`)
    })

  } else {
    // 🚀 PRODUÇÃO
    console.log('🚀 Iniciando em modo produção...')

    // 🔥 CORREÇÃO REAL AQUI
    const frontendDir = path.resolve(__dirname, '../frontend')
    const nextStaticDir = path.join(frontendDir, '.next', 'static')
    const publicDir = path.join(frontendDir, 'public')

    // 🔍 Debug (pode remover depois)
    console.log('📁 FRONTEND DIR:', frontendDir)
    console.log('📁 STATIC DIR:', nextStaticDir)

    // 🔍 Validação crítica
    if (!fs.existsSync(nextStaticDir)) {
      console.error('❌ ERRO: build do Next não encontrado!')
      console.error('👉 Caminho esperado:', nextStaticDir)
      process.exit(1)
    }

    // 1️⃣ STATIC DO NEXT


    // 2️⃣ PUBLIC
    app.use(express.static(publicDir, { maxAge: '1d' }))

    // 3️⃣ API
    app.use('/api', limiter)
    app.use('/api', routes)

    // 4️⃣ NEXT.JS
    const next = require('next')
    const nextApp = next({ dev: false, dir: frontendDir })
    const handle = nextApp.getRequestHandler()

    await nextApp.prepare()
    console.log('✅ Next.js preparado')

    // ⚠️ Catch-all SEMPRE por último
    app.all('*', (req, res) => {
      return handle(req, res)
    })

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 IHO rodando na porta ${PORT}`)
      console.log(`📡 API: /api`)
      console.log(`🌐 Frontend: ativo`)
    })

    // 🛑 Shutdown seguro
    process.on('SIGTERM', () => {
      console.log('Encerrando...')
      server.close(() => process.exit(0))
    })

    process.on('SIGINT', () => {
      console.log('Encerrando...')
      server.close(() => process.exit(0))
    })
  }
}

startServer().catch((err) => {
  console.error('Erro ao iniciar servidor:', err)
  process.exit(1)
})