import nodemailer from 'nodemailer'

export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'contato@sqtecnologiadainformacao.com',
    pass: process.env.SMTP_PASS || 'tyux vfdu bpqy gnfn'
  },
  from: process.env.SMTP_FROM || 'contato@sqtecnologiadainformacao.com',
  fromName: process.env.SMTP_FROM_NAME || 'IHO - Índice de Saúde Operacional'
}

export const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
  tls: {
    rejectUnauthorized: false
  }
})

export const emailTemplates = {
  boasVindas: (nome: string, empresa: string) => ({
    subject: `Bem-vindo ao IHO - ${empresa}`,
    html: `
      <h1>Olá ${nome}!</h1>
      <p>Seu acesso ao sistema IHO foi criado com sucesso.</p>
      <p>Empresa: ${empresa}</p>
      <p>Acesse: https://iho.sqtecnologiadainformacao.com</p>
    `
  }),
  pagamentoConfirmado: (plano: string, valor: number) => ({
    subject: 'Pagamento confirmado - IHO',
    html: `
      <h1>Pagamento confirmado!</h2>
      <p>Plano: ${plano}</p>
      <p>Valor: R$ ${valor.toFixed(2)}</p>
      <p>Seu sistema já está liberado para uso.</p>
    `
  }),
  assinaturaCancelada: () => ({
    subject: 'Assinatura cancelada - IHO',
    html: `
      <h1>Assinatura cancelada</h2>
      <p>Seu plano foi cancelado. O acesso será mantido até o final do período pago.</p>
    `
  }),
  atrasoPagamento: (dias: number) => ({
    subject: 'Pagamento em atraso - IHO',
    html: `
      <h1>Pagamento em atraso</h2>
      <p>Seu pagamento está há ${dias} dias atrasado.</p>
      <p>Regularize para não ter o acesso suspenso.</p>
    `
  }),
  recuperacaoSenha: (token: string) => ({
    subject: 'Recuperação de senha - IHO',
    html: `
      <h1>Recuperação de senha</h2>
      <p>Clique no link para redefinir sua senha:</p>
      <a href="https://iho.sqtecnologiadainformacao.com/resetar-senha/${token}">
        Redefinir senha
      </a>
      <p>Link válido por 1 hora.</p>
    `
  })
}