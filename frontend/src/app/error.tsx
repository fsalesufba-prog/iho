'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro na aplicação:', error)
  }, [error])

  return (
    <>
      <Header />
      <main className="flex-1 min-h-[70vh] flex items-center justify-center">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto">
            {/* Ícone de erro animado */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="relative mb-8"
            >
              <div className="h-32 w-32 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <AlertTriangle className="h-16 w-16 text-destructive" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ops! Algo deu errado
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-4"
            >
              {error.message || 'Ocorreu um erro inesperado ao carregar esta página.'}
            </motion.p>

            {error.digest && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-xs text-muted-foreground mb-8 font-mono"
              >
                Código do erro: {error.digest}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => reset()}
                className="group"
              >
                <RefreshCw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                Tentar novamente
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="group"
              >
                <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Página inicial
              </Button>
            </motion.div>

            {/* Suporte */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 p-6 rounded-lg bg-muted/50"
            >
              <p className="text-sm text-muted-foreground mb-2">
                Se o problema persistir, entre em contato com nosso suporte:
              </p>
              <a
                href="mailto:suporte@iho.com.br"
                className="inline-flex items-center text-primary hover:underline"
              >
                <Mail className="h-4 w-4 mr-2" />
                suporte@iho.com.br
              </a>
            </motion.div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}