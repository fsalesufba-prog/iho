import { transporter, emailConfig, emailTemplates } from '../config/email'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  attachments?: any[]
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments
      })
      return true
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return false
    }
  }

  async sendBoasVindas(to: string, nome: string, empresa: string): Promise<boolean> {
    const template = emailTemplates.boasVindas(nome, empresa)
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html
    })
  }

  async sendPagamentoConfirmado(to: string, plano: string, valor: number): Promise<boolean> {
    const template = emailTemplates.pagamentoConfirmado(plano, valor)
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html
    })
  }

  async sendAssinaturaCancelada(to: string): Promise<boolean> {
    const template = emailTemplates.assinaturaCancelada()
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html
    })
  }

  async sendAtrasoPagamento(to: string, dias: number): Promise<boolean> {
    const template = emailTemplates.atrasoPagamento(dias)
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html
    })
  }

  async sendRecuperacaoSenha(to: string, token: string): Promise<boolean> {
    const template = emailTemplates.recuperacaoSenha(token)
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html
    })
  }
  /**
   * Enviar instruções de pagamento
   */
  async sendPagamentoInstrucoes(
    to: string,
    nome: string,
    dados: {
      plano: string
      valor: number
      metodo: string
      dataVencimento: Date
      qrCode?: string
      codigoPix?: string
      linhaDigitavel?: string
      urlBoleto?: string
    }
  ): Promise<boolean> {
    let html = ''
    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valor)
    const dataVencimento = dados.dataVencimento.toLocaleDateString('pt-BR')

    if (dados.metodo === 'pix') {
      html = `
        <h1>Olá ${nome}!</h1>
        <p>Seu pedido foi recebido com sucesso. Aguardamos a confirmação do pagamento via PIX.</p>
        
        <h2>Detalhes do pedido:</h2>
        <ul>
          <li><strong>Plano:</strong> ${dados.plano}</li>
          <li><strong>Valor:</strong> ${valorFormatado}</li>
          <li><strong>Vencimento:</strong> ${dataVencimento}</li>
        </ul>

        <h2>Instruções para pagamento:</h2>
        <p>1. Abra o aplicativo do seu banco</p>
        <p>2. Escolha a opção PIX</p>
        <p>3. Escaneie o QR Code abaixo ou copie o código PIX</p>
        
        ${dados.qrCode ? `<img src="${dados.qrCode}" alt="QR Code PIX" style="margin: 20px 0;" />` : ''}
        
        ${dados.codigoPix ? `
          <p><strong>Código PIX:</strong></p>
          <p style="background: #f5f5f5; padding: 10px; font-family: monospace; word-break: break-all;">
            ${dados.codigoPix}
          </p>
        ` : ''}
      `
    } else if (dados.metodo === 'boleto') {
      html = `
        <h1>Olá ${nome}!</h1>
        <p>Seu pedido foi recebido com sucesso. Aguardamos a confirmação do pagamento do boleto.</p>
        
        <h2>Detalhes do pedido:</h2>
        <ul>
          <li><strong>Plano:</strong> ${dados.plano}</li>
          <li><strong>Valor:</strong> ${valorFormatado}</li>
          <li><strong>Vencimento:</strong> ${dataVencimento}</li>
        </ul>

        <h2>Instruções para pagamento:</h2>
        <p>1. Utilize a linha digitável abaixo para pagar em seu internet banking</p>
        <p>2. Ou clique no link para visualizar/baixar o boleto</p>
        
        ${dados.linhaDigitavel ? `
          <p><strong>Linha digitável:</strong></p>
          <p style="background: #f5f5f5; padding: 10px; font-family: monospace; font-size: 18px; letter-spacing: 2px;">
            ${dados.linhaDigitavel}
          </p>
        ` : ''}
        
        ${dados.urlBoleto ? `
          <p style="margin-top: 20px;">
            <a href="${dados.urlBoleto}" style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Visualizar Boleto
            </a>
          </p>
        ` : ''}
      `
    } else {
      html = `
        <h1>Olá ${nome}!</h1>
        <p>Seu pedido foi recebido com sucesso. Aguardamos a confirmação do pagamento com cartão.</p>
        
        <h2>Detalhes do pedido:</h2>
        <ul>
          <li><strong>Plano:</strong> ${dados.plano}</li>
          <li><strong>Valor:</strong> ${valorFormatado}</li>
          <li><strong>Vencimento:</strong> ${dataVencimento}</li>
        </ul>

        <p>Após a confirmação do pagamento, você receberá um e-mail com os dados de acesso ao sistema.</p>
      `
    }

    html += `
      <p style="margin-top: 30px;">Atenciosamente,<br>Equipe IHO</p>
      <hr />
      <p style="font-size: 12px; color: #666;">
        Em caso de dúvidas, entre em contato conosco respondendo este e-mail ou através do nosso suporte.
      </p>
    `

    return this.sendEmail({
      to,
      subject: `Instruções de pagamento - IHO`,
      html
    })
  }

  /**
   * Enviar confirmação de pagamento
   */
  async sendPagamentoConfirmado(
    to: string,
    nome: string,
    dados: {
      plano: string
      valor: number
      dataPagamento: Date
    }
  ): Promise<boolean> {
    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valor)
    const dataPagamento = dados.dataPagamento.toLocaleDateString('pt-BR')

    const html = `
      <h1>Olá ${nome}!</h1>
      <p>Seu pagamento foi confirmado com sucesso! 🎉</p>
      
      <h2>Detalhes do pagamento:</h2>
      <ul>
        <li><strong>Plano:</strong> ${dados.plano}</li>
        <li><strong>Valor:</strong> ${valorFormatado}</li>
        <li><strong>Data do pagamento:</strong> ${dataPagamento}</li>
      </ul>

      <h2>Próximos passos:</h2>
      <p>1. Acesse o sistema com seu e-mail e senha</p>
      <p>2. Complete o cadastro da sua empresa</p>
      <p>3. Comece a utilizar todas as funcionalidades</p>

      <p style="margin-top: 30px;">
        <a href="https://iho.sqtecnologiadainformacao.com/login" 
           style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Acessar o sistema
        </a>
      </p>

      <p style="margin-top: 30px;">Atenciosamente,<br>Equipe IHO</p>
    `

    return this.sendEmail({
      to,
      subject: 'Pagamento confirmado - IHO',
      html
    })
  }

  async sendNewsletterWelcome(to: string, nome?: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Bem-vindo à newsletter IHO',
      html: `<h1>Olá${nome ? ` ${nome}` : ''}!</h1><p>Obrigado por assinar a newsletter da IHO. Você receberá novidades, dicas e atualizações do sistema.</p><p>Atenciosamente,<br>Equipe IHO</p>`
    })
  }

  async sendContactEmail(dados: { nome: string; email: string; telefone?: string; empresa?: string; mensagem: string }): Promise<boolean> {
    return this.sendEmail({
      to: process.env.EMAIL_FROM || 'contato@iho.com.br',
      subject: `Novo contato de ${dados.nome}`,
      html: `<h2>Novo contato recebido</h2><p><strong>Nome:</strong> ${dados.nome}</p><p><strong>E-mail:</strong> ${dados.email}</p>${dados.telefone ? `<p><strong>Telefone:</strong> ${dados.telefone}</p>` : ''}${dados.empresa ? `<p><strong>Empresa:</strong> ${dados.empresa}</p>` : ''}<p><strong>Mensagem:</strong></p><p>${dados.mensagem}</p>`
    })
  }

  async sendContactConfirmation(to: string, nome: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Recebemos seu contato - IHO',
      html: `<h1>Olá ${nome}!</h1><p>Recebemos sua mensagem e entraremos em contato em breve.</p><p>Atenciosamente,<br>Equipe IHO</p>`
    })
  }

  async sendEmpresaCriada(to: string, nomeEmpresa: string, nomePlano: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Empresa cadastrada com sucesso - IHO',
      html: `<h1>Empresa cadastrada!</h1><p>A empresa <strong>${nomeEmpresa}</strong> foi cadastrada com sucesso no plano <strong>${nomePlano}</strong>.</p><p>Acesse o sistema para começar a configurar seu ambiente.</p><p>Atenciosamente,<br>Equipe IHO</p>`
    })
  }

  async enviarAlerta(to: string, titulo: string, descricao: string, gravidade: string): Promise<boolean> {
    const cores: Record<string, string> = { alta: '#dc2626', media: '#d97706', baixa: '#2563eb' }
    const cor = cores[gravidade] || '#2563eb'
    return this.sendEmail({
      to,
      subject: `[Alerta ${gravidade.toUpperCase()}] ${titulo} - IHO`,
      html: `<div style="border-left: 4px solid ${cor}; padding: 10px 20px;"><h2 style="color:${cor}">${titulo}</h2><p>${descricao}</p></div><p style="margin-top:20px">Acesse o sistema para mais detalhes.</p><p>Atenciosamente,<br>Equipe IHO</p>`
    })
  }

}

export const emailService = new EmailService()