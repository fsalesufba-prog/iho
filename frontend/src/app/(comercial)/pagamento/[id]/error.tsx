'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'

export default function PagamentoDetalheError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Erro nos detalhes do pagamento:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Container size="sm">
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
                        Pagamento não encontrado
                    </h1>

                    <p className="text-muted-foreground mb-6">
                        Não foi possível encontrar as informações deste pagamento.
                        Verifique se o link está correto ou tente novamente.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/planos">
                            <Button className="group">
                                <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                Ver planos
                            </Button>
                        </Link>

                        <Button
                            variant="outline"
                            onClick={() => reset()}
                            className="group"
                        >
                            <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                            Tentar novamente
                        </Button>
                    </div>

                    <Link
                        href="/contato"
                        className="mt-6 inline-block text-sm text-primary hover:underline"
                    >
                        Entrar em contato com o suporte
                    </Link>
                </motion.div>
            </Container>
        </div>
    )
}