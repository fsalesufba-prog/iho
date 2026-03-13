import { Request, Response } from 'express'
import prisma from '../config/database'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { emailService } from '../services/EmailService'
import { authConfig } from '../config/auth'
import { usuarioService } from '../services/UsuarioService'
import { ApiError } from '../utils/ApiError'
import { catchAsync } from '../utils/catchAsync'
import { z } from 'zod'

// Validações com Zod
const criarUsuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve ter pelo menos um caractere especial'),
  telefone: z.string().optional().nullable(),
  cargo: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  tipo: z.enum(['adm_sistema', 'adm_empresa', 'controlador', 'apontador']),
  empresaId: z.number().optional().nullable(),
  ativo: z.boolean().default(true)
})

const atualizarUsuarioSchema = z.object({
  nome: z.string().min(3).optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional().nullable(),
  cargo: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
  tipo: z.enum(['adm_sistema', 'adm_empresa', 'controlador', 'apontador']).optional(),
  empresaId: z.number().optional().nullable(),
  ativo: z.boolean().optional()
})

const listarUsuariosSchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  search: z.string().optional(),
  tipo: z.enum(['adm_empresa', 'controlador', 'apontador']).optional(),
  status: z.enum(['ativos', 'inativos']).optional()
})

export class UsuarioController {
  /**
   * Listar usuários da empresa
   */
  async listar(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page, limit, search, tipo, status } = listarUsuariosSchema.parse(req.query)

      const result = await usuarioService.listar(empresaId, {
        page,
        limit,
        search,
        tipo,
        status
      })

