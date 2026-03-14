import { Request, Response } from 'express'
import prisma from '../config/database'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado inválido'),
  cep: z.string().min(8, 'CEP inválido'),
  logo: z.string().optional()
})

const notificacoesSchema = z.object({
  emailAlertas: z.boolean().default(true),
  emailRelatorios: z.boolean().default(false),
  emailManutencoes: z.boolean().default(true),
  emailPromocoes: z.boolean().default(false),
  sistemaAlertas: z.boolean().default(true),
  sistemaManutencoes: z.boolean().default(true),
  sistemaRelatorios: z.boolean().default(true)
})

const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial'),
  confirmarSenha: z.string()
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não conferem',
  path: ['confirmarSenha']
})

export class ConfiguracaoController {
  /**
   * Buscar configurações da empresa
   */
  async buscarEmpresa(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        include: {
          plano: {
            select: {
              id: true,
              nome: true,
              valorMensal: true,
              limiteAdm: true,
              limiteControlador: true,
              limiteApontador: true,
              limiteEquipamentos: true
            }
          },
          _count: {
            select: {
              usuarios: true,
              equipamentos: true,
              obras: true
            }
          }
        }
      })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' })
      }

      res.json({
        success: true,
        data: empresa
      })
    } catch (error) {
      console.error('Erro ao buscar empresa:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar configurações da empresa
   */
  async atualizarEmpresa(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = empresaSchema.parse(req.body)

      const empresa = await prisma.empresa.update({
        where: { id: empresaId },
        data: dados
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario.id,
          empresaId,
          acao: 'ATUALIZAR_EMPRESA',
          entidade: 'empresa',
          entidadeId: empresa.id,
          dadosNovos: JSON.stringify(dados),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Empresa atualizada com sucesso',
        data: empresa
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao atualizar empresa:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar configurações de notificações
   */
  async buscarNotificacoes(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      let config = await prisma.configuracaoNotificacao.findUnique({
        where: { empresaId }
      })

      if (!config) {
        // Criar configuração padrão
        config = await prisma.configuracaoNotificacao.create({
          data: {
            empresaId,
            emailAlertas: true,
            emailRelatorios: false,
            emailManutencoes: true,
            emailPromocoes: false,
            sistemaAlertas: true,
            sistemaManutencoes: true,
            sistemaRelatorios: true
          }
        })
      }

      res.json({
        success: true,
        data: config
      })
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Atualizar configurações de notificações
   */
  async atualizarNotificacoes(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const dados = notificacoesSchema.parse(req.body)

      const config = await prisma.configuracaoNotificacao.upsert({
        where: { empresaId },
        update: dados,
        create: {
          ...dados,
          empresaId
        }
      })

      res.json({
        success: true,
        message: 'Configurações de notificação atualizadas',
        data: config
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao atualizar notificações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar usuários da empresa
   */
  async listarUsuarios(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { page = 1, limit = 10 } = req.query

      const [usuarios, total] = await Promise.all([
        prisma.usuario.findMany({
          where: { empresaId },
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            ativo: true,
            ultimoAcesso: true,
            createdAt: true
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { nome: 'asc' }
        }),
        prisma.usuario.count({ where: { empresaId } })
      ])

      res.json({
        success: true,
        data: usuarios,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar usuários:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Buscar informações da assinatura
   */
  async buscarAssinatura(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        include: {
          plano: true,
          pagamentos: {
            where: { status: 'pago' },
            orderBy: { dataVencimento: 'desc' },
            take: 12
          }
        }
      })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' })
      }

      // Calcular próximos vencimentos
      const ultimoPagamento = empresa.pagamentos[0]
      const proximoVencimento = ultimoPagamento 
        ? new Date(ultimoPagamento.dataVencimento)
        : new Date()

      proximoVencimento.setMonth(proximoVencimento.getMonth() + 1)

      // Calcular dias até o vencimento
      const diasAteVencimento = Math.ceil(
        (proximoVencimento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )

      res.json({
        success: true,
        data: {
          plano: empresa.plano,
          status: empresa.status,
          dataContratacao: empresa.dataAtivacao,
          proximoVencimento,
          diasAteVencimento,
          valorMensal: empresa.plano?.valorMensal,
          historicoPagamentos: empresa.pagamentos.slice(0, 6)
        }
      })
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelarAssinatura(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa
      const { motivo, confirmacao } = req.body

      if (confirmacao !== 'CANCELAR') {
        return res.status(400).json({ 
          error: 'Confirmação inválida',
          message: 'Digite "CANCELAR" para confirmar o cancelamento'
        })
      }

      const empresa = await prisma.empresa.update({
        where: { id: empresaId },
        data: {
          status: 'cancelado',
          motivoCancelamento: motivo,
          dataCancelamento: new Date()
<<<<<<< HEAD
        }
=======
        } as any
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })

      // Desativar usuários
      await prisma.usuario.updateMany({
        where: { empresaId },
        data: { ativo: false }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          usuarioId: (req as any).usuario.id,
          empresaId,
          acao: 'CANCELAR_ASSINATURA',
          entidade: 'empresa',
          entidadeId: empresa.id,
          dadosNovos: JSON.stringify({ motivo }),
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      })

      res.json({
        success: true,
        message: 'Assinatura cancelada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Alterar senha do usuário
   */
  async alterarSenha(req: Request, res: Response) {
    try {
      const { id: usuarioId } = (req as any).usuario
      const dados = alterarSenhaSchema.parse(req.body)

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId }
      })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const senhaValida = await bcrypt.compare(dados.senhaAtual, usuario.senha)
      if (!senhaValida) {
        return res.status(400).json({ error: 'Senha atual incorreta' })
      }

      const novaSenhaHash = await bcrypt.hash(dados.novaSenha, 10)

      await prisma.usuario.update({
        where: { id: usuarioId },
        data: { senha: novaSenhaHash }
      })

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Erro de validação', 
          detalhes: error.errors 
        })
      }
      console.error('Erro ao alterar senha:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Estatísticas de uso
   */
  async estatisticasUso(req: Request, res: Response) {
    try {
      const { id: empresaId } = (req as any).empresa

      const [usuarios, equipamentos, obras, manutencoes] = await Promise.all([
        prisma.usuario.count({ where: { empresaId } }),
        prisma.equipamento.count({ where: { empresaId } }),
        prisma.obra.count({ where: { empresaId } }),
        prisma.manutencao.count({
          where: {
            equipamento: { empresaId },
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
          }
        })
      ])

      res.json({
        success: true,
        data: {
          usuarios,
          equipamentos,
          obras,
          manutencoes30dias: manutencoes,
          percentualUsuarios: await this.calcularPercentualUsuarios(empresaId),
          percentualEquipamentos: await this.calcularPercentualEquipamentos(empresaId)
        }
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Calcular percentual de usuários utilizado
   */
  private async calcularPercentualUsuarios(empresaId: number) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: { plano: true }
    })

    if (!empresa?.plano) return 0

    const totalUsuarios = await prisma.usuario.count({
      where: { empresaId }
    })

    const limiteTotal = empresa.plano.limiteAdm + 
                       empresa.plano.limiteControlador + 
                       empresa.plano.limiteApontador

    return limiteTotal > 0 ? (totalUsuarios / limiteTotal) * 100 : 0
  }

  /**
   * Calcular percentual de equipamentos utilizado
   */
  private async calcularPercentualEquipamentos(empresaId: number) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: { plano: true }
    })

    if (!empresa?.plano) return 0

    const totalEquipamentos = await prisma.equipamento.count({
      where: { empresaId }
    })

    return empresa.plano.limiteEquipamentos > 0 
      ? (totalEquipamentos / empresa.plano.limiteEquipamentos) * 100 
      : 0
  }
}

export const configuracaoController = new ConfiguracaoController()