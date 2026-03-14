import React from 'react'
import Link from 'next/link'
import { FileText, Shield, Cookie } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

interface Documento {
  id: string
  titulo: string
  descricao: string
  href: string
  icon: React.ReactNode
}

const documentos: Documento[] = [
  {
    id: 'termos',
    titulo: 'Termos de Uso',
    descricao: 'Condições gerais para utilização do sistema IHO',
    href: '/juridico/termos',
    icon: <FileText className="h-6 w-6" />
  },
  {
    id: 'privacidade',
    titulo: 'Política de Privacidade',
    descricao: 'Como coletamos, usamos e protegemos seus dados',
    href: '/juridico/privacidade',
    icon: <Shield className="h-6 w-6" />
  },
  {
    id: 'cookies',
    titulo: 'Política de Cookies',
    descricao: 'Informações sobre o uso de cookies no site',
    href: '/juridico/cookies',
    icon: <Cookie className="h-6 w-6" />
  }
]

export function Juridico() {
  return (
    <section className="py-20">
      <Container size="lg">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Documentos Legais</h2>
          <p className="text-xl text-muted-foreground">
            Transparência e conformidade com a legislação
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {documentos.map((doc) => (
            <Link key={doc.id} href={doc.href}>
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {doc.icon}
                  </div>
                  <CardTitle>{doc.titulo}</CardTitle>
                  <CardDescription>{doc.descricao}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary">Clique para ler →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p className="mt-2">
            Em caso de dúvidas, entre em contato através do e-mail{' '}
            <a href="mailto:contato@sqtecnologiadainformacao.com" className="text-primary hover:underline">
              contato@sqtecnologiadainformacao.com
            </a>
          </p>
        </div>
      </Container>
    </section>
  )
}