      res.json({
        success: true,
        ...result
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao listar usuários:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar usuário por ID
   */
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresa: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              status: true,
              plano: {
                select: {
                  id: true,
                  nome: true,
                  limiteAdm: true,
                  limiteControlador: true,
                  limiteApontador: true
                }
              }
            }
          },
          logs: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              acao: true,
              entidade: true,
              entidadeId: true,
              dadosAntigos: true,
              dadosNovos: true,
              ip: true,
              userAgent: true,
              createdAt: true
            }
          }
        }
      })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      // Remover senha do retorno
      const { senha, ...usuarioSemSenha } = usuario

      res.json(usuarioSemSenha)
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Criar novo usuário
   */
  async criar(req: Request, res: Response) {
    try {
      const dados = criarUsuarioSchema.parse(req.body)

      // Verificar se e-mail já existe
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: dados.email }
      })

      if (usuarioExistente) {
        return res.status(400).json({ message: 'E-mail já cadastrado' })
      }

      // Se for usuário de empresa, verificar limites do plano
      if (dados.empresaId && dados.tipo !== 'adm_sistema') {
        const empresa = await prisma.empresa.findUnique({
          where: { id: dados.empresaId },
          include: {
            plano: true,
            usuarios: {
              where: { tipo: dados.tipo }
            }
          }
        })

        if (!empresa) {
          return res.status(400).json({ message: 'Empresa não encontrada' })
        }

        if (!empresa.plano) {
          return res.status(400).json({ message: 'Empresa não possui plano' })
        }

        // Verificar limite por tipo
        const limites = {
          adm_empresa: empresa.plano.limiteAdm,
          controlador: empresa.plano.limiteControlador,
          apontador: empresa.plano.limiteApontador
        }

        if (empresa.usuarios.length >= limites[dados.tipo as keyof typeof limites]) {
          return res.status(400).json({ 
            message: `Limite de ${dados.tipo === 'adm_empresa' ? 'administradores' : dados.tipo === 'controlador' ? 'controladores' : 'apontadores'} atingido` 
          })
        }
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(dados.senha, authConfig.bcrypt.rounds)

      // Criar usuário
      const usuario = await prisma.usuario.create({
        data: {
          nome: dados.nome,
          email: dados.email,
          senha: senhaHash,
          telefone: dados.telefone,
          cargo: dados.cargo,
          departamento: dados.departamento,
          tipo: dados.tipo,
          empresaId: dados.empresaId || null,
          ativo: dados.ativo
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId: usuario.empresaId,
          acao: 'CRIAR_USUARIO',
          entidade: 'usuario',
          entidadeId: usuario.id,
          dadosNovos: JSON.stringify(usuario),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      // Enviar e-mail de boas-vindas (assíncrono)
      emailService.sendBoasVindas(usuario.email, usuario.nome, dados.senha).catch(console.error)

      const { senha, ...usuarioSemSenha } = usuario

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: usuarioSemSenha
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao criar usuário:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar usuário
   */
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const dados = atualizarUsuarioSchema.parse(req.body)

      // Buscar usuário atual
      const usuarioAtual = await prisma.usuario.findUnique({
        where: { id: parseInt(id) }
      })

      if (!usuarioAtual) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      // Verificar se e-mail já existe (exceto para o próprio usuário)
      if (dados.email && dados.email !== usuarioAtual.email) {
        const usuarioExistente = await prisma.usuario.findFirst({
          where: {
            email: dados.email,
            NOT: { id: parseInt(id) }
          }
        })

        if (usuarioExistente) {
          return res.status(400).json({ message: 'E-mail já cadastrado' })
        }
      }

      // Se estiver alterando tipo, verificar limites
      if (dados.tipo && dados.tipo !== usuarioAtual.tipo && usuarioAtual.empresaId) {
        const empresa = await prisma.empresa.findUnique({
          where: { id: usuarioAtual.empresaId },
          include: {
            plano: true,
            usuarios: {
              where: { tipo: dados.tipo }
            }
          }
        })

        if (empresa?.plano) {
          const limites = {
            adm_empresa: empresa.plano.limiteAdm,
            controlador: empresa.plano.limiteControlador,
            apontador: empresa.plano.limiteApontador
          }

          if (empresa.usuarios.length >= limites[dados.tipo as keyof typeof limites]) {
            return res.status(400).json({ 
              message: `Limite de ${dados.tipo === 'adm_empresa' ? 'administradores' : dados.tipo === 'controlador' ? 'controladores' : 'apontadores'} atingido` 
            })
          }
        }
      }

      // Atualizar usuário
      const usuario = await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: {
          nome: dados.nome,
          email: dados.email,
          telefone: dados.telefone,
          cargo: dados.cargo,
          departamento: dados.departamento,
          tipo: dados.tipo,
          empresaId: dados.empresaId !== undefined ? dados.empresaId : usuarioAtual.empresaId,
          ativo: dados.ativo
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId: usuario.empresaId,
          acao: 'ATUALIZAR_USUARIO',
          entidade: 'usuario',
          entidadeId: usuario.id,
          dadosAntigos: JSON.stringify(usuarioAtual),
          dadosNovos: JSON.stringify(usuario),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      const { senha, ...usuarioSemSenha } = usuario

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: usuarioSemSenha
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao atualizar usuário:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar status do usuário (ativar/desativar)
   */
  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { ativo } = req.body

      if (typeof ativo !== 'boolean') {
        return res.status(400).json({ error: 'Status deve ser true ou false' })
      }

      const usuarioAtual = await prisma.usuario.findUnique({
        where: { id: parseInt(id) }
      })

      if (!usuarioAtual) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const usuario = await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: { ativo }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId: usuario.empresaId,
          acao: ativo ? 'ATIVAR_USUARIO' : 'DESATIVAR_USUARIO',
          entidade: 'usuario',
          entidadeId: usuario.id,
          dadosAntigos: JSON.stringify({ ativo: usuarioAtual.ativo }),
          dadosNovos: JSON.stringify({ ativo }),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`
      })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Alterar senha do usuário (próprio usuário)
   */
  async alterarSenha(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { senhaAtual, novaSenha, confirmarSenha } = req.body

      // Validar se é o próprio usuário
      if ((req as any).usuario?.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Você só pode alterar sua própria senha' })
      }

      // Validar senhas
      if (novaSenha !== confirmarSenha) {
        return res.status(400).json({ error: 'As senhas não conferem' })
      }

      if (novaSenha.length < 8) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 8 caracteres' })
      }

      // Verificar senha atual
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) }
      })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha)
      if (!senhaValida) {
        return res.status(400).json({ error: 'Senha atual incorreta' })
      }

      // Hash da nova senha
      const senhaHash = await bcrypt.hash(novaSenha, authConfig.bcrypt.rounds)

      // Atualizar senha
      await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: { senha: senhaHash }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: usuario.id,
          empresaId: usuario.empresaId,
          acao: 'ALTERAR_SENHA',
          entidade: 'usuario',
          entidadeId: usuario.id,
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Solicitar redefinição de senha (esqueci minha senha)
   */
  async solicitarRedefinicaoSenha(req: Request, res: Response) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' })
      }

      const usuario = await prisma.usuario.findUnique({
        where: { email }
      })

      if (!usuario) {
        // Não revelar se o email existe ou não
        return res.json({ 
          success: true, 
          message: 'Se o email existir, você receberá instruções para redefinir sua senha' 
        })
      }

      // Gerar token de reset
      const resetToken = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      // Remover tokens antigos
      await prisma.token.deleteMany({
        where: {
          usuarioId: usuario.id,
          tipo: 'reset_password'
        }
      })

      // Criar novo token
      await prisma.token.create({
        data: {
          token: resetToken,
          tipo: 'reset_password',
          usuarioId: usuario.id,
          expiraEm: expiresAt
        }
      })

      // Enviar e-mail
      await emailService.sendRecuperacaoSenha(usuario.email, resetToken)

      res.json({ 
        success: true, 
        message: 'Se o email existir, você receberá instruções para redefinir sua senha' 
      })
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Redefinir senha com token
   */
  async redefinirSenha(req: Request, res: Response) {
    try {
      const { token, novaSenha, confirmarSenha } = req.body

      if (!token || !novaSenha || !confirmarSenha) {
        return res.status(400).json({ error: 'Token e nova senha são obrigatórios' })
      }

      if (novaSenha !== confirmarSenha) {
        return res.status(400).json({ error: 'As senhas não conferem' })
      }

      if (novaSenha.length < 8) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 8 caracteres' })
      }

      // Buscar token válido
      const tokenRecord = await prisma.token.findFirst({
        where: {
          token,
          tipo: 'reset_password',
          usado: false,
          expiraEm: {
            gt: new Date()
          }
        },
        include: {
          usuario: true
        }
      })

      if (!tokenRecord) {
        return res.status(400).json({ error: 'Token inválido ou expirado' })
      }

      // Hash da nova senha
      const senhaHash = await bcrypt.hash(novaSenha, authConfig.bcrypt.rounds)

      // Atualizar senha
      await prisma.usuario.update({
        where: { id: tokenRecord.usuarioId },
        data: { senha: senhaHash }
      })

      // Marcar token como usado
      await prisma.token.update({
        where: { id: tokenRecord.id },
        data: { usado: true }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: tokenRecord.usuarioId,
          empresaId: tokenRecord.usuario.empresaId,
          acao: 'REDEFINIR_SENHA',
          entidade: 'usuario',
          entidadeId: tokenRecord.usuarioId,
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Senha redefinida com sucesso'
      })
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Resetar senha pelo admin
   */
  async resetarSenhaAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params

      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) }
      })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      // Gerar token de reset
      const resetToken = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

      // Remover tokens antigos
      await prisma.token.deleteMany({
        where: {
          usuarioId: usuario.id,
          tipo: 'reset_password'
        }
      })

      // Criar novo token
      await prisma.token.create({
        data: {
          token: resetToken,
          tipo: 'reset_password',
          usuarioId: usuario.id,
          expiraEm: expiresAt
        }
      })

      // Enviar e-mail
      await emailService.sendRecuperacaoSenha(usuario.email, resetToken)

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId: usuario.empresaId,
          acao: 'RESETAR_SENHA_ADMIN',
          entidade: 'usuario',
          entidadeId: usuario.id,
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({ 
        success: true,
        message: 'E-mail de redefinição enviado com sucesso' 
      })
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Excluir usuário
   */
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params

      // Verificar se usuário existe
      const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresa: true
        }
      })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      // Impedir exclusão do último admin da empresa
      if (usuario.tipo === 'adm_empresa' && usuario.empresaId) {
        const adminsCount = await prisma.usuario.count({
          where: {
            empresaId: usuario.empresaId,
            tipo: 'adm_empresa',
            ativo: true
          }
        })

        if (adminsCount <= 1) {
          return res.status(400).json({ 
            error: 'Não é possível excluir o último administrador da empresa' 
          })
        }
      }

      // Registrar log antes de excluir
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario?.id,
          empresaId: usuario.empresaId,
          acao: 'EXCLUIR_USUARIO',
          entidade: 'usuario',
          entidadeId: usuario.id,
          dadosAntigos: JSON.stringify(usuario),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      // Excluir tokens do usuário
      await prisma.token.deleteMany({
        where: { usuarioId: usuario.id }
      })

      // Excluir usuário
      await prisma.usuario.delete({
        where: { id: parseInt(id) }
      })

      res.json({ 
        success: true,
        message: 'Usuário excluído com sucesso' 
      })
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Obter estatísticas de usuários da empresa
   */
  async obterStats(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const [total, admEmpresa, controladores, apontadores, ativos, inativos] = await Promise.all([
        prisma.usuario.count({ where: { empresaId } }),
        prisma.usuario.count({ where: { empresaId, tipo: 'adm_empresa' } }),
        prisma.usuario.count({ where: { empresaId, tipo: 'controlador' } }),
        prisma.usuario.count({ where: { empresaId, tipo: 'apontador' } }),
        prisma.usuario.count({ where: { empresaId, ativo: true } }),
        prisma.usuario.count({ where: { empresaId, ativo: false } })
      ])

      res.json({
        success: true,
        data: {
          total,
          admEmpresa,
          controladores,
          apontadores,
          ativos,
          inativos
        }
      })
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Verificar limites de usuários da empresa
   */
  async verificarLimites(req: Request, res: Response) {
    try {
      const { empresaId } = req.params

      const empresa = await prisma.empresa.findUnique({
        where: { id: parseInt(empresaId) },
        include: {
          plano: true
        }
      })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' })
      }

      if (!empresa.plano) {
        return res.status(400).json({ error: 'Empresa não possui plano' })
      }

      const [admCount, controladorCount, apontadorCount] = await Promise.all([
        prisma.usuario.count({ where: { empresaId: empresa.id, tipo: 'adm_empresa' } }),
        prisma.usuario.count({ where: { empresaId: empresa.id, tipo: 'controlador' } }),
        prisma.usuario.count({ where: { empresaId: empresa.id, tipo: 'apontador' } })
      ])

      const limites = {
        adm: {
          atual: admCount,
          maximo: empresa.plano.limiteAdm,
          disponivel: Math.max(0, empresa.plano.limiteAdm - admCount)
        },
        controlador: {
          atual: controladorCount,
          maximo: empresa.plano.limiteControlador,
          disponivel: Math.max(0, empresa.plano.limiteControlador - controladorCount)
        },
        apontador: {
          atual: apontadorCount,
          maximo: empresa.plano.limiteApontador,
          disponivel: Math.max(0, empresa.plano.limiteApontador - apontadorCount)
        },
        total: {
          atual: admCount + controladorCount + apontadorCount,
          maximo: empresa.plano.limiteAdm + empresa.plano.limiteControlador + empresa.plano.limiteApontador
        }
      }

      res.json({
        success: true,
        data: limites
      })
    } catch (error) {
      console.error('Erro ao verificar limites:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const usuarioController = new UsuarioController()