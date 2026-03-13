'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Target,
  Award,
  Globe,
  Lock,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Wrench,
  Truck,
  Building2,
  DollarSign,
  FileText,
  CheckCircle,
  ChevronRight,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'

export default function ComercialPage() {
  const { scrollYProgress } = useScroll()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Dashboard Inteligente',
      description: 'Visualize todos os indicadores em tempo real com gráficos interativos e personalizáveis.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1,
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: 'IHO - Índice de Saúde',
      description: 'Acompanhe a saúde operacional dos seus equipamentos com nosso índice exclusivo.',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.2,
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: 'Manutenção Preditiva',
      description: 'Antecipe problemas com análises preditivas e evite paradas não programadas.',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.3,
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'Gestão de Equipamentos',
      description: 'Controle completo do ciclo de vida dos seus equipamentos com histórico detalhado.',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.4,
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Análise Financeira',
      description: 'Acompanhe custos, depreciação e ROI em tempo real com dashboards financeiros.',
      gradient: 'from-yellow-500 to-amber-500',
      delay: 0.5,
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Relatórios Automáticos',
      description: 'Gere relatórios gerenciais automaticamente com visualizações profissionais.',
      gradient: 'from-indigo-500 to-blue-500',
      delay: 0.6,
    },
  ]

  const stats = [
    { value: '98%', label: 'Satisfação', icon: <Award className="h-5 w-5" /> },
    { value: '50+', label: 'Empresas', icon: <Building2 className="h-5 w-5" /> },
    { value: '10x', label: 'Eficiência', icon: <Zap className="h-5 w-5" /> },
    { value: '24/7', label: 'Suporte', icon: <Clock className="h-5 w-5" /> },
  ]

  const plans = [
    {
      name: 'Start',
      price: '750',
      implantacao: '3.000',
      users: '1 ADM + 2 Controladores + 2 Apontadores',
      equipments: '25 equipamentos',
      features: [
        'Dashboard completo',
        'Gestão de obras',
        'Gestão de equipamentos',
        'Manutenção preventiva',
        'Indicadores básicos',
        'Relatórios simples',
      ],
      gradient: 'from-blue-500 to-cyan-500',
      popular: false,
    },
    {
      name: 'Growth',
      price: '1.400',
      implantacao: '3.000',
      users: '1 ADM + 5 Controladores + 5 Apontadores',
      equipments: '50 equipamentos',
      features: [
        'Tudo do Start',
        'Manutenção preditiva',
        'Indicadores avançados',
        'Análise financeira',
        'Relatórios gerenciais',
        'API de integração',
      ],
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
    },
    {
      name: 'Pro',
      price: '2.080',
      implantacao: '3.000',
      users: '1 ADM + 10 Controladores + 10 Apontadores',
      equipments: '80 equipamentos',
      features: [
        'Tudo do Growth',
        'Almoxarifado',
        'Centros de custo',
        'Previsão de demanda',
        'Alertas inteligentes',
        'Suporte prioritário',
      ],
      gradient: 'from-orange-500 to-red-500',
      popular: false,
    },
    {
      name: 'Enterprise',
      price: '3.600',
      implantacao: '3.000',
      users: '1 ADM + 15 Controladores + 15 Apontadores',
      equipments: '150 equipamentos',
      features: [
        'Tudo do Pro',
        'Múltiplas obras',
        'Business intelligence',
        'Customização avançada',
        'SLA garantido',
        'Gerente de conta dedicado',
      ],
      gradient: 'from-purple-600 to-pink-600',
      popular: false,
    },
  ]

  const faqItems = [
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Partículas animadas */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/30"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                scale: Math.random() * 2,
              }}
              animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                transition: {
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
          ))}
        </div>

        <Container size="lg" className="relative z-10">
          <motion.div
            style={{ opacity, scale }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge de novidade */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <Badge className="px-4 py-2 text-sm bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
                  Transforme sua operação
                </span>
              </Badge>
            </motion.div>

            {/* Título principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                IHO
              </span>
              <br />
              <span className="text-foreground">Índice de Saúde</span>
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Operacional
              </span>
            </motion.h1>

            {/* Descrição */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              A plataforma definitiva para gestão de equipamentos e saúde operacional.
              <span className="block mt-2 text-lg opacity-80">
                Monitore, controle e otimize sua frota com inteligência artificial e dados em tempo real.
              </span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/planos">
                <Button size="lg" className="group relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center">
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline" className="group">
                  Falar com especialista
                  <Zap className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Container>

        {/* Scroll indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => scrollToSection('features')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </motion.button>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Por que escolher o IHO?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Uma plataforma completa para
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                gestão de equipamentos
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo o que você precisa para otimizar sua operação em um só lugar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -5 }}
              >
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-b from-card to-card/50 backdrop-blur h-full">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${feature.gradient} p-0.5 mb-4`}>
                      <div className="h-full w-full rounded-xl bg-background flex items-center justify-center text-white">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>

                    <div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Saiba mais</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-32 bg-muted/30">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2">
              <Target className="h-4 w-4 mr-2" />
              Planos e Preços
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha o plano ideal para
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                sua operação
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Taxa única de implantação de R$ 3.000 em até 10x sem juros
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="px-4 py-1 bg-gradient-to-r from-primary to-accent text-white border-0 whitespace-nowrap">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <Card className={cn(
                  "relative overflow-hidden border-0 bg-gradient-to-b from-card to-card/50 backdrop-blur h-full",
                  plan.popular && "scale-105 border-2 border-primary/20 shadow-2xl"
                )}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <CardContent className="p-6">
                    <h3 className={`text-2xl font-bold mb-2 bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                      <div className="text-sm text-muted-foreground mt-1">
                        + R$ {plan.implantacao} implantação
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span>{plan.users}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Truck className="h-4 w-4 mr-2 text-primary" />
                        <span>Até {plan.equipments}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/checkout">
                      <Button 
                        className={cn(
                          "w-full group relative overflow-hidden",
                          plan.popular ? "bg-gradient-to-r from-primary to-accent" : ""
                        )}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        <span className="relative flex items-center justify-center">
                          Contratar agora
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-sm text-muted-foreground">
              * Todos os planos incluem suporte técnico e atualizações do sistema
            </p>
          </motion.div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Perguntas Frequentes
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tire suas dúvidas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encontre respostas para as perguntas mais comuns sobre o IHO
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                    <p className="text-muted-foreground text-sm">{item.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-90" />
        
        <Container size="lg" className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para transformar sua operação?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Comece hoje mesmo e descubra como o IHO pode revolucionar a gestão da sua frota
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/planos">
                <Button size="lg" variant="secondary" className="group">
                  Ver planos
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Falar com consultor
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  )
}