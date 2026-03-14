'use strict'

const path = require('path')
const http = require('http')
const { parse } = require('url')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const PORT = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'

// carregar Next.js a partir do frontend
const nextModule = require(require.resolve('next', {
  paths: [path.join(__dirname, 'frontend')]
}))

const nextApp = (nextModule.default || nextModule)({
  dev,
  dir: path.join(__dirname, 'frontend')
})

const handle = nextApp.getRequestHandler()

async function startServer() {
  try {

    // conectar banco
    const { connectDB } = require('./dist/config/database')
    await connectDB()

    // carregar app Express
    const apiApp = require('./dist/app').default

    await nextApp.prepare()

    const server = http.createServer((req, res) => {
      const parsedUrl = parse(req.url || '/', true)
      const pathname = parsedUrl.pathname || '/'

      // rotas do backend
      if (pathname.startsWith('/api') || pathname === '/health') {
        return apiApp(req, res)
      }

      // frontend (Next)
      return handle(req, res, parsedUrl)
    })

    server.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 IHO iniciado com sucesso')
      console.log(`🌐 Porta: ${PORT}`)
      console.log(`📡 API: /api`)
      console.log(`🖥️ Frontend: /`)
      console.log(`⚙️ Ambiente: ${process.env.NODE_ENV || 'development'}\n`)
    })

    // shutdown seguro
    process.on('SIGTERM', () => {
      console.log('SIGTERM recebido, encerrando...')
      server.close(() => process.exit(0))
    })

    process.on('SIGINT', () => {
      console.log('SIGINT recebido, encerrando...')
      server.close(() => process.exit(0))
    })

  } catch (err) {
    console.error('Erro ao iniciar servidor:', err)
    process.exit(1)
  }
}

startServer()