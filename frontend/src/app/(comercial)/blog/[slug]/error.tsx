'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home, ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'

export default function PostError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro no artigo:', error)
  }, [error])

  return (
    <Container size="sm" className="py-12">
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
            <BookOpen className="h-20 w-20 text-destructive" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold mb-2">
          Artigo não encontrado
        </h1>
        
        <p className="text-muted-foreground mb-6">
          O artigo que você está procurando pode ter sido removido
          ou está temporariamente indisponível.
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
          
          <Link href="/blog">
            <Button variant="outline" className="group">
              <BookOpen className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Ver todos os artigos
            </Button>
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para página anterior
        </button>
      </motion.div>
    </Container>
  )
}