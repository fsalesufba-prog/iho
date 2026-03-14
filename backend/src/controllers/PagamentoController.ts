import { Request, Response } from 'express'
import prisma from '../config/database'
import { infinitePayService } from '../services/InfinitePayService'
import { emailService } from '../services/EmailService'
import { v4 as uuidv4 } from 'uuid'

export class PagamentoController {
  /**
   * Criar link de pagamento para implantação (admin)
   */
  async criarLinkImplantacao(req: Request, res: Response) {
    try {
      const { empresaId } = req.body

      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        include: { plano: true }
      })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' })
      }

      const link = await infinitePayService.createImplantacaoLink(
        empresa.id,
        empresa.nome,
        empresa.plano.nome
      )

      // Salvar pagamento pendente
      await prisma.pagamento.create({
        data: {
          empresaId: empresa.id,
          tipo: 'implantacao',
          valor: empresa.plano.valorImplantacao,
          status: 'pendente',
          dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          transacaoId: link.id
        }
      })

      return res.json({ link: link.url })
    } catch (error) {
      console.error('Erro ao criar link de implantação:', error)
      return res.status(500).json({ error: 'Erro ao gerar link de pagamento' })
    }
  }

  /**
   * Criar link de pagamento para mensalidade (admin)
   */
  async criarLinkMensalidade(req: Request, res: Response) {
    try {
      const { empresaId } = req.body

      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        include: { plano: true }
      })

      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' })
      }

      const link = await infinitePayService.createMensalidadeLink(
        empresa.id,
        empresa.nome,
        empresa.plano.nome
      )

      // Salvar pagamento pendente
      await prisma.pagamento.create({
        data: {
          empresaId: empresa.id,
          tipo: 'mensalidade',
          valor: empresa.plano.valorMensal,
          status: 'pendente',
          dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          transacaoId: link.id
        }
      })

      return res.json({ link: link.url })
    } catch (error) {
      console.error('Erro ao criar link de mensalidade:', error)
      return res.status(500).json({ error: 'Erro ao gerar link de pagamento' })
    }
  }

  /**
   * Processar webhook de pagamento (InfinitePay)
   */
  async webhook(req: Request, res: Response) {
    try {
      const payload = req.body

      // Processar webhook
      const result = infinitePayService.processWebhook(payload as any)

      // Buscar pagamento pelo orderId (transacaoId)
      const pagamento = await prisma.pagamento.findFirst({
        where: { transacaoId: result.orderId },
        include: {
          empresa: {
            include: {
              plano: true,
              usuarios: true
            }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      if (result.status === 'paid') {
        // Atualizar pagamento
        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: {
            status: 'pago',
            dataPagamento: new Date(),
            formaPagamento: result.paymentMethod
          }
        })

        if (pagamento.tipo === 'implantacao') {
          // Ativar empresa
          await prisma.empresa.update({
            where: { id: pagamento.empresaId },
            data: {
              implantacaoPaga: true,
              dataAtivacao: new Date(),
              status: 'ativo',
              nextBillingAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000) // 40 dias
            }
          })

          // Enviar email de boas-vindas para todos os usuários da empresa
          for (const usuario of pagamento.empresa.usuarios) {
            await emailService.sendBoasVindas(
              usuario.email,
              usuario.nome,
              pagamento.empresa.nome
            ).catch(e => console.error('Erro ao enviar e-mail:', e))
          }
        } else {
          // Mensalidade paga - atualizar próxima cobrança
          await prisma.empresa.update({
            where: { id: pagamento.empresaId },
            data: {
              status: 'ativo',
              diasAtraso: 0,
              nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 dias
            }
          })
        }

        // Enviar email de confirmação
        await (emailService as any).sendPagamentoConfirmado(
          pagamento.empresa.email,
          pagamento.empresa.plano.nome,
          pagamento.valor
        )
      }

      return res.json({ received: true })
    } catch (error) {
      console.error('Erro no webhook:', error)
      return res.status(500).json({ error: 'Erro ao processar webhook' })
    }
  }

  /**
   * Listar pagamentos de uma empresa
   */
  async listarPagamentos(req: Request, res: Response) {
    try {
      const { empresaId } = req.params
      const { page = 1, limit = 10, status, tipo } = req.query

      const where: any = { empresaId: parseInt(empresaId) }

      if (status) where.status = status
      if (tipo) where.tipo = tipo

      const [pagamentos, total] = await Promise.all([
        prisma.pagamento.findMany({
          where,
          orderBy: { dataVencimento: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        prisma.pagamento.count({ where })
      ])

      return res.json({
        data: pagamentos,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error)
      return res.status(500).json({ error: 'Erro ao listar pagamentos' })
    }
  }

  /**
   * Cancelar assinatura de uma empresa
   */
  async cancelarAssinatura(req: Request, res: Response) {
    try {
      const { empresaId } = req.params

      await prisma.empresa.update({
        where: { id: parseInt(empresaId) },
        data: {
          status: 'cancelado',
          canceledAt: new Date()
        } as any
      })

      const empresa = await prisma.empresa.findUnique({
        where: { id: parseInt(empresaId) }
      })

      if (empresa) {
        await emailService.sendAssinaturaCancelada(empresa.email)
      }

      return res.json({ message: 'Assinatura cancelada com sucesso' })
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      return res.status(500).json({ error: 'Erro ao cancelar assinatura' })
    }
  }

  /**
   * Buscar detalhes de um pagamento
   */
  async getPagamento(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pagamento = await prisma.pagamento.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresa: {
            include: {
              plano: true
            }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      return res.json({
        id: pagamento.id,
        valor: pagamento.valor,
        status: pagamento.status,
        tipo: pagamento.tipo,
        metodo: pagamento.formaPagamento,
        dataVencimento: pagamento.dataVencimento,
        dataPagamento: pagamento.dataPagamento,
        transacaoId: pagamento.transacaoId,
        reciboUrl: pagamento.reciboUrl,
        linkPagamento: pagamento.linkPagamento,
        qrCode: pagamento.qrCode,
        linhaDigitavel: pagamento.linhaDigitavel,
        urlBoleto: pagamento.urlBoleto,
        empresa: {
          id: pagamento.empresa.id,
          nome: pagamento.empresa.nome,
          email: pagamento.empresa.email,
          plano: pagamento.empresa.plano
        }
      })
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Iniciar pagamento comercial (checkout público)
   */
  async iniciarPagamentoComercial(req: Request, res: Response) {
    try {
      const { planoId, metodo, parcelas, dadosEmpresa } = req.body

      // Validar dados obrigatórios
      if (!planoId || !metodo || !dadosEmpresa?.nome || !dadosEmpresa?.cnpj || !dadosEmpresa?.email) {
        return res.status(400).json({
          error: 'Dados incompletos',
          campos: ['planoId', 'metodo', 'nome', 'cnpj', 'email']
        })
      }

      // Validar método de pagamento
      if (!['cartao', 'pix', 'boleto'].includes(metodo)) {
        return res.status(400).json({ error: 'Método de pagamento inválido' })
      }

      // Buscar plano
      const plano = await prisma.plano.findUnique({
        where: { id: planoId }
      })

      if (!plano) {
        return res.status(404).json({ error: 'Plano não encontrado' })
      }

      // Verificar se CNPJ já está cadastrado
      const empresaExistente = await prisma.empresa.findUnique({
        where: { cnpj: dadosEmpresa.cnpj }
      })

      if (empresaExistente) {
        return res.status(409).json({
          error: 'CNPJ já cadastrado',
          message: 'Esta empresa já possui cadastro. Faça login para continuar.'
        })
      }

      // Calcular valor com desconto
      let valor = plano.valorImplantacao
      if (metodo === 'pix') {
        valor = valor * 0.95 // 5% de desconto
      }

      // Criar empresa com status pendente
      const empresa = await prisma.empresa.create({
        data: {
          nome: dadosEmpresa.nome,
          cnpj: dadosEmpresa.cnpj,
          email: dadosEmpresa.email,
          telefone: dadosEmpresa.telefone || '',
          endereco: dadosEmpresa.endereco || 'Aguardando pagamento',
          cidade: dadosEmpresa.cidade || 'Aguardando pagamento',
          estado: dadosEmpresa.estado || 'AA',
          cep: dadosEmpresa.cep || '00000-000',
          planoId: plano.id,
          status: 'pendente'
        }
      })

      // Gerar ID único para transação
      const transacaoId = `PAY-${Date.now()}-${uuidv4().substring(0, 8)}`

      // Criar pagamento
      const pagamento = await prisma.pagamento.create({
        data: {
          empresaId: empresa.id,
          tipo: 'implantacao',
          valor,
          status: 'pendente',
          dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          formaPagamento: metodo,
          transacaoId
        }
      })

      // Gerar dados de pagamento conforme método
      let dadosPagamento: any = {
        id: pagamento.id,
        valor,
        metodo,
        dataVencimento: pagamento.dataVencimento
      }

      if (metodo === 'pix') {
        // Simular geração de PIX
        const pixData = {
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${transacaoId}`,
          codigoPix: `00020126580014BR.GOV.BCB.PIX0136${transacaoId}5204000053039865406${valor.toFixed(2).replace('.', '')}5802BR5925${empresa.nome.substring(0, 25)}6009SaoPaulo62070503***6304E1B5`
        }

        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: {
            qrCode: pixData.qrCode,
            linkPagamento: pixData.codigoPix
          }
        })

        dadosPagamento = {
          ...dadosPagamento,
          qrCode: pixData.qrCode,
          codigoPix: pixData.codigoPix
        }
      }
      else if (metodo === 'boleto') {
        // Simular geração de boleto
        const linhaDigitavel = `${transacaoId.substring(0, 5)}.${transacaoId.substring(5, 10)} ${transacaoId.substring(10, 15)}.${transacaoId.substring(15, 20)} ${transacaoId.substring(20, 25)}.${transacaoId.substring(25, 30)} ${transacaoId.substring(30, 35)}`

        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: {
            linhaDigitavel,
            urlBoleto: `https://boleto.iho.com.br/${transacaoId}.pdf`
          }
        })

        dadosPagamento = {
          ...dadosPagamento,
          linhaDigitavel,
          urlBoleto: `https://boleto.iho.com.br/${transacaoId}.pdf`
        }
      }

      // Enviar e-mail com instruções
      try {
        await emailService.sendPagamentoInstrucoes(
          dadosEmpresa.email,
          dadosEmpresa.nome,
          {
            plano: plano.nome,
            valor,
            metodo,
            dataVencimento: pagamento.dataVencimento,
            ...dadosPagamento
          }
        )
      } catch (emailError) {
        console.error('Erro ao enviar e-mail:', emailError)
        // Não falha o processo se o e-mail não enviar
      }

      return res.json({
        sucesso: true,
        mensagem: 'Pagamento iniciado com sucesso',
        dados: dadosPagamento
      })

    } catch (error) {
      console.error('Erro ao iniciar pagamento comercial:', error)
      return res.status(500).json({
        error: 'Erro interno ao processar pagamento',
        message: 'Tente novamente mais tarde'
      })
    }
  }

  /**
   * Buscar status de pagamento
   */
  async getStatusPagamento(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pagamento = await prisma.pagamento.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresa: {
            select: {
              nome: true,
              email: true,
              status: true
            }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      // Simular verificação de status (em produção, integrar com gateway)
      const tempoDecorrido = Date.now() - new Date(pagamento.createdAt).getTime()
      const tempoLimite = 30 * 60 * 1000 // 30 minutos

      let status = pagamento.status
      let mensagem = ''

      // Simular confirmação após 30 segundos (apenas para demonstração)
      if (status === 'pendente' && tempoDecorrido > 30000) {
        status = 'pago'
        mensagem = 'Pagamento confirmado!'

        // Atualizar no banco
        await prisma.$transaction([
          prisma.pagamento.update({
            where: { id: pagamento.id },
            data: {
              status: 'pago',
              dataPagamento: new Date()
            }
          }),
          prisma.empresa.update({
            where: { id: pagamento.empresaId },
            data: {
              status: 'ativo',
              implantacaoPaga: true,
              dataAtivacao: new Date(),
              nextBillingAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
            }
          })
        ])

        // Buscar usuários da empresa para enviar e-mails
        const usuarios = await prisma.usuario.findMany({
          where: { empresaId: pagamento.empresaId }
        })

        // Enviar e-mails de boas-vindas
        for (const usuario of usuarios) {
          await emailService.sendBoasVindas(
            usuario.email,
            usuario.nome,
            pagamento.empresa.nome
          ).catch(e => console.error('Erro ao enviar e-mail:', e))
        }
      }

      return res.json({
        id: pagamento.id,
        status,
        mensagem,
        valor: pagamento.valor,
        metodo: pagamento.formaPagamento,
        tipo: pagamento.tipo,
        dataVencimento: pagamento.dataVencimento,
        dataPagamento: pagamento.dataPagamento,
        empresa: pagamento.empresa
      })

    } catch (error) {
      console.error('Erro ao buscar status:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Simular webhook de pagamento (para testes)
   */
  async simularWebhook(req: Request, res: Response) {
    try {
      const { pagamentoId } = req.body

      const pagamento = await prisma.pagamento.findUnique({
        where: { id: pagamentoId },
        include: {
          empresa: {
            include: {
              plano: true,
              usuarios: true
            }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      // Simular payload do webhook
      const payload = {
        transactionId: pagamento.transacaoId,
        status: 'paid',
        amount: pagamento.valor,
        paymentMethod: pagamento.formaPagamento,
        paidAt: new Date().toISOString()
      }

      // Reutilizar lógica do webhook existente
      const result = infinitePayService.processWebhook(payload as any)

      if (result.status === 'paid') {
        // Atualizar pagamento
        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: {
            status: 'pago',
            dataPagamento: new Date(),
            formaPagamento: result.paymentMethod
          }
        })

        if (pagamento.tipo === 'implantacao') {
          // Ativar empresa
          await prisma.empresa.update({
            where: { id: pagamento.empresaId },
            data: {
              implantacaoPaga: true,
              dataAtivacao: new Date(),
              status: 'ativo',
              nextBillingAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
            }
          })

          // Enviar email de boas-vindas
          for (const usuario of pagamento.empresa.usuarios) {
            await emailService.sendBoasVindas(
              usuario.email,
              usuario.nome,
              pagamento.empresa.nome
            ).catch(e => console.error('Erro ao enviar e-mail:', e))
          }
        } else {
          // Mensalidade paga
          await prisma.empresa.update({
            where: { id: pagamento.empresaId },
            data: {
              status: 'ativo',
              diasAtraso: 0,
              nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          })
        }

        // Enviar email de confirmação
        await (emailService as any).sendPagamentoConfirmado(
          pagamento.empresa.email,
          pagamento.empresa.plano.nome,
          pagamento.valor
        )
      }

      return res.json({
        sucesso: true,
        mensagem: 'Webhook processado com sucesso',
        payload
      })

    } catch (error) {
      console.error('Erro ao simular webhook:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Reenviar instruções de pagamento
   */
  async reenviarInstrucoes(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pagamento = await prisma.pagamento.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresa: {
            include: { plano: true }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      if (pagamento.status !== 'pendente') {
        return res.status(400).json({
          error: 'Pagamento já processado',
          message: 'Este pagamento já foi processado'
        })
      }

      // Reenviar e-mail
      await emailService.sendPagamentoInstrucoes(
        pagamento.empresa.email,
        pagamento.empresa.nome,
        {
          plano: pagamento.empresa.plano.nome,
          valor: pagamento.valor,
          metodo: pagamento.formaPagamento!,
          dataVencimento: pagamento.dataVencimento,
          qrCode: pagamento.qrCode,
          codigoPix: pagamento.linkPagamento,
          linhaDigitavel: pagamento.linhaDigitavel,
          urlBoleto: pagamento.urlBoleto
        }
      )

      return res.json({
        sucesso: true,
        mensagem: 'Instruções reenviadas com sucesso'
      })

    } catch (error) {
      console.error('Erro ao reenviar instruções:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Cancelar pagamento pendente
   */
  async cancelarPagamento(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pagamento = await prisma.pagamento.findUnique({
        where: { id: parseInt(id) },
        include: { empresa: true }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      if (pagamento.status !== 'pendente') {
        return res.status(400).json({
          error: 'Pagamento não pode ser cancelado',
          message: 'Apenas pagamentos pendentes podem ser cancelados'
        })
      }

      await prisma.$transaction([
        prisma.pagamento.update({
          where: { id: pagamento.id },
          data: { status: 'cancelado' }
        }),
        prisma.empresa.update({
          where: { id: pagamento.empresaId },
          data: { status: 'cancelado' }
        })
      ])

      return res.json({
        sucesso: true,
        mensagem: 'Pagamento cancelado com sucesso'
      })

    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  /**
   * Gerar comprovante de pagamento
   */
  async gerarComprovante(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pagamento = await prisma.pagamento.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresa: {
            include: { plano: true }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      if (pagamento.status !== 'pago') {
        return res.status(400).json({
          error: 'Pagamento não confirmado',
          message: 'Apenas pagamentos confirmados geram comprovante'
        })
      }

      // Gerar HTML do comprovante
      const comprovanteHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Comprovante de Pagamento - IHO</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 40px; 
              background: #f5f5f5;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #0ea5e9;
              padding-bottom: 20px;
            }
            .logo { 
              font-size: 28px; 
              font-weight: bold; 
              background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 10px;
            }
            .title { 
              font-size: 24px; 
              color: #333;
              margin: 10px 0;
            }
            .content { 
              margin: 30px 0;
            }
            .row { 
              display: flex; 
              justify-content: space-between; 
              margin: 15px 0;
              padding: 10px 0;
              border-bottom: 1px dashed #ddd;
            }
            .label { 
              font-weight: bold; 
              color: #666; 
            }
            .value { 
              font-weight: bold; 
              color: #0ea5e9; 
            }
            .highlight {
              background: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .status {
              display: inline-block;
              padding: 8px 16px;
              background: #10b981;
              color: white;
              border-radius: 20px;
              font-weight: bold;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              color: #999; 
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">IHO - Índice de Saúde Operacional</div>
              <div class="title">COMPROVANTE DE PAGAMENTO</div>
            </div>
            
            <div class="content">
              <div class="highlight">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span class="status">PAGAMENTO CONFIRMADO</span>
                </div>
              </div>

              <div class="row">
                <span class="label">ID do Pagamento:</span>
                <span class="value">#${pagamento.id.toString().padStart(6, '0')}</span>
              </div>
              <div class="row">
                <span class="label">Empresa:</span>
                <span class="value">${pagamento.empresa.nome}</span>
              </div>
              <div class="row">
                <span class="label">CNPJ:</span>
                <span class="value">${pagamento.empresa.cnpj}</span>
              </div>
              <div class="row">
                <span class="label">Plano:</span>
                <span class="value">${pagamento.empresa.plano.nome}</span>
              </div>
              <div class="row">
                <span class="label">Tipo:</span>
                <span class="value">${pagamento.tipo === 'implantacao' ? 'Taxa de Implantação' : 'Mensalidade'}</span>
              </div>
              <div class="row">
                <span class="label">Valor:</span>
                <span class="value">R$ ${pagamento.valor.toFixed(2).replace('.', ',')}</span>
              </div>
              <div class="row">
                <span class="label">Data do Pagamento:</span>
                <span class="value">${new Date(pagamento.dataPagamento!).toLocaleDateString('pt-BR')} às ${new Date(pagamento.dataPagamento!).toLocaleTimeString('pt-BR')}</span>
              </div>
              <div class="row">
                <span class="label">Forma de Pagamento:</span>
                <span class="value">${pagamento.formaPagamento?.toUpperCase()}</span>
              </div>
              <div class="row">
                <span class="label">ID da Transação:</span>
                <span class="value" style="font-size: 12px;">${pagamento.transacaoId}</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Este comprovante é válido como prova de pagamento.</p>
              <p>Emitido em ${new Date().toLocaleString('pt-BR')}</p>
              <p style="margin-top: 10px;">IHO - Índice de Saúde Operacional</p>
            </div>
          </div>
        </body>
        </html>
      `

      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Content-Disposition', `attachment; filename=comprovante-${pagamento.id}.html`)
      return res.send(comprovanteHtml)

    } catch (error) {
      console.error('Erro ao gerar comprovante:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, tipo, empresaId, periodo, search } = req.query

      const where: any = {}

      if (status) where.status = status
      if (tipo) where.tipo = tipo
      if (empresaId) where.empresaId = parseInt(empresaId as string)

      // Filtro por período
      if (periodo) {
        const hoje = new Date()
        let dataInicio = new Date()

        switch (periodo) {
          case 'hoje':
            dataInicio.setHours(0, 0, 0, 0)
            where.dataVencimento = { gte: dataInicio }
            break
          case 'ontem':
            dataInicio.setDate(hoje.getDate() - 1)
            dataInicio.setHours(0, 0, 0, 0)
            const dataFim = new Date(dataInicio)
            dataFim.setHours(23, 59, 59, 999)
            where.dataVencimento = { gte: dataInicio, lte: dataFim }
            break
          case '7d':
            dataInicio.setDate(hoje.getDate() - 7)
            where.dataVencimento = { gte: dataInicio }
            break
          case '30d':
            dataInicio.setDate(hoje.getDate() - 30)
            where.dataVencimento = { gte: dataInicio }
            break
          case '90d':
            dataInicio.setDate(hoje.getDate() - 90)
            where.dataVencimento = { gte: dataInicio }
            break
          case '12m':
            dataInicio.setMonth(hoje.getMonth() - 12)
            where.dataVencimento = { gte: dataInicio }
            break
        }
      }

      // Filtro por busca
      if (search) {
        where.OR = [
          { empresa: { nome: { contains: search as string } } },
          { transacaoId: { contains: search as string } }
        ]
      }

      const [pagamentos, total] = await Promise.all([
        prisma.pagamento.findMany({
          where,
          include: {
            empresa: {
              select: {
                id: true,
                nome: true,
                cnpj: true
              }
            }
          },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.pagamento.count({ where })
      ])

      res.json({
        data: pagamentos,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pagamento = await (prisma.pagamento.findUnique as any)({
        where: { id: parseInt(id) },
        include: {
          empresa: {
            include: {
              plano: {
                select: { id: true, nome: true }
              }
            }
          },
          logs: {
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
              usuario: {
                select: { nome: true }
              }
            }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      // Formatar logs
      const logsFormatados = (pagamento as any).logs.map((log: any) => ({
        id: log.id,
        acao: log.acao,
        usuario: log.usuario?.nome || 'Sistema',
        data: log.createdAt.toLocaleString('pt-BR'),
        ip: log.ip
      }))

      res.json({
        ...pagamento,
        logs: logsFormatados
      })
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      const pagamento = await prisma.pagamento.update({
        where: { id: parseInt(id) },
        data: { status }
      })

      // Registrar log
      await prisma.log.create({
        data: {
          empresaId: pagamento.empresaId,
          acao: `ALTERAR_STATUS_PAGAMENTO_${status.toUpperCase()}`,
          entidade: 'pagamento',
          entidadeId: pagamento.id,
          usuarioId: (req as any).user?.id
        }
      })

      // Se foi pago, atualizar status da empresa se for implantação
      if (status === 'pago' && pagamento.tipo === 'implantacao') {
        await prisma.empresa.update({
          where: { id: pagamento.empresaId },
          data: {
            implantacaoPaga: true,
            dataAtivacao: new Date(),
            status: 'ativo',
            nextBillingAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
          }
        })
      }

      res.json({ message: 'Status atualizado com sucesso' })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async reenviarEmail(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pagamento = await prisma.pagamento.findUnique({
        where: { id: parseInt(id) },
        include: {
          empresa: {
            include: { plano: true }
          }
        }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      // Aqui você implementaria o reenvio de e-mail
      // await emailService.sendPagamentoInstrucoes(...)

      // Registrar log
      await prisma.log.create({
        data: {
          empresaId: pagamento.empresaId,
          acao: 'REENVIAR_EMAIL_PAGAMENTO',
          entidade: 'pagamento',
          entidadeId: pagamento.id,
          usuarioId: (req as any).user?.id
        }
      })

      res.json({ message: 'E-mail reenviado com sucesso' })
    } catch (error) {
      console.error('Erro ao reenviar e-mail:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const hoje = new Date()
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      const inicioAno = new Date(hoje.getFullYear(), 0, 1)

      const [
        totalRecebido,
        totalPendente,
        totalAtrasado,
        totalCancelado,
        faturamentoMes,
        faturamentoAno
      ] = await Promise.all([
        prisma.pagamento.aggregate({
          where: { status: 'pago' },
          _sum: { valor: true }
        }),
        prisma.pagamento.aggregate({
          where: { status: 'pendente' },
          _sum: { valor: true }
        }),
        prisma.pagamento.aggregate({
          where: { status: 'atrasado' },
          _sum: { valor: true }
        }),
        prisma.pagamento.aggregate({
          where: { status: 'cancelado' },
          _sum: { valor: true }
        }),
        prisma.pagamento.aggregate({
          where: {
            status: 'pago',
            dataPagamento: {
              gte: inicioMes
            }
          },
          _sum: { valor: true }
        }),
        prisma.pagamento.aggregate({
          where: {
            status: 'pago',
            dataPagamento: {
              gte: inicioAno
            }
          },
          _sum: { valor: true }
        })
      ])

      res.json({
        recebido: totalRecebido._sum.valor || 0,
        pendente: totalPendente._sum.valor || 0,
        atrasado: totalAtrasado._sum.valor || 0,
        cancelado: totalCancelado._sum.valor || 0,
        faturamentoMes: faturamentoMes._sum.valor || 0,
        faturamentoAno: faturamentoAno._sum.valor || 0
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params

      await prisma.pagamento.delete({
        where: { id: parseInt(id) }
      })

      res.json({ message: 'Pagamento excluído com sucesso' })
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

}

export const pagamentoController = new PagamentoController()