import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty'
})

export const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Banco de dados conectado com sucesso')
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  await prisma.$disconnect()
  console.log('📴 Desconectado do banco de dados')
}

export default prisma