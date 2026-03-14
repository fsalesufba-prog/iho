'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertTriangle, RefreshCw, ArrowLeft, Home, Mail, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Card, CardContent } from '@/components/ui/Card'

export default function UsuarioDetalheError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const usuarioId = params?.id

  useEffect(() => {
    console.error('Erro na página de detalhe do usuário:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      usuarioId,
      url: window.location.href,
      userAgent: window.navigator.userAgent
    })

    // Enviar para serviço de tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Erro usuário ${usuarioId}: ${error.message}`,
        fatal: false
      })
    }
  }, [error, usuarioId])

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Erro" />
        
        <Container size="lg" className="py-8">
          <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="max-w-2xl w-full">
              <CardContent className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {/* Ícone animado */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.1
                    }}
                    className="relative mb-6"
                  >
                    <div className="absolute inset-0 rounded-full bg-destructive/20 blur-3xl animate-pulse" />
                    <div className="relative h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-destructive/10 to-destructive/5 flex items-center justify-center">
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Título */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-2"
                  >
                    Erro ao carregar usuário
                  </motion.h1>

                  {/* Mensagem */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground mb-4"
                  >
                    {error.message || 'Não foi possível carregar os dados do usuário.'}
                  </motion.p>

                  {/* ID do usuário */}
                  {usuarioId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="mb-4"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">
                          ID: {usuarioId}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Código do erro */}
                  {error.digest && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mb-6"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                        <span className="text-xs font-mono text-muted-foreground">
                          Código: {error.digest}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Ações */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                  >
                    <Button
                      onClick={() => reset()}
                      className="group"
                    >
                      <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                      Tentar novamente
                    </Button>
                    
                    <Link href="/app-empresa/usuarios">
                      <Button variant="outline" className="group w-full">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Voltar para lista
                      </Button>
                    </Link>

                    <Link href="/app-empresa/dashboard">
                      <Button variant="ghost" className="group w-full">
                        <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Dashboard
                      </Button>
                    </Link>
                  </motion.div>

                  {/* Sugestões */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 p-4 bg-muted/30 rounded-lg"
                  >
                    <p className="text-sm text-muted-foreground mb-2">
                      Você pode tentar:
                    </p>
                    <ul className="text-sm text-left space-y-1 text-muted-foreground">
                      <li>• Verificar se o usuário ainda existe</li>
                      <li>• Atualizar a página</li>
                      <li>• Entrar em contato com o suporte</li>
                    </ul>
                  </motion.div>

                  {/* Suporte */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6"
                  >
                    <a
                      href="mailto:suporte@iho.com.br"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      suporte@iho.com.br
                    </a>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </>
  )
}