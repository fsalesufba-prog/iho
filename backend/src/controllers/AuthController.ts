import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import prisma from '../config/database'
import { emailService } from '../services/EmailService'
import { authConfig } from '../config/auth'

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      const user = await prisma.usuario.findUnique({
        where: { email },
        include: { empresa: true }
      })

      if (!user || !user.ativo) {
        return res.status(401).json({ message: 'E-mail ou senha inválidos' })
      }

      // Verificar se empresa está ativa
      if (user.empresaId && user.empresa?.status !== 'ativo' && user.empresa?.status !== 'pendente') {
        return res.status(403).json({ message: 'Acesso bloqueado. Entre em contato com o suporte.' })
      }

      const isValid = await bcrypt.compare(password, user.senha)
      if (!isValid) {
        return res.status(401).json({ message: 'E-mail ou senha inválidos' })
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
          entidadeId: user.id,
          ip: req.ip
        }
      })

      const token = jwt.sign(
        { id: user.id, email: user.email, tipo: user.tipo, empresaId: user.empresaId },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.expiresIn as any }
      )

      const refreshToken = jwt.sign(
        { id: user.id },
        authConfig.jwt.refreshSecret,
        { expiresIn: authConfig.jwt.refreshExpiresIn as any }
      )

      // Salvar refresh token
      await prisma.token.create({
        data: {
          token: refreshToken,
          tipo: 'refresh',
          usuarioId: user.id,
          expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      res.json({
        token,
        refreshToken,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          empresaId: user.empresaId,
          avatar: user.avatar
        }
      })
    } catch (error) {
      console.error('Erro no login:', error)
      res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body

      const user = await prisma.usuario.findUnique({
        where: { email }
      })

      if (!user) {
        // Por segurança, não informar que o usuário não existe
        return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação' })
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

      // Enviar e-mail
      await emailService.sendRecuperacaoSenha(email, resetToken)

      res.json({ message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação' })
    } catch (error) {
      console.error('Erro no forgot password:', error)
      res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body

      const tokenRecord = await prisma.token.findUnique({
        where: { token },
        include: { usuario: true }
      })

      if (!tokenRecord || 
          tokenRecord.tipo !== 'reset_password' || 
          tokenRecord.usado || 
          tokenRecord.expiraEm < new Date()) {
        return res.status(400).json({ message: 'Token inválido ou expirado' })
      }

      const hashedPassword = await bcrypt.hash(password, authConfig.bcrypt.rounds)

      await prisma.$transaction([
        prisma.usuario.update({
          where: { id: tokenRecord.usuarioId },
          data: { senha: hashedPassword }
        }),
        prisma.token.update({
          where: { id: tokenRecord.id },
          data: { usado: true }
        })
      ])

      res.json({ message: 'Senha alterada com sucesso' })
    } catch (error) {
      console.error('Erro no reset password:', error)
      res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body

      const tokenRecord = await prisma.token.findUnique({
        where: { token: refreshToken },
        include: { usuario: true }
      })

      if (!tokenRecord || 
          tokenRecord.tipo !== 'refresh' || 
          tokenRecord.usado || 
          tokenRecord.expiraEm < new Date()) {
        return res.status(401).json({ message: 'Refresh token inválido' })
      }

      const payload = jwt.verify(refreshToken, authConfig.jwt.refreshSecret) as any

      const newToken = jwt.sign(
        { 
          id: payload.id, 
          email: tokenRecord.usuario.email, 
          tipo: tokenRecord.usuario.tipo,
          empresaId: tokenRecord.usuario.empresaId 
        },
        authConfig.jwt.secret,
        { expiresIn: authConfig.jwt.expiresIn as any }
      )

      // Marcar token como usado
      await prisma.token.update({
        where: { id: tokenRecord.id },
        data: { usado: true }
      })

      res.json({ token: newToken })
    } catch (error) {
      console.error('Erro no refresh token:', error)
      res.status(401).json({ message: 'Refresh token inválido' })
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body

      if (refreshToken) {
        await prisma.token.updateMany({
          where: { token: refreshToken },
          data: { usado: true }
        })
      }

      res.json({ message: 'Logout realizado com sucesso' })
    } catch (error) {
      console.error('Erro no logout:', error)
      res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id

      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: { empresa: true }
      })

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' })
      }

      res.json({
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          empresaId: user.empresaId,
          avatar: user.avatar,
          telefone: user.telefone,
          empresa: user.empresa
        }
      })
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }
}

export const authController = new AuthController()