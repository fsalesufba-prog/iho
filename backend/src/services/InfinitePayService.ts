import axios from 'axios'
import { infinitePayConfig, paymentPlans } from '../config/infinitepay'

interface CreatePaymentLinkParams {
  orderId: string
  amount: number
  description: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  installments?: number
  paymentTypes?: string[]
  redirectUrl?: string
}

interface PaymentLinkResponse {
  url: string
  id: string
}

interface WebhookPayload {
  invoice_slug: string
  amount: number
  paid_amount: number
  capture_method: string
  transaction_nsu: string
  order_nsu: string
  paid_at: string
  payment_type: string
  installments?: number
  card_last_digits?: string
}

interface PixPaymentParams {
  valor: number
  descricao: string
  empresaId: number
  customerName?: string
  customerCpf?: string
}

interface BoletoPaymentParams {
  valor: number
  descricao: string
  empresaId: number
  dadosEmpresa: {
    nome: string
    cnpj: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
  }
}

export class InfinitePayService {
  private handle: string
  private apiUrl: string
  private webhookSecret: string

  constructor() {
    this.handle = infinitePayConfig.handle
    this.apiUrl = infinitePayConfig.apiUrl
    this.webhookSecret = infinitePayConfig.webhookSecret
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse> {
    try {
      const appUrl = process.env.APP_URL || 'https://iho.sqtecnologiadainformacao.com'

      const payload: any = {
        handle: this.handle,
        order_nsu: params.orderId,
        items: [
          {
            quantity: 1,
            price: params.amount,
            description: params.description
          }
        ],
        redirect_url: params.redirectUrl || `${appUrl}/pagamento/${params.orderId}`,
        webhook_url: `${appUrl}/api/pagamentos/webhook`
      }

      const response = await axios.post(`${this.apiUrl}/invoices/public/checkout/links`, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      })

      return {
        url: response.data.url,
        id: response.data.id || params.orderId
      }
    } catch (error: any) {
      const detail = error?.response?.data ? JSON.stringify(error.response.data) : error?.message
      console.error('Erro ao criar link de pagamento InfinitePay:', detail)
      throw new Error(`Falha ao gerar link de pagamento: ${detail}`)
    }
  }

  async createImplantacaoLink(empresaId: number, empresaNome: string, planoNome: string): Promise<PaymentLinkResponse> {
    const orderId = `IMP-${empresaId}-${Date.now()}`
    
    return this.createPaymentLink({
      orderId,
      amount: paymentPlans.implantacao.priceInCents,
      description: `Implantação IHO - Plano ${planoNome} - ${empresaNome}`,
      installments: 10,
      paymentTypes: ['credit_card', 'pix']
    })
  }

  async createMensalidadeLink(empresaId: number, empresaNome: string, planoId: string): Promise<PaymentLinkResponse> {
    const planoMap: Record<string, number> = {
      'Start': paymentPlans.mensalidade.start.priceInCents,
      'Growth': paymentPlans.mensalidade.growth.priceInCents,
      'Pro': paymentPlans.mensalidade.pro.priceInCents,
      'Enterprise': paymentPlans.mensalidade.enterprise.priceInCents
    }

    const amount = planoMap[planoId] || paymentPlans.mensalidade.start.priceInCents
    const orderId = `MENS-${empresaId}-${Date.now()}`

    return this.createPaymentLink({
      orderId,
      amount,
      description: `Mensalidade IHO - Plano ${planoId} - ${empresaNome}`,
      installments: 1,
      paymentTypes: ['credit_card']
    })
  }

  /**
   * Criar pagamento PIX
   */
  async createPixPayment(params: PixPaymentParams): Promise<{
    qrCode: string
    qrCodeImage: string
    expirationDate: Date
  }> {
    try {
      // Simular criação de PIX
      // Em produção, integrar com API da InfinitePay
      const transacaoId = `PIX-${params.empresaId}-${Date.now()}`
      
      return {
        qrCode: `00020126580014BR.GOV.BCB.PIX0136${transacaoId}5204000053039865406${params.valor.toFixed(2).replace('.', '')}5802BR5925${params.descricao.substring(0, 25)}6009SaoPaulo62070503***6304E1B5`,
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${transacaoId}`,
        expirationDate: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      }
    } catch (error) {
      console.error('Erro ao criar PIX:', error)
      throw new Error('Falha ao gerar pagamento PIX')
    }
  }

  /**
   * Criar boleto
   */
  async createBoletoPayment(params: BoletoPaymentParams): Promise<{
    linhaDigitavel: string
    url: string
    expirationDate: Date
  }> {
    try {
      // Simular criação de boleto
      // Em produção, integrar com API da InfinitePay
      const transacaoId = `BOL-${params.empresaId}-${Date.now()}`
      const linhaDigitavel = `${transacaoId.substring(0, 5)}.${transacaoId.substring(5, 10)} ${transacaoId.substring(10, 15)}.${transacaoId.substring(15, 20)} ${transacaoId.substring(20, 25)}.${transacaoId.substring(25, 30)} ${transacaoId.substring(30, 35)}`
      
      return {
        linhaDigitavel,
        url: `https://boleto.iho.com.br/${transacaoId}.pdf`,
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      }
    } catch (error) {
      console.error('Erro ao criar boleto:', error)
      throw new Error('Falha ao gerar boleto')
    }
  }

  /**
   * Validar webhook
   */
  async validateWebhook(payload: any): Promise<boolean> {
    try {
      // Validar assinatura do webhook
      // Em produção, verificar com a InfinitePay
      return true
    } catch (error) {
      console.error('Erro ao validar webhook:', error)
      return false
    }
  }

  processWebhook(payload: WebhookPayload): {
    status: 'paid' | 'failed'
    transactionId: string
    orderId: string
    amount: number
    paymentMethod: string
  } {
    // Validar se o pagamento foi confirmado
    if (payload.paid_amount >= payload.amount) {
      return {
        status: 'paid',
        transactionId: payload.transaction_nsu,
        orderId: payload.order_nsu,
        amount: payload.paid_amount,
        paymentMethod: payload.capture_method
      }
    }

    return {
      status: 'failed',
      transactionId: payload.transaction_nsu,
      orderId: payload.order_nsu,
      amount: payload.paid_amount,
      paymentMethod: payload.capture_method
    }
  }
}

export const infinitePayService = new InfinitePayService()