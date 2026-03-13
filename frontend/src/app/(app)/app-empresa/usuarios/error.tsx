'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'

export default function UsuariosError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro na página de usuários:', error)
  }, [error])

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Erro" />
        
        <Container size="lg" className="py-8">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="relative mb-6"
              >
                <div className="h-24 w-24 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
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
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-2"
              >
                Erro ao carregar usuários
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground mb-6"
              >
                {error.message || 'Ocorreu um erro ao carregar a lista de usuários. Tente novamente.'}
              </motion.p>

              {error.digest && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-xs text-muted-foreground mb-4 font-mono"
                >
                  Código: {error.digest}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={() => reset()}
                  className="group"
                >
                  <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Tentar novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/app-empresa/dashboard'}
                  className="group"
                >
                  <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Dashboard
                </Button>
              </motion.div>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}