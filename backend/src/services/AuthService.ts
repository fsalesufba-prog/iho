import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import prisma from '../config/database'
import { authConfig } from '../config/auth'
import { emailService } from './EmailService'

interface LoginResponse {
  token: string
  refreshToken: string
  user: {
    id: number
    nome: string
    email: string
    tipo: string
    empresaId?: number
  }
}

interface TokenPayload {
  id: number
  email: string
  tipo: string
  empresaId?: number
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.bcrypt.rounds)
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.expiresIn
    })
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, authConfig.jwt.refreshSecret, {
      expiresIn: authConfig.jwt.refreshExpiresIn
    })
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, authConfig.jwt.secret) as TokenPayload
    } catch {
      return null
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, authConfig.jwt.refreshSecret) as TokenPayload
    } catch {
      return null
    }
  }

  async login(email: string, password: string): Promise<LoginResponse | null> {
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        empresa: true
      }
    })

    if (!user || !user.ativo) {
      return null
    }

    // Verificar se empresa está ativa
    if (user.empresaId && user.empresa?.status !== 'ativo') {
      throw new Error('Empresa com acesso suspenso')
    }

    const isValid = await this.comparePassword(password, user.senha)
    if (!isValid) {
      return null
    }

    // Atualizar último acesso
    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() }
    })

    // Criar log
    await prisma.log.create({
      data: {
        usuarioId: user.id,
        empresaId: user.empresaId,
        acao: 'LOGIN',
        entidade: 'usuario',
        entidadeId: user.id
      }
    })

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      tipo: user.tipo,
      empresaId: user.empresaId || undefined
    }

    const token = this.generateToken(payload)
    const refreshToken = this.generateRefreshToken(payload)

    // Salvar refresh token no banco
    await prisma.token.create({
      data: {
        token: refreshToken,
        tipo: 'refresh',
        usuarioId: user.id,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      }
    })

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        empresaId: user.empresaId || undefined
      }
    }
  }

  async refresh(refreshToken: string): Promise<{ token: string } | null> {
    const tokenRecord = await prisma.token.findUnique({
      where: { token: refreshToken },
      include: { usuario: true }
    })

    if (!tokenRecord || tokenRecord.usado || tokenRecord.expiraEm < new Date()) {
      return null
    }

    const payload = this.verifyRefreshToken(refreshToken)
    if (!payload) {
      return null
    }

    const newToken = this.generateToken({
      id: payload.id,
      email: payload.email,
      tipo: payload.tipo,
      empresaId: payload.empresaId
    })

    // Marcar token como usado
    await prisma.token.update({
      where: { id: tokenRecord.id },
      data: { usado: true }
    })

    return { token: newToken }
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.token.updateMany({
      where: { token: refreshToken },
      data: { usado: true }
    })
  }

  async esqueciSenha(email: string): Promise<boolean> {
    const user = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!user) {
      return false // Não informar que usuário não existe por segurança
    }

    // Gerar token de reset
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.token.create({
      data: {
        token: resetToken,
        tipo: 'reset_password',
        usuarioId: user.id,
        expiraEm: expiresAt
      }
    })

    // Enviar email
    await emailService.sendRecuperacaoSenha(email, resetToken)

    return true
  }

  async resetarSenha(token: string, novaSenha: string): Promise<boolean> {
    const tokenRecord = await prisma.token.findUnique({
      where: { token },
      include: { usuario: true }
    })

    if (!tokenRecord || 
        tokenRecord.tipo !== 'reset_password' || 
        tokenRecord.usado || 
        tokenRecord.expiraEm < new Date()) {
      return false
    }

    const hashedPassword = await this.hashPassword(novaSenha)

    await prisma.usuario.update({
      where: { id: tokenRecord.usuarioId },
      data: { senha: hashedPassword }
    })

    await prisma.token.update({
      where: { id: tokenRecord.id },
      data: { usado: true }
    })

    return true
  }
}

export const authService = new AuthService()