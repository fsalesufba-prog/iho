'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface CTAProps {
  title: string
  description?: string
  primaryCTA: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  variant?: 'default' | 'simple' | 'centered' | 'split'
  background?: 'primary' | 'secondary' | 'muted'
  className?: string
}

export function CTA({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  variant = 'default',
  background = 'primary',
  className
}: CTAProps) {
  const bgClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    muted: 'bg-muted'
  }

  if (variant === 'simple') {
    return (
      <section className={cn('py-16', bgClasses[background], className)}>
        <Container size="lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
              {description && (
                <p className="mt-2 text-lg opacity-90">{description}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={primaryCTA.href}>
                <Button
                  size="lg"
                  variant={background === 'primary' ? 'secondary' : 'default'}
                >
                  {primaryCTA.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {secondaryCTA && (
                <Link href={secondaryCTA.href}>
                  <Button
                    size="lg"
                    variant="outline"
                    className={background === 'primary' ? 'border-white text-white hover:bg-white/10' : ''}
                  >
                    {secondaryCTA.text}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section className={cn('py-20', bgClasses[background], className)}>
        <Container size="lg">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
              {description && (
                <p className="text-lg opacity-90 mb-8">{description}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={primaryCTA.href}>
                  <Button
                    size="lg"
                    variant={background === 'primary' ? 'secondary' : 'default'}
                  >
                    {primaryCTA.text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {secondaryCTA && (
                  <Link href={secondaryCTA.href}>
                    <Button
                      size="lg"
                      variant="outline"
                      className={background === 'primary' ? 'border-white text-white hover:bg-white/10' : ''}
                    >
                      {secondaryCTA.text}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="relative h-64 bg-white/10 rounded-lg flex items-center justify-center">
              {/* Placeholder para imagem/vídeo */}
              <p className="text-white/50">Imagem ou vídeo</p>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  // Variante centered padrão
  return (
    <section className={cn('py-20 text-center', bgClasses[background], className)}>
      <Container size="lg">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {description && (
            <p className="text-lg opacity-90 mb-8">{description}</p>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={primaryCTA.href}>
              <Button
                size="lg"
                variant={background === 'primary' ? 'secondary' : 'default'}
              >
                {primaryCTA.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {secondaryCTA && (
              <Link href={secondaryCTA.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className={background === 'primary' ? 'border-white text-white hover:bg-white/10' : ''}
                >
                  {secondaryCTA.text}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}