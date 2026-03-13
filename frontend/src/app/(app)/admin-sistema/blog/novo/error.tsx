'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'

export default function NovoPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro ao criar post:', error)
  }, [error])

  return (
    <Container size="sm" className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <AlertTriangle className="h-20 w-20 text-destructive" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold mb-2">
          Erro ao criar post
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Não foi possível criar o post. Tente novamente.
          {error.message && (
            <span className="block mt-2 text-sm text-destructive">
              {error.message}
            </span>
          )}
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-6 font-mono">
            Código do erro: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => reset()}
            className="group"
          >
            <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            Tentar novamente
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/admin-sistema/blog'}
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para lista
          </Button>
        </div>
      </motion.div>
    </Container>
  )
}