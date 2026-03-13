'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro no login:', error)
  }, [error])

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-center">Ops! Algo deu errado</CardTitle>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-block mb-4"
        >
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
        </motion.div>

        <p className="text-muted-foreground">
          Não foi possível carregar a página de login.
        </p>

        {error.message && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error.message}
          </p>
        )}

        <div className="flex gap-2 justify-center">
          <Button onClick={() => reset()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>

          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}