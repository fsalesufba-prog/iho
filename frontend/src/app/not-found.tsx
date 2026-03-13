'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, ArrowLeft, Search, Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 min-h-[70vh] flex items-center justify-center">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto">
            {/* Animação 404 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="text-9xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                404
              </div>
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Compass className="h-24 w-24 text-primary/20" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Página não encontrada
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8"
            >
              A página que você está procurando pode ter sido removida,
              ter seu nome alterado ou estar temporariamente indisponível.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/">
                <Button size="lg" className="group">
                  <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Página inicial
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.history.back()}
                className="group"
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Voltar
              </Button>
            </motion.div>

            {/* Sugestões de busca */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Você pode estar procurando por:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Planos', 'Blog', 'Contato', 'Login'].map((item) => (
                  <Link key={item} href={`/${item.toLowerCase()}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Search className="h-3 w-3" />
                      {item}
                    </Button>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}