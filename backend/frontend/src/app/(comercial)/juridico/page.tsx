'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Shield,
  Cookie,
  Scale,
  Lock,
  Eye,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Users,
  Globe,
  HardDrive,
  Server,
  Mail,
  Phone,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'

export default function JuridicoPage() {
  const documentos = [
    {
      id: 'termos',
      titulo: 'Termos de Uso',
      descricao: 'Condições gerais para utilização do sistema IHO',
      icon: <FileText className="h-8 w-8" />,
      href: '/juridico/termos',
      cor: 'from-blue-500 to-cyan-500',
      atualizacao: '15/01/2024',
      versao: '2.0.1'
    },
    {
      id: 'privacidade',
      titulo: 'Política de Privacidade',
      descricao: 'Como coletamos, usamos e protegemos seus dados',
      icon: <Shield className="h-8 w-8" />,
      href: '/juridico/privacidade',
      cor: 'from-purple-500 to-pink-500',
      atualizacao: '15/01/2024',
      versao: '2.0.1'
    },
    {
      id: 'cookies',
      titulo: 'Política de Cookies',
      descricao: 'Informações sobre o uso de cookies no site',
      icon: <Cookie className="h-8 w-8" />,
      href: '/juridico/cookies',
      cor: 'from-orange-500 to-red-500',
      atualizacao: '15/01/2024',
      versao: '1.2.0'
    }
  ]

  const seguranca = [
    {
      icone: <Lock className="h-5 w-5" />,
      titulo: 'Criptografia SSL',
      descricao: 'Todos os dados são transmitidos com criptografia de ponta a ponta'
    },
    {
      icone: <Eye className="h-5 w-5" />,
      titulo: 'Privacidade dos Dados',
      descricao: 'Seus dados não são compartilhados com terceiros sem autorização'
    },
    {
      icone: <Server className="h-5 w-5" />,
      titulo: 'Servidores Seguros',
      descricao: 'Infraestrutura hospedada em datacenters com certificação ISO 27001'
    },
    {
      icone: <HardDrive className="h-5 w-5" />,
      titulo: 'Backup Diário',
      descricao: 'Backups automáticos diários para garantir a integridade dos dados'
    }
  ]

  const direitos = [
    'Acessar seus dados pessoais',
    'Corrigir dados incompletos ou desatualizados',
    'Solicitar a exclusão dos seus dados',
    'Revogar consentimento a qualquer momento',
    'Exportar seus dados em formato estruturado',
    'Saber com quem compartilhamos seus dados'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <Container size="lg" className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 px-4 py-2">
              <Scale className="h-4 w-4 mr-2" />
              Documentos Legais
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Transparência e
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Conformidade Legal
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Conheça nossos documentos legais e entenda como protegemos seus dados
              e garantimos uma relação transparente com todos os usuários.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Cards de Documentos */}
      <section className="py-12">
        <Container size="lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documentos.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={doc.href}>
                  <Card className="group relative overflow-hidden h-full cursor-pointer hover:shadow-2xl transition-all duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-r ${doc.cor} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    
                    <CardContent className="p-6">
                      <div className={`h-16 w-16 rounded-xl bg-gradient-to-r ${doc.cor} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <div className="h-full w-full rounded-xl bg-background flex items-center justify-center text-white">
                          {doc.icon}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {doc.titulo}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4">
                        {doc.descricao}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Versão {doc.versao}</span>
                        <span>Atualizado em {doc.atualizacao}</span>
                      </div>

                      <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Ler documento</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Seção de Segurança */}
      <section className="py-20 bg-muted/30">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Segurança e Proteção
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Seus dados estão seguros conosco
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Implementamos as melhores práticas de segurança para proteger suas informações
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seguranca.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                      {item.icone}
                    </div>
                    <h3 className="font-semibold mb-2">{item.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{item.descricao}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Seção de Direitos */}
      <section className="py-20">
        <Container size="lg">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Seus Direitos
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Você tem controle sobre
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  seus dados pessoais
                </span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6">
                De acordo com a LGPD (Lei Geral de Proteção de Dados), garantimos a você:
              </p>

              <div className="space-y-3">
                {direitos.map((direito, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{direito}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-0">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <HelpCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Dúvidas sobre seus dados?</h3>
                      <p className="text-sm text-muted-foreground">Entre em contato com nosso DPO</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href="contato@sqtecnologiadainformacao.com" className="hover:text-primary transition-colors">
                        contato@sqtecnologiadainformacao.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <a href="https://wa.me/5571982607352" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        (71) 98260-7352
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-primary" />
                      <span>www.iho.com.br/dpo</span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <p className="text-xs text-muted-foreground">
                    Nosso Encarregado de Proteção de Dados (DPO) está disponível para
                    esclarecer qualquer dúvida sobre o tratamento das suas informações.
                  </p>
                </CardContent>
              </Card>

              {/* Elementos decorativos */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Compromisso com a transparência
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Estamos sempre atualizando nossos documentos para garantir a melhor
              experiência e segurança para você
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contato">
                <Button size="lg" variant="secondary" className="group">
                  Fale conosco
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/planos">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Conheça nossos planos
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}