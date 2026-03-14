'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ArrowLeft, Home, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Card, CardContent } from '@/components/ui/Card'

export default function FinanceiroError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro na página financeiro:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      userAgent: window.navigator.userAgent
    })
  }, [error])

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
                        <DollarSign className="h-12 w-12 text-destructive" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-2"
                  >
                    Erro ao carregar dados financeiros
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground mb-6"
                  >
                    {error.message || 'Não foi possível carregar o dashboard financeiro.'}
                  </motion.p>

                  {error.digest && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="mb-6"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">
                          Código: {error.digest}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                  >
                    <Button
                      onClick={() => reset()}
                      className="group"
                    >
                      <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                      Tentar novamente
                    </Button>
                    
                    <Link href="/app-empresa/dashboard">
                      <Button variant="outline" className="group">
                        <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        Dashboard
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      onClick={() => window.history.back()}
                      className="group"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      Voltar
                    </Button>
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