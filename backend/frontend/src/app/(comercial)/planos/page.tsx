'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  Users,
  Truck,
  HelpCircle,
  Sparkles,
  Star,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

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
  destaque?: boolean
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [faq, setFaq] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const planosDefault: Plano[] = [
    {
      id: 1,
      nome: 'Starter',
      descricao: 'Ideal para pequenas empresas iniciando na gestão de equipamentos',
      valorImplantacao: 3000,
      valorMensal: 490,
      limiteAdm: 1,
      limiteControlador: 2,
      limiteApontador: 5,
      limiteEquipamentos: 20,
      recursos: ['Dashboard completo', 'Gestão de obras', 'Gestão de equipamentos', 'Indicadores básicos', 'Alertas inteligentes', 'Relatórios simples'],
    },
    {
      id: 2,
      nome: 'Growth',
      descricao: 'Para empresas em crescimento que precisam de mais controle',
      valorImplantacao: 3000,
      valorMensal: 890,
      limiteAdm: 2,
      limiteControlador: 5,
      limiteApontador: 15,
      limiteEquipamentos: 60,
      recursos: ['Dashboard completo', 'Gestão de obras', 'Gestão de equipamentos', 'Manutenção preventiva', 'Indicadores básicos', 'Indicadores avançados', 'Almoxarifado', 'Alertas inteligentes', 'Relatórios simples', 'Relatórios gerenciais'],
    },
    {
      id: 3,
      nome: 'Pro',
      descricao: 'Para operações robustas com necessidades avançadas de análise',
      valorImplantacao: 3000,
      valorMensal: 1490,
      limiteAdm: 5,
      limiteControlador: 10,
      limiteApontador: 40,
      limiteEquipamentos: 150,
      recursos: ['Dashboard completo', 'Gestão de obras', 'Gestão de equipamentos', 'Manutenção preventiva', 'Manutenção preditiva', 'Indicadores básicos', 'Indicadores avançados', 'Análise financeira', 'Almoxarifado', 'Centros de custo', 'Alertas inteligentes', 'Relatórios simples', 'Relatórios gerenciais', 'API de integração', 'Múltiplas obras'],
    },
    {
      id: 4,
      nome: 'Enterprise',
      descricao: 'Solução completa para grandes operações e frotas',
      valorImplantacao: 3000,
      valorMensal: 2490,
      limiteAdm: 10,
      limiteControlador: 30,
      limiteApontador: 100,
      limiteEquipamentos: 500,
      recursos: ['Dashboard completo', 'Gestão de obras', 'Gestão de equipamentos', 'Manutenção preventiva', 'Manutenção preditiva', 'Indicadores básicos', 'Indicadores avançados', 'Análise financeira', 'Almoxarifado', 'Centros de custo', 'Previsão de demanda', 'Alertas inteligentes', 'Relatórios simples', 'Relatórios gerenciais', 'API de integração', 'Suporte prioritário', 'Múltiplas obras', 'Business intelligence', 'Customização avançada', 'SLA garantido', 'Gerente de conta dedicado'],
    },
  ]

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [planosRes, faqRes] = await Promise.all([
        api.get('/comercial/planos'),
        api.get('/comercial/faq')
      ])
      
      const planosData = planosRes.data.data
      setPlanos(planosData && planosData.length > 0 ? planosData : planosDefault)
      setFaq(faqRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setPlanos(planosDefault)
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

  const calcularValorAnual = (mensal: number) => {
    return mensal * 12 * 0.9 // 10% de desconto
  }

  const featuresComparativas = [
    'Dashboard completo',
    'Gestão de obras',
    'Gestão de equipamentos',
    'Manutenção preventiva',
    'Manutenção preditiva',
    'Indicadores básicos',
    'Indicadores avançados',
    'Análise financeira',
    'Almoxarifado',
    'Centros de custo',
    'Previsão de demanda',
    'Alertas inteligentes',
    'Relatórios simples',
    'Relatórios gerenciais',
    'API de integração',
    'Suporte prioritário',
    'Múltiplas obras',
    'Business intelligence',
    'Customização avançada',
    'SLA garantido',
    'Gerente de conta dedicado'
  ]

  const getPlanoFeatures = (plano: Plano): string[] => {
    const recursos = plano.recursos
    if (Array.isArray(recursos)) return recursos
    try {
      return JSON.parse(recursos as any)
    } catch {
      return []
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header da página */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <Container size="lg" className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Planos e Preços
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Escolha o plano ideal para
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                sua operação
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Taxa única de implantação de R$ 3.000 em até 10x sem juros
            </p>

            {/* Toggle mensal/anual */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn(
                "text-sm font-medium transition-colors",
                periodo === 'mensal' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                Mensal
              </span>
              <button
                onClick={() => setPeriodo(periodo === 'mensal' ? 'anual' : 'mensal')}
                className="relative w-14 h-7 rounded-full bg-muted transition-colors"
              >
                <div className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-primary transition-transform",
                  periodo === 'anual' ? 'translate-x-8' : 'translate-x-1'
                )} />
              </button>
              <span className={cn(
                "text-sm font-medium transition-colors",
                periodo === 'anual' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                Anual
                <Badge variant="secondary" className="ml-2">
                  -10%
                </Badge>
              </span>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Lista de Planos */}
      <section className="py-12">
        <Container size="lg">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <Skeleton className="h-10 w-40 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-6" />
                    <div className="space-y-2 mb-6">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {planos.map((plano, index) => {
                const valorExibido = periodo === 'mensal' 
                  ? plano.valorMensal 
                  : calcularValorAnual(plano.valorMensal)

                return (
                  <motion.div
                    key={plano.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="relative"
                    onMouseEnter={() => setSelectedPlan(plano.id)}
                    onMouseLeave={() => setSelectedPlan(null)}
                  >
                    {plano.nome === 'Growth' && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="px-4 py-1 bg-gradient-to-r from-primary to-accent text-white border-0">
                          <Star className="h-3 w-3 mr-1" />
                          Mais Popular
                        </Badge>
                      </div>
                    )}

                    <Card className={cn(
                      "relative overflow-hidden transition-all duration-300 h-full",
                      selectedPlan === plano.id && "shadow-2xl scale-105",
                      plano.nome === 'Enterprise' && "border-2 border-primary/20"
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardContent className="p-6">
                        <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{plano.descricao}</p>
                        
                        <div className="mb-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">
                              {formatCurrency(valorExibido)}
                            </span>
                            <span className="text-muted-foreground">
                              /{periodo === 'mensal' ? 'mês' : 'ano'}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            + {formatCurrency(plano.valorImplantacao)} implantação
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 mr-2 text-primary" />
                            <span>{plano.limiteAdm} ADM</span>
                            <span className="mx-1">•</span>
                            <span>{plano.limiteControlador} Controladores</span>
                            <span className="mx-1">•</span>
                            <span>{plano.limiteApontador} Apontadores</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Truck className="h-4 w-4 mr-2 text-primary" />
                            <span>Até {plano.limiteEquipamentos} equipamentos</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-6">
                          {getPlanoFeatures(plano).map((feature: string, i: number) => (
                            <div key={i} className="flex items-start text-sm">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <Link href={`/checkout?plano=${plano.id}`}>
                          <Button 
                            className="w-full group"
                            variant={plano.nome === 'Growth' ? 'default' : 'outline'}
                          >
                            Contratar agora
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Container>
      </section>

      {/* Tabela Comparativa */}
      <section className="py-20 bg-muted/30">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Compare todos os recursos
            </h2>
            <p className="text-lg text-muted-foreground">
              Veja detalhadamente o que cada plano oferece
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-6 text-left">Recursos</th>
                  {planos.map((plano) => (
                    <th key={plano.id} className="py-4 px-6 text-center min-w-[150px]">
                      <div className="font-bold text-lg">{plano.nome}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featuresComparativas.map((feature, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-6 font-medium">{feature}</td>
                    {planos.map((plano) => {
                      const recursos = getPlanoFeatures(plano)
                      const temFeature = recursos.includes(feature)
                      
                      return (
                        <td key={plano.id} className="py-3 px-6 text-center">
                          {temFeature ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2">
              <HelpCircle className="h-4 w-4 mr-2" />
              Perguntas Frequentes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tire suas dúvidas sobre os planos
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faq.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium">
                    {item.pergunta}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.resposta}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Escolha o plano ideal para sua operação e comece a otimizar sua gestão hoje mesmo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://wa.me/55719982607352?text=Oi,%20quero%20falar%20sobre%20o%20IHO.">
                <Button size="lg" variant="secondary" className="group">
                  Falar com consultor
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Ver demonstração
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}