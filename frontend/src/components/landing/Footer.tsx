import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { Container } from '@/components/common/Container'
import { Separator } from '@/components/ui/Separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/50">
      <Container size="lg" className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Sistema de gestão de equipamentos e índice de saúde operacional para otimizar sua operação.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/planos" className="text-sm text-muted-foreground hover:text-primary">
                  Planos
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-sm text-muted-foreground hover:text-primary">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Jurídico */}
          <div>
            <h3 className="font-semibold mb-4">Jurídico</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/juridico/termos" className="text-sm text-muted-foreground hover:text-primary">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/juridico/privacidade" className="text-sm text-muted-foreground hover:text-primary">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/juridico/cookies" className="text-sm text-muted-foreground hover:text-primary">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <a href="mailto:contato@sqtecnologiadainformacao.com" className="text-sm text-muted-foreground hover:text-primary">
                  contato@sqtecnologiadainformacao.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  (11) 0000-0000
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  São Paulo, SP
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-muted-foreground">
          <p>© {currentYear} IHO - Índice de Saúde Operacional. Todos os direitos reservados.</p>
          <p className="mt-2">
            Desenvolvido por{' '}
            <a
              href="https://sqtecnologiadainformacao.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              SQ Tecnologia da Informação
            </a>
          </p>
        </div>
      </Container>
    </footer>
  )
}