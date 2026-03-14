'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  ChevronLeft,
  Download,
  Printer,
  Calendar,
  AlertCircle,
  CheckCircle,
  Scale,
  Gavel,
  ArrowRight,
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

export default function TermosPage() {
  const secoes = [
    {
      titulo: '1. Aceitação dos Termos',
      conteudo: `Ao acessar ou utilizar o sistema IHO, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar ou utilizar nossos serviços. O uso continuado do sistema implica na aceitação plena destes termos.`
    },
    {
      titulo: '2. Definições',
      conteudo: `Para fins destes Termos de Uso, considera-se:
      • IHO: Plataforma de gestão de equipamentos e índice de saúde operacional
      • Usuário: Pessoa física ou jurídica que utiliza os serviços do IHO
      • Conteúdo: Todas as informações, dados, textos, imagens disponibilizados
      • Conta: Registro do usuário no sistema com credenciais de acesso
      • Dados Pessoais: Informações que permitem identificar um usuário`,
      lista: [
        'Plataforma IHO: sistema de gestão de equipamentos',
        'Usuário: qualquer pessoa que acesse a plataforma',
        'Administrador: usuário com permissões especiais',
        'Conteúdo: informações disponibilizadas na plataforma',
        'Conta: perfil de acesso ao sistema'
      ]
    },
    {
      titulo: '3. Cadastro e Conta',
      conteudo: `Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrem em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.`,
      lista: [
        'Fornecer informações verdadeiras e atualizadas',
        'Manter a confidencialidade da senha',
        'Não compartilhar credenciais com terceiros',
        'Notificar uso não autorizado imediatamente',
        'Maior de 18 anos para criar conta'
      ]
    },
    {
      titulo: '4. Licença de Uso',
      conteudo: `Concedemos a você uma licença limitada, não exclusiva, intransferível e revogável para acessar e usar o IHO de acordo com estes Termos. Esta licença está condicionada ao pagamento das taxas aplicáveis e ao cumprimento de todas as políticas estabelecidas.`,
      lista: [
        'Uso pessoal e comercial conforme plano contratado',
        'Proibida a engenharia reversa do sistema',
        'Não copiar ou distribuir o software',
        'Respeitar os limites do plano contratado',
        'Uso exclusivo para fins legítimos'
      ]
    },
    {
      titulo: '5. Planos e Pagamentos',
      conteudo: `Os serviços são oferecidos em diferentes planos de assinatura. As taxas de implantação e mensalidades são cobradas conforme o plano escolhido. A primeira mensalidade vence 40 dias após o pagamento da implantação. O não pagamento pode resultar na suspensão do acesso.`,
      lista: [
        'Taxa única de implantação: R$ 3.000',
        'Mensalidades conforme plano contratado',
        'Pagamento via cartão, PIX ou boleto',
        'Cancelamento a qualquer momento',
        'Reembolso conforme política específica'
      ]
    },
    {
      titulo: '6. Responsabilidades do Usuário',
      conteudo: `Você é o único responsável por todo conteúdo que publicar, transmitir ou de qualquer forma disponibilizar através do IHO. Você concorda em não utilizar o sistema para fins ilegais ou não autorizados, respeitando todas as leis aplicáveis.`,
      lista: [
        'Não violar direitos de terceiros',
        'Não disseminar conteúdo ilegal',
        'Não tentar burlar a segurança do sistema',
        'Não utilizar para spam ou phishing',
        'Respeitar a propriedade intelectual'
      ]
    },
    {
      titulo: '7. Limitação de Responsabilidade',
      conteudo: `O IHO não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes do uso ou incapacidade de uso do sistema. Em nenhuma circunstância nossa responsabilidade total excederá o valor pago por você nos últimos 12 meses.`
    },
    {
      titulo: '8. Propriedade Intelectual',
      conteudo: `Todo o conteúdo disponibilizado no IHO, incluindo textos, gráficos, logos, ícones, imagens, software, é de propriedade exclusiva do IHO ou de seus licenciadores e está protegido por leis de propriedade intelectual. Você não pode copiar, modificar ou distribuir este conteúdo sem autorização.`
    },
    {
      titulo: '9. Cancelamento e Término',
      conteudo: `Você pode cancelar sua assinatura a qualquer momento através do painel de controle. O cancelamento será efetivado ao final do período já pago. Podemos suspender ou encerrar seu acesso em caso de violação destes Termos, sem prejuízo das demais medidas legais cabíveis.`
    },
    {
      titulo: '10. Disposições Gerais',
      conteudo: `Estes Termos constituem o acordo integral entre você e o IHO em relação ao uso do sistema. Se qualquer disposição for considerada inválida, as demais permanecerão em pleno vigor. A falha em exercer qualquer direito não constituirá renúncia.`,
      lista: [
        'Lei aplicável: brasileira',
        'Foro: São Paulo - SP',
        'Tolerância de 10 dias em atrasos',
        'Comunicações por e-mail',
        'Alterações com aviso prévio de 30 dias'
      ]
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
          <span className="text-foreground font-medium">Termos de Uso</span>
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
                      <Scale className="h-4 w-4 text-primary" />
                      <span>Versão: 2.0.1</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gavel className="h-4 w-4 text-primary" />
                      <span>Lei aplicável: Brasileira</span>
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

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Dúvidas?</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        Entre em contato com nosso suporte jurídico
                      </p>
                      <Link href="https://wa.me/55719982607352?text=Oi,%20quero%20falar%20sobre%20o%20IHO." className="text-xs text-primary hover:underline inline-flex items-center">
                        Falar com especialista
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
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
                  <FileText className="h-4 w-4 mr-2" />
                  Termos de Uso
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Termos e Condições de Uso
                </h1>
                <p className="text-lg text-muted-foreground">
                  Última atualização: 15 de janeiro de 2024
                </p>
              </div>

              <Card>
                <CardContent className="p-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead">
                      Bem-vindo ao IHO. Estes Termos de Uso regulam o acesso e utilização
                      da nossa plataforma de gestão de equipamentos e índice de saúde operacional.
                      Leia atentamente todas as condições antes de utilizar nossos serviços.
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
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    <Separator className="my-8" />

                    <div className="bg-muted/50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Ao utilizar o IHO, você confirma que:
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Leu e compreendeu todos os termos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Concorda em cumprir todas as condições</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Tem capacidade legal para contratar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Forneceu informações verdadeiras</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-8 text-sm text-muted-foreground">
                      <p>
                        Estes Termos de Uso podem ser atualizados periodicamente.
                        Recomendamos que você revise esta página regularmente para
                        estar ciente de quaisquer alterações. O uso continuado do
                        sistema após as alterações constitui aceitação dos novos termos.
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