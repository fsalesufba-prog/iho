'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="text-center">
        {/* Logo animado */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="relative mb-8"
        >
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            IHO
          </div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-2 -right-2"
          >
            <div className="h-3 w-3 rounded-full bg-primary" />
          </motion.div>
        </motion.div>

        {/* Barras de loading */}
        <div className="flex gap-2 justify-center mb-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-16 w-4 rounded-full bg-gradient-to-t from-primary to-accent"
              animate={{
                y: [-20, 20, -20],
              }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Texto animado */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.3,
          }}
          className="text-muted-foreground"
        >
          Carregando...
        </motion.p>

        {/* Mensagens alternadas */}
        <motion.div
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-4 text-sm text-primary"
        >
          <span className="block">Preparando sua experiência</span>
          <span className="block mt-1">Otimizando recursos</span>
          <span className="block mt-1">Quase lá...</span>
        </motion.div>
      </div>
    </div>
  )
}