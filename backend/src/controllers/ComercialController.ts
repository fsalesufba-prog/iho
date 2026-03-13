import { Request, Response } from 'express'
import prisma from '../config/database'
import { emailService } from '../services/EmailService'

export class ComercialController {
  async getStats(req: Request, res: Response) {
    try {
      const [totalEmpresas, totalUsuarios, totalEquipamentos] = await Promise.all([
        prisma.empresa.count(),
        prisma.usuario.count(),
        prisma.equipamento.count(),
      ])

      // Calcular satisfação média (exemplo)
      const satisfacao = 98

      res.json({
        empresas: totalEmpresas,
        usuarios: totalUsuarios,
        equipamentos: totalEquipamentos,
        satisfacao,
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
      // Buscar depoimentos do banco ou usar mock
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
          question: 'Como funciona o período de implantação?',
          answer: 'O período de implantação é de 10 dias úteis, onde nossa equipe configura todo o sistema, realiza treinamentos e garante que sua empresa esteja pronta para usar todas as funcionalidades.',
        },
        {
          question: 'Posso parcelar a taxa de implantação?',
          answer: 'Sim! A taxa de implantação pode ser parcelada em até 10x sem juros no cartão de crédito ou paga à vista no PIX com 5% de desconto.',
        },
        {
          question: 'Como funciona a cobrança da mensalidade?',
          answer: 'A primeira mensalidade vence 40 dias após o pagamento da implantação (10 dias de implantação + 30 dias de uso). As demais vencem mensalmente na mesma data.',
        },
        {
          question: 'Posso mudar de plano depois?',
          answer: 'Sim! Você pode fazer upgrade ou downgrade do plano a qualquer momento. O valor é ajustado proporcionalmente aos dias restantes do mês.',
        },
        {
          question: 'O que acontece se atrasar o pagamento?',
          answer: 'Oferecemos 10 dias úteis de tolerância. Após esse período, o acesso ao sistema é temporariamente bloqueado até a regularização do pagamento.',
        },
        {
          question: 'O sistema tem suporte em português?',
          answer: 'Sim! Oferecemos suporte completo em português via chat, e-mail e telefone, de segunda a sexta, das 8h às 18h.',
        },
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

      // Salvar no banco
      await prisma.newsletter.upsert({
        where: { email },
        update: { nome, ativo: true },
        create: { email, nome },
      })

      // Enviar e-mail de boas-vindas
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

      // Salvar contato no banco
      await prisma.contato.create({
        data: {
          nome,
          email,
          telefone,
          empresa,
          mensagem,
          status: 'pendente',
        },
      })

      // Enviar e-mail para o suporte
      await emailService.sendContactEmail({
        nome,
        email,
        telefone,
        empresa,
        mensagem,
      })

      // Enviar e-mail de confirmação para o usuário
      await emailService.sendContactConfirmation(email, nome)

      res.json({ message: 'Mensagem enviada com sucesso' })
    } catch (error) {
      console.error('Erro ao enviar contato:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getFAQ(req: Request, res: Response) {
    try {
      // Se tiver a tabela FAQ no banco
      // const faq = await prisma.fAQ.findMany({
      //   where: { ativo: true },
      //   orderBy: { ordem: 'asc' }
      // })

      // Mock enquanto não tem a tabela
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
}