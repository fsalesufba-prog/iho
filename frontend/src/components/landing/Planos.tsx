'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, HelpCircle } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface Plano {
  id: number
  nome: string
  descricao: string
  valorImplantacao: number
  valorMensal: number
  limiteAdm: number
  limiteControlador: number
  limiteApontador: number
  limiteEquipamentos: number
  recursos: string[]
}

export function Planos() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPlanos()
  }, [])

  const carregarPlanos = async () => {
    try {
      const response = await api.get('/planos', {
        params: { limit: 100 }
      })
      setPlanos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <section className="py-20">
        <Container size="lg">
          <div className="text-center">Carregando planos...</div>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-20">
      <Container size="lg">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos e Preços</h2>
          <p className="text-xl text-muted-foreground">
            Escolha o plano ideal para sua operação
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Taxa única de implantação de {formatCurrency(3000)} em até 10x sem juros
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {planos.map((plano) => (
            <Card
              key={plano.id}
              className="relative flex flex-col h-full"
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plano.nome}</CardTitle>
                <CardDescription>{plano.descricao}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                <div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(plano.valorMensal)}
                    <span className="text-sm font-normal text-muted-foreground ml-2">/mês</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Limites</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{plano.limiteAdm} administrador</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{plano.limiteControlador} controladores</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{plano.limiteApontador} apontadores</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Até {plano.limiteEquipamentos} equipamentos</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recursos</h4>
                    <ul className="space-y-2 text-sm">
                      {JSON.parse(plano.recursos as any).map((recurso: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>{recurso}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Link href="/checkout" className="w-full">
                  <Button className="w-full" variant="outline">
                    Contratar
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            * Todos os planos incluem suporte técnico e atualizações do sistema.
            Pagamento da implantação pode ser parcelado em até 10x no cartão.
          </p>
        </div>
      </Container>
    </section>
  )
}