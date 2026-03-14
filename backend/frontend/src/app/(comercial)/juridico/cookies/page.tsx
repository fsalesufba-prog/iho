'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Cookie,
  ChevronLeft,
  Download,
  Printer,
  Calendar,
  Settings,
  Info,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion'

export default function CookiesPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essenciais: true,
    analytics: false,
    marketing: false,
    preferencias: false
  })

  const tiposCookies = [
    {
      categoria: 'Essenciais',
      descricao: 'Necessários para o funcionamento básico do site. Não podem ser desativados.',
      exemplos: ['Autenticação', 'Segurança', 'Gerenciamento de sessão'],
      obrigatorio: true
    },
    {
      categoria: 'Analytics',
      descricao: 'Nos ajudam a entender como os visitantes interagem com o site.',
      exemplos: ['Google Analytics', 'Contagem de visitas', 'Páginas mais acessadas'],
      obrigatorio: false
    },
    {
      categoria: 'Marketing',
      descricao: 'Usados para rastrear visitantes entre sites e exibir anúncios relevantes.',
      exemplos: ['Facebook Pixel', 'Google Ads', 'Remarketing'],
      obrigatorio: false
    },
    {
      categoria: 'Preferências',
      descricao: 'Permitem que o site lembre escolhas que você faz (como idioma ou região).',
      exemplos: ['Idioma preferido', 'Tema claro/escuro', 'Configurações de exibição'],
      obrigatorio: false
    }
  ]

  const secoes = [
    {
      titulo: 'O que são cookies?',
      conteudo: `Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente, melhorar a experiência do usuário e fornecer informações aos proprietários do site.`
    },
    {
      titulo: 'Como usamos cookies?',
      conteudo: `Utilizamos cookies para diversas finalidades, incluindo:`,
      lista: [
        'Manter você logado no sistema',
        'Lembrar suas preferências',
        'Analisar como você usa nossa plataforma',
        'Personalizar conteúdo',
        'Melhorar a segurança',
        'Entender padrões de uso'
      ]
    },
    {
      titulo: 'Tipos de cookies que utilizamos',
      conteudo: `Nossa plataforma utiliza os seguintes tipos de cookies:`,
      tipos: tiposCookies
    },
    {
      titulo: 'Cookies de terceiros',
      conteudo: `Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas. Trabalhamos com parceiros confiáveis que seguem as melhores práticas de privacidade:`,
      parceiros: [
        'Google Analytics - análise de tráfego',
        'Infinitepay - processamento de pagamentos',
        'Facebook - marketing e remarketing',
        'Hotjar - análise de comportamento do usuário'
      ]
    },
    {
      titulo: 'Como controlar cookies',
      conteudo: `Você pode controlar e/ou excluir cookies como desejar. A maioria dos navegadores permite que você recuse ou aceite cookies. No entanto, se você desabilitar cookies, algumas funcionalidades do site podem não funcionar corretamente.`,
      instrucoes: [
        'Configurações do navegador: ajuste suas preferências',
        'Ferramentas de privacidade: utilize extensões',
        'Nosso painel: use as opções abaixo'
      ]
    },
    {
      titulo: 'Cookies essenciais',
      conteudo: `Alguns cookies são essenciais para o funcionamento básico do site e não podem ser desativados. Eles geralmente são definidos apenas em resposta a ações feitas por você, como fazer login ou preencher formulários.`
    },
    {
      titulo: 'Atualizações desta política',
      conteudo: `Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas práticas. Recomendamos que você revise esta página regularmente para se manter informado sobre como usamos cookies.`
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
          <span className="text-foreground font-medium">Política de Cookies</span>
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
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
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
                  <Cookie className="h-4 w-4 mr-2" />
                  Política de Cookies
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Política de Cookies
                </h1>
                <p className="text-lg text-muted-foreground">
                  Última atualização: 15 de janeiro de 2024
                </p>
              </div>

              {/* Preferências de Cookies */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Gerenciar preferências de cookies
                  </h2>
                  
                  <div className="space-y-4">
                    {tiposCookies.map((tipo, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{tipo.categoria}</h3>
                          <p className="text-sm text-muted-foreground">{tipo.descricao}</p>
                        </div>
                        <Switch
                          checked={cookiePreferences[tipo.categoria.toLowerCase() as keyof typeof cookiePreferences]}
                          onCheckedChange={(checked) => 
                            setCookiePreferences(prev => ({
                              ...prev,
                              [tipo.categoria.toLowerCase()]: checked
                            }))
                          }
                          disabled={tipo.obrigatorio}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button>
                      Salvar preferências
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
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
                            {secao.tipos && (
                              <div className="space-y-3">
                                {secao.tipos.map((tipo, i) => (
                                  <div key={i} className="p-3 bg-muted rounded-lg">
                                    <h4 className="font-medium mb-1">{tipo.categoria}</h4>
                                    <p className="text-sm text-muted-foreground mb-2">{tipo.descricao}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {tipo.exemplos.map((exemplo, j) => (
                                        <Badge key={j} variant="secondary">{exemplo}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {secao.parceiros && (
                              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                                {secao.parceiros.map((parceiro, i) => (
                                  <li key={i}>{parceiro}</li>
                                ))}
                              </ul>
                            )}
                            {secao.instrucoes && (
                              <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
                                {secao.instrucoes.map((instrucao, i) => (
                                  <li key={i}>{instrucao}</li>
                                ))}
                              </ol>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    <Separator className="my-8" />

                    <div className="bg-muted/50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        Mais informações
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Para mais informações sobre como usamos cookies e tecnologias similares,
                        entre em contato com nosso Encarregado de Proteção de Dados:
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>E-mail:</strong>{' '}
                          <a href="mailto:contato@sqtecnologiadainformacao.com" className="text-primary hover:underline">
                            contato@sqtecnologiadainformacao.com
                          </a>
                        </p>
                        <p className="text-sm">
                          <strong>Telefone:</strong> (11) 0000-0000
                        </p>
                      </div>
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