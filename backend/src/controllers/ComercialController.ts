import { Request, Response } from 'express'
import prisma from '../config/database'
import { emailService } from '../services/EmailService'
import { infinitePayService } from '../services/InfinitePayService'

export class ComercialController {
  async getStats(req: Request, res: Response) {
    try {
      const [totalEmpresas, totalUsuarios, totalEquipamentos] = await Promise.all([
        prisma.empresa.count(),
        prisma.usuario.count(),
        prisma.equipamento.count(),
      ])

      res.json({
        empresas: totalEmpresas,
        usuarios: totalUsuarios,
        equipamentos: totalEquipamentos,
        satisfacao: 98,
        uptime: '99.9',
        suporte: '24/7'
      })
    } catch (error) {
      console.error('Erro ao buscar stats:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getFeatures(req: Request, res: Response) {
    try {
      const features = [
        {
          id: 'dashboard',
          title: 'Dashboard Inteligente',
          description: 'Visualize todos os indicadores em tempo real com gráficos interativos.',
          icon: 'BarChart3',
          gradient: 'from-blue-500 to-cyan-500',
        },
        {
          id: 'iho',
          title: 'Índice de Saúde Operacional',
          description: 'Acompanhe a saúde dos equipamentos com nosso índice exclusivo.',
          icon: 'Activity',
          gradient: 'from-purple-500 to-pink-500',
        },
        {
          id: 'maintenance',
          title: 'Manutenção Preditiva',
          description: 'Antecipe problemas com análises preditivas avançadas.',
          icon: 'Wrench',
          gradient: 'from-orange-500 to-red-500',
        },
        {
          id: 'equipment',
          title: 'Gestão de Equipamentos',
          description: 'Controle completo do ciclo de vida dos equipamentos.',
          icon: 'Truck',
          gradient: 'from-green-500 to-emerald-500',
        },
        {
          id: 'financial',
          title: 'Análise Financeira',
          description: 'Acompanhe custos, depreciação e ROI em tempo real.',
          icon: 'DollarSign',
          gradient: 'from-yellow-500 to-amber-500',
        },
        {
          id: 'reports',
          title: 'Relatórios Automáticos',
          description: 'Gere relatórios gerenciais automaticamente.',
          icon: 'FileText',
          gradient: 'from-indigo-500 to-blue-500',
        },
      ]

      res.json(features)
    } catch (error) {
      console.error('Erro ao buscar features:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getTestimonials(req: Request, res: Response) {
    try {
      const testimonials = [
        {
          id: 1,
          name: 'João Silva',
          role: 'Diretor de Operações',
          company: 'Construtora ABC',
          content: 'O IHO revolucionou nossa gestão de equipamentos. Reduzimos custos de manutenção em 30% no primeiro ano.',
          avatar: '/avatars/1.jpg',
          rating: 5,
        },
        {
          id: 2,
          name: 'Maria Santos',
          role: 'Gerente de Frota',
          company: 'Transportadora XYZ',
          content: 'A plataforma é intuitiva e os relatórios são incríveis. Recomendo a todas as empresas do setor.',
          avatar: '/avatars/2.jpg',
          rating: 5,
        },
        {
          id: 3,
          name: 'Carlos Oliveira',
          role: 'CEO',
          company: 'Mineradora Rio',
          content: 'O ROI foi imediato. Conseguimos otimizar nossa frota e aumentar a disponibilidade dos equipamentos.',
          avatar: '/avatars/3.jpg',
          rating: 5,
        },
      ]

      res.json(testimonials)
    } catch (error) {
      console.error('Erro ao buscar depoimentos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getFAQ(req: Request, res: Response) {
    try {
      const faq = [
        {
          pergunta: 'Como funciona o período de implantação?',
          resposta: 'O período de implantação é de 10 dias úteis, onde nossa equipe configura todo o sistema, realiza treinamentos e garante que sua empresa esteja pronta para usar todas as funcionalidades.'
        },
        {
          pergunta: 'Posso parcelar a taxa de implantação?',
          resposta: 'Sim! A taxa de implantação pode ser parcelada em até 10x sem juros no cartão de crédito ou paga à vista no PIX com 5% de desconto.'
        },
        {
          pergunta: 'Como funciona a cobrança da mensalidade?',
          resposta: 'A primeira mensalidade vence 40 dias após o pagamento da implantação (10 dias de implantação + 30 dias de uso). As demais vencem mensalmente na mesma data.'
        },
        {
          pergunta: 'Posso mudar de plano depois?',
          resposta: 'Sim! Você pode fazer upgrade ou downgrade do plano a qualquer momento. O valor é ajustado proporcionalmente aos dias restantes do mês.'
        },
        {
          pergunta: 'O que acontece se atrasar o pagamento?',
          resposta: 'Oferecemos 10 dias úteis de tolerância. Após esse período, o acesso ao sistema é temporariamente bloqueado até a regularização do pagamento.'
        },
        {
          pergunta: 'O sistema tem suporte em português?',
          resposta: 'Sim! Oferecemos suporte completo em português via chat, e-mail e telefone, de segunda a sexta, das 8h às 18h.'
        }
      ]

      res.json(faq)
    } catch (error) {
      console.error('Erro ao buscar FAQ:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async subscribeNewsletter(req: Request, res: Response) {
    try {
      const { email, nome } = req.body

      if (!email) {
        return res.status(400).json({ error: 'E-mail é obrigatório' })
      }

      await prisma.newsletter.upsert({
        where: { email },
        update: { nome, ativo: true },
        create: { email, nome },
      })

      await emailService.sendNewsletterWelcome(email, nome)

      res.json({ message: 'Inscrição realizada com sucesso' })
    } catch (error) {
      console.error('Erro ao inscrever na newsletter:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async contact(req: Request, res: Response) {
    try {
      const { nome, email, telefone, empresa, mensagem } = req.body

      if (!nome || !email || !mensagem) {
        return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios' })
      }

      await prisma.contato.create({
        data: { nome, email, telefone, empresa, mensagem, status: 'pendente' },
      })

      await emailService.sendContactEmail({ nome, email, telefone, empresa, mensagem })
      await emailService.sendContactConfirmation(email, nome)

      res.json({ message: 'Mensagem enviada com sucesso' })
    } catch (error) {
      console.error('Erro ao enviar contato:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Listar planos publicamente (sem autenticação)
   */
  async listarPlanos(req: Request, res: Response) {
    try {
      const planos = await prisma.plano.findMany({
        orderBy: { valorMensal: 'asc' }
      })

      const planosFormatados = planos.map(plano => ({
        ...plano,
        recursos: (() => {
          try {
            return typeof plano.recursos === 'string' ? JSON.parse(plano.recursos) : plano.recursos
          } catch {
            return []
          }
        })()
      }))

      res.json({ data: planosFormatados })
    } catch (error) {
      console.error('Erro ao listar planos públicos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Iniciar pagamento via InfinitePay (sem autenticação)
   */
  async iniciarPagamento(req: Request, res: Response) {
    try {
      const { planoId, dadosEmpresa, dadosResponsavel } = req.body

      if (!planoId || !dadosEmpresa?.nome || !dadosEmpresa?.cnpj || !dadosEmpresa?.email) {
        return res.status(400).json({ error: 'Dados incompletos: planoId, nome, cnpj e email são obrigatórios' })
      }

      const plano = await prisma.plano.findUnique({ where: { id: planoId } })
      if (!plano) {
        return res.status(404).json({ error: 'Plano não encontrado' })
      }

      const empresaExistente = await prisma.empresa.findUnique({
        where: { cnpj: dadosEmpresa.cnpj.replace(/\D/g, '') }
      })
      if (empresaExistente) {
        return res.status(409).json({
          error: 'CNPJ já cadastrado',
          message: 'Esta empresa já possui cadastro. Faça login para continuar.'
        })
      }

      const empresa = await prisma.empresa.create({
        data: {
          nome: dadosEmpresa.nome,
          cnpj: dadosEmpresa.cnpj.replace(/\D/g, ''),
          email: dadosEmpresa.email,
          telefone: dadosEmpresa.telefone || '',
          endereco: [dadosEmpresa.endereco, dadosEmpresa.numero, dadosEmpresa.bairro].filter(Boolean).join(', ') || 'Aguardando',
          cidade: dadosEmpresa.cidade || 'Aguardando',
          estado: dadosEmpresa.estado || 'SP',
          cep: dadosEmpresa.cep?.replace(/\D/g, '') || '00000000',
          planoId: plano.id,
          status: 'pendente'
        }
      })

      const orderNsu = `IHO-${empresa.id}-${Date.now()}`

      const pagamento = await prisma.pagamento.create({
        data: {
          empresaId: empresa.id,
          tipo: 'implantacao',
          valor: plano.valorImplantacao,
          status: 'pendente',
          dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          formaPagamento: 'checkout_link',
          transacaoId: orderNsu
        }
      })

      const valorCentavos = Math.round(plano.valorImplantacao * 100)

      let checkoutUrl: string

      try {
        const link = await infinitePayService.createPaymentLink({
          orderId: orderNsu,
          amount: valorCentavos,
          description: `Implantação IHO - Plano ${plano.nome} - ${empresa.nome}`,
          customerName: dadosResponsavel?.nome || empresa.nome,
          customerEmail: dadosResponsavel?.email || empresa.email,
          customerPhone: dadosResponsavel?.telefone || empresa.telefone,
          installments: 10,
          paymentTypes: ['credit_card', 'pix'],
          redirectUrl: `${process.env.FRONTEND_URL || 'https://iho.sqtecnologiadainformacao.com'}/pagamento/${pagamento.id}`
        })

        checkoutUrl = link.url

        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: { linkPagamento: checkoutUrl }
        })
      } catch (payErr) {
        console.error('Erro ao gerar link InfinitePay:', payErr)
        return res.status(502).json({
          error: 'Não foi possível gerar o link de pagamento. Tente novamente ou entre em contato com o suporte.'
        })
      }

      try {
        await emailService.sendPagamentoInstrucoes(
          empresa.email,
          empresa.nome,
          {
            plano: plano.nome,
            valor: plano.valorImplantacao,
            metodo: 'pix',
            dataVencimento: pagamento.dataVencimento
          }
        )
      } catch {
        // Não falha se o email não enviar
      }

      return res.json({
        sucesso: true,
        checkoutUrl,
        pagamentoId: pagamento.id
      })
    } catch (error) {
      console.error('Erro ao iniciar pagamento:', error)
      return res.status(500).json({ error: 'Erro interno ao processar pagamento' })
    }
  }

  /**
   * Buscar status de pagamento (sem autenticação)
   */
  async getStatusPagamento(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pagamento = await prisma.pagamento.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresa: {
            select: { nome: true, email: true, status: true }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      return res.json({
        id: pagamento.id,
        status: pagamento.status,
        valor: pagamento.valor,
        tipo: pagamento.tipo,
        dataVencimento: pagamento.dataVencimento,
        dataPagamento: pagamento.dataPagamento,
        linkPagamento: pagamento.linkPagamento,
        empresa: pagamento.empresa
      })
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }
}
