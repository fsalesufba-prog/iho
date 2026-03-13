interface InfinitePayConfig {
  handle: string
  apiUrl: string
  webhookSecret: string
}

export const infinitePayConfig: InfinitePayConfig = {
  handle: process.env.INFINITEPAY_HANDLE || 'fernanda-dos-349',
  apiUrl: process.env.INFINITEPAY_API_URL || 'https://api.infinitepay.io',
  webhookSecret: process.env.INFINITEPAY_WEBHOOK_SECRET || 'iho_webhook_secret_2026'
}

export const paymentPlans = {
  implantacao: {
    description: 'Implatação IHO - Taxa única',
    priceInCents: 300000, // R$ 3.000,00
    maxInstallments: 10,
    interest: 'interest-free' // sem juros
  },
  mensalidade: {
    start: {
      priceInCents: 75000, // R$ 750,00
      description: 'Mensalidade IHO - Plano Start'
    },
    growth: {
      priceInCents: 140000, // R$ 1.400,00
      description: 'Mensalidade IHO - Plano Growth'
    },
    pro: {
      priceInCents: 208000, // R$ 2.080,00
      description: 'Mensalidade IHO - Plano Pro'
    },
    enterprise: {
      priceInCents: 360000, // R$ 3.600,00
      description: 'Mensalidade IHO - Plano Enterprise'
    }
  }
}