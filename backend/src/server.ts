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
  app.use(cors({ origin: true, credentials: true }))

  // ⚡ Performance
  app.use(compression())

  // 📜 Logs
  app.use(morgan('combined'))

  // 🚫 Rate limit
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })

  // 📦 Body
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // ❤️ Health
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  if (devMode) {
    app.use('/api', limiter)
    app.use('/api', routes)

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 DEV rodando na porta ${PORT}`)
    })

    return
  }

  // 🚀 PRODUÇÃO
  console.log('🚀 Produção iniciando...')

  const frontendDir = path.resolve(process.cwd(), 'frontend')

  // 🔥 AQUI É O PULO DO GATO
  const next = require('next')
  const nextApp = next({
    dev: false,
    dir: frontendDir
  })

  const handle = nextApp.getRequestHandler()

  await nextApp.prepare()

  console.log('✅ Next pronto')

  // ✅ API primeiro
  app.use('/api', limiter)
  app.use('/api', routes)

  // ✅ uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  // 🚨 NÃO SERVE _next/static manualmente
  // Next já faz isso corretamente

  // ✅ TUDO pro Next
  app.all('*', (req, res) => handle(req, res))

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Rodando na porta ${PORT}`)
  })
}

startServer().catch(err => {
  console.error(err)
  process.exit(1)
})