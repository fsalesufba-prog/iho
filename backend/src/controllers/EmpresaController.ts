import { Request, Response } from 'express'
import prisma from '../config/database'
import bcrypt from 'bcryptjs'
import { emailService } from '../services/EmailService'
import { authConfig } from '../config/auth'

export class EmpresaController {
  async listar(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, planoId, search } = req.query

      const where: any = {}

      if (status) where.status = status
      if (planoId) where.planoId = parseInt(planoId as string)
      if (search) {
        where.OR = [
          { nome: { contains: search as string } },
          { cnpj: { contains: search as string } },
          { email: { contains: search as string } }
        ]
      }

      const [empresas, total] = await Promise.all([
        prisma.empresa.findMany({
          where,
          include: {
            plano: {
              select: { id: true, nome: true }
            },
            _count: {
              select: {
                usuarios: true,
                obras: true,
                equipamentos: true,
                centroCustos: true
              }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.empresa.count({ where })
      ])

      // Calcular dias de atraso para empresas atrasadas
      const empresasComDias = empresas.map(emp => ({
        ...emp,
        diasAtraso: emp.status === 'atrasado' && emp.nextBillingAt
          ? Math.floor((new Date().getTime() - new Date(emp.nextBillingAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }))

      res.json({
        data: empresasComDias,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar empresas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const empresa = await prisma.empresa.findUnique({
        where: { id: parseInt(id) },
        include: {
          plano: true,
          usuarios: {
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              ativo: true,
              ultimoAcesso: true
            }
          },
          obras: {
            select: {
              id: true,
              nome: true,
              codigo: true,
              status: true
            }
          },
          equipamentos: {
            select: {
              id: true,
              nome: true,
              tag: true,
              status: true
            }
          },
          pagamentos: {
            orderBy: { dataVencimento: 'desc' },
            take: 10
          },
          logs: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
              usuario: {
                select: { nome: true }
              }
            }
          },
          _count: {
            select: {
              usuarios: true,
              obras: true,
              equipamentos: true,
              centroCustos: true
            }
          }
        }
      })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' })
      }

      // Calcular dias de atraso
      const diasAtraso = empresa.status === 'atrasado' && empresa.nextBillingAt
        ? Math.floor((new Date().getTime() - new Date(empresa.nextBillingAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      // Formatar logs
      const logsFormatados = (empresa as any).logs.map((log: any) => ({
        id: log.id,
        acao: log.acao,
        usuario: log.usuario?.nome || 'Sistema',
        data: log.createdAt.toLocaleString('pt-BR')
      }))

      res.json({
        ...empresa,
        diasAtraso,
        logs: logsFormatados
      })
    } catch (error) {
      console.error('Erro ao buscar empresa:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { empresa, usuario } = req.body

      // Verificar se CNPJ já existe
      const empresaExistente = await prisma.empresa.findUnique({
        where: { cnpj: empresa.cnpj }
      })

      if (empresaExistente) {
        return res.status(400).json({ message: 'CNPJ já cadastrado' })
      }

      // Verificar se plano existe
      const plano = await prisma.plano.findUnique({
        where: { id: empresa.planoId }
      })

      if (!plano) {
        return res.status(400).json({ message: 'Plano não encontrado' })
      }

      // Criar empresa
      const novaEmpresa = await prisma.empresa.create({
        data: {
          nome: empresa.nome,
          cnpj: empresa.cnpj,
          email: empresa.email,
          telefone: empresa.telefone,
          endereco: empresa.enderecoCompleto || empresa.endereco,
          cidade: empresa.cidade,
          estado: empresa.estado,
          cep: empresa.cep,
          planoId: empresa.planoId,
          status: empresa.status || 'ativo',
          implantacaoPaga: false
        }
      })

      // Criar usuário administrador se fornecido
      if (usuario) {
        const senhaHash = await bcrypt.hash(usuario.senha, authConfig.bcrypt.rounds)

        await prisma.usuario.create({
          data: {
            nome: usuario.nome,
            email: usuario.email,
            senha: senhaHash,
            telefone: usuario.telefone,
            tipo: 'adm_empresa',
            empresaId: novaEmpresa.id,
            ativo: true
          }
        })

        // Enviar e-mail de boas-vindas
        await emailService.sendBoasVindas(usuario.email, usuario.nome, novaEmpresa.nome)
      } else {
        // Se não criou usuário, enviar e-mail para o contato da empresa
        await emailService.sendEmpresaCriada(novaEmpresa.email, novaEmpresa.nome, plano!.nome)
      }

      // Registrar log
      await prisma.log.create({
        data: {
          empresaId: novaEmpresa.id,
          acao: 'CRIAR_EMPRESA',
          entidade: 'empresa',
          entidadeId: novaEmpresa.id,
          usuarioId: (req as any).user?.id
        }
      })

      res.status(201).json(novaEmpresa)
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params
      const data = req.body

      const empresa = await prisma.empresa.update({
        where: { id: parseInt(id) },
        data: {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep,
          planoId: data.planoId ? parseInt(data.planoId) : undefined,
          status: data.status
        }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          empresaId: empresa.id,
          acao: 'ATUALIZAR_EMPRESA',
          entidade: 'empresa',
          entidadeId: empresa.id,
          usuarioId: (req as any).user?.id
        }
      })

      res.json(empresa)
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      const empresa = await prisma.empresa.update({
        where: { id: parseInt(id) },
        data: { status }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          empresaId: empresa.id,
          acao: `ALTERAR_STATUS_${status.toUpperCase()}`,
          entidade: 'empresa',
          entidadeId: empresa.id,
          usuarioId: (req as any).user?.id
        }
      })

      // Se cancelado, enviar e-mail
      if (status === 'cancelado') {
        await emailService.sendAssinaturaCancelada(empresa.email)
      }

      res.json(empresa)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params

      await prisma.empresa.delete({
        where: { id: parseInt(id) }
      })

      res.json({ message: 'Empresa excluída com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async verificarLimites(req: Request, res: Response) {
    try {
      const { id } = req.params

      const empresa = await prisma.empresa.findUnique({
        where: { id: parseInt(id) },
        include: {
          plano: true,
          _count: {
            select: {
              usuarios: {
                where: { ativo: true }
              },
              equipamentos: {
                where: { status: { not: 'inativo' } }
              }
            }
          }
        }
      })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' })
      }

      const limites = {
        usuarios: {
          atual: empresa._count.usuarios,
          maximo: empresa.plano.limiteAdm + empresa.plano.limiteControlador + empresa.plano.limiteApontador,
          disponivel: (empresa.plano.limiteAdm + empresa.plano.limiteControlador + empresa.plano.limiteApontador) - empresa._count.usuarios
        },
        equipamentos: {
          atual: empresa._count.equipamentos,
          maximo: empresa.plano.limiteEquipamentos,
          disponivel: empresa.plano.limiteEquipamentos - empresa._count.equipamentos
        }
      }

      res.json(limites)
    } catch (error) {
      console.error('Erro ao verificar limites:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}

export const empresaController = new EmpresaController()