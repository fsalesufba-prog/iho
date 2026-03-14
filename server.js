'use strict'

// Carregar variáveis de ambiente do backend
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') })

const http = require('http')
const { parse } = require('url')

const PORT = parseInt(process.env.PORT || '3000', 10)
const dev  = process.env.NODE_ENV !== 'production'

// Carregar Next.js a partir dos módulos do frontend
const nextModule = require(require.resolve('next', { paths: [path.join(__dirname, 'frontend')] }))
const nextApp = (nextModule.default || nextModule)({ dev, dir: path.join(__dirname, 'frontend') })
const handle  = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  // Conectar ao banco de dados
  const { connectDB } = require('./backend/dist/config/database')
  await connectDB()

  // Carregar o app Express do backend (sem chamar .listen)
  const apiApp = require('./backend/dist/app').default

  // Servidor unificado: /api → Express | resto → Next.js
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url || '/', true)
    const pathname  = parsedUrl.pathname || '/'

    if (pathname.startsWith('/api') || pathname === '/health') {
      apiApp(req, res)
    } else {
      handle(req, res, parsedUrl)
    }
  })

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 IHO rodando na porta ${PORT}`)
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`)
    console.log(`📡 API:      /api`)
    console.log(`🖥️  Frontend: /\n`)
  })

  // Shutdown limpo
  process.on('SIGTERM', () => { server.close(() => process.exit(0)) })
  process.on('SIGINT',  () => { server.close(() => process.exit(0)) })
})
