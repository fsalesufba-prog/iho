'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ArrowLeft, Key } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function ResetarSenhaError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro na redefinição de senha:', error)
  }, [error])

  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-center">Link inválido ou expirado</CardTitle>
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
          <Key className="h-16 w-16 text-destructive mx-auto" />
        </motion.div>

        <p className="text-muted-foreground">
          O link de redefinição de senha é inválido ou expirou.
          <br />
          Solicite um novo link na página de recuperação de senha.
        </p>

        <div className="flex gap-2 justify-center">
          <Button onClick={() => reset()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>

          <Link href="/esqueci-senha">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nova solicitação
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}