'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield,
  ChevronLeft,
  Download,
  Printer,
  Calendar,
  Mail,
  Phone,
  Globe,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion'

export default function PrivacidadePage() {
  const secoes = [
    {
      titulo: '1. Introdução',
      conteudo: `A sua privacidade é importante para nós. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza o sistema IHO. Estamos comprometidos em proteger seus dados em conformidade com a Lei Geral de Proteção de Dados (LGPD).`
    },
    {
      titulo: '2. Dados Coletados',
      conteudo: `Podemos coletar os seguintes tipos de informações:`,
      lista: [
        'Dados de identificação: nome, CPF, RG, data de nascimento',
        'Dados de contato: e-mail, telefone, endereço',
        'Dados profissionais: cargo, empresa, CNPJ',
        'Dados de acesso: IP, logs, cookies, navegador',
        'Dados de uso: funcionalidades acessadas, tempo de uso',
        'Dados de pagamento: informações de cartão (processadas por gateway seguro)'
      ]
    },
    {
      titulo: '3. Finalidade do Tratamento',
      conteudo: `Utilizamos seus dados para:`,
      lista: [
        'Fornecer e manter nossos serviços',
        'Processar pagamentos e gerenciar assinaturas',
        'Enviar comunicações sobre o serviço',
        'Personalizar sua experiência',
        'Melhorar nossa plataforma',
        'Cumprir obrigações legais',
        'Prevenir fraudes e garantir segurança'
      ]
    },
    {
      titulo: '4. Compartilhamento de Dados',
      conteudo: `Podemos compartilhar seus dados com:`,
      lista: [
        'Processadores de pagamento (Infinitepay)',
        'Prestadores de serviços de infraestrutura',
        'Autoridades legais, quando exigido por lei',
        'Empresas do grupo, para operações internas'
      ],
      observacao: 'Não vendemos seus dados pessoais para terceiros.'
    },
    {
      titulo: '5. Armazenamento e Segurança',
      conteudo: `Seus dados são armazenados em servidores seguros com criptografia. Implementamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou destruição. Isso inclui:`,
      lista: [
        'Criptografia SSL/TLS em todas as comunicações',
        'Firewalls e sistemas de detecção de intrusão',
        'Controle de acesso rigoroso',
        'Backups diários',
        'Monitoramento 24/7',
        'Auditorias regulares de segurança'
      ]
    },
    {
      titulo: '6. Seus Direitos (LGPD)',
      conteudo: `De acordo com a LGPD, você tem direito a:`,
      lista: [
        'Confirmar a existência de tratamento de dados',
        'Acessar seus dados pessoais',
        'Corrigir dados incompletos ou desatualizados',
        'Solicitar a anonimização ou exclusão',
        'Revogar consentimento a qualquer momento',
        'Solicitar portabilidade dos dados',
        'Ser informado sobre compartilhamento',
        'Opor-se a tratamento irregular'
      ]
    },
    {
      titulo: '7. Cookies e Tecnologias Semelhantes',
      conteudo: `Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar tráfego e personalizar conteúdo. Você pode gerenciar as preferências de cookies através das configurações do seu navegador. Para mais informações, consulte nossa Política de Cookies.`
    },
    {
      titulo: '8. Período de Retenção',
      conteudo: `Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, a menos que um período de retenção mais longo seja exigido por lei. Dados de pagamento são retidos conforme obrigações fiscais.`
    },
    {
      titulo: '9. Transferência Internacional',
      conteudo: `Seus dados podem ser transferidos e processados em países fora do Brasil. Garantimos que todas as transferências cumprem com os requisitos da LGPD e adotamos cláusulas contratuais padrão para proteção adequada.`
    },
    {
      titulo: '10. Encarregado de Dados (DPO)',
      conteudo: `Para questões relacionadas à privacidade e proteção de dados, entre em contato com nossa Encarregada:`,
      contato: {
        nome: 'Fernanda Sales',
        email: 'contato@sqtecnologiadainformacao.com',
        telefone: '(71) 98260-7352',
        endereco: 'Salvador, BA'
      }
    }
  ]

  return (
    <div className="min-h-screen py-12">
      <Container size="lg">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/juridico" className="hover:text-primary transition-colors">
            Jurídico
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-foreground font-medium">Política de Privacidade</span>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Conteúdo</h3>
                  <nav className="space-y-1">
                    {secoes.map((secao, index) => (
                      <a
                        key={index}
                        href={`#secao-${index + 1}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                      >
                        {secao.titulo}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Última atualização: 15/01/2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>LGPD: Lei 13.709/2018</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => window.print()}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => window.print()}>
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href="mailto:contato@sqtecnologiadainformacao.com" className="text-sm hover:text-primary">
                        contato@sqtecnologiadainformacao.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm">(71) 98260-7352</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-sm">www.iho.com.br/dpo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div>
                <Badge className="mb-4 px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Política de Privacidade
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Política de Privacidade
                </h1>
                <p className="text-lg text-muted-foreground">
                  Última atualização: 15 de janeiro de 2024
                </p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead">
                      Sua privacidade é fundamental para nós. Esta Política de Privacidade
                      explica como o IHO coleta, usa, compartilha e protege suas informações
                      pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                    </p>

                    <Accordion type="multiple" className="space-y-4">
                      {secoes.map((secao, index) => (
                        <AccordionItem key={index} value={`item-${index}`} id={`secao-${index + 1}`}>
                          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                            {secao.titulo}
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <p className="text-muted-foreground">{secao.conteudo}</p>
                            {secao.lista && (
                              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                {secao.lista.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            )}
                            {secao.observacao && (
                              <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                                {secao.observacao}
                              </p>
                            )}
                            {secao.contato && (
                              <div className="bg-muted p-4 rounded-lg space-y-2">
                                <p><strong>Nome:</strong> {secao.contato.nome}</p>
                                <p><strong>E-mail:</strong> {secao.contato.email}</p>
                                <p><strong>Telefone:</strong> {secao.contato.telefone}</p>
                                <p><strong>Endereço:</strong> {secao.contato.endereco}</p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    <Separator className="my-8" />

                    <div className="bg-primary/5 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Compromisso com a LGPD
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        O IHO está totalmente comprometido com a proteção de dados e a privacidade
                        de seus usuários. Implementamos todas as medidas técnicas e organizacionais
                        necessárias para garantir a conformidade com a Lei Geral de Proteção de Dados
                        (Lei 13.709/2018) e as melhores práticas internacionais de segurança da informação.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Container>
    </div>
  )
}