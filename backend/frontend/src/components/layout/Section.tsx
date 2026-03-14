import React from 'react'
import { Container } from './Container'
import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  background?: 'default' | 'muted' | 'primary'
}

const backgroundClasses = {
  default: 'bg-background',
  muted: 'bg-muted/50',
  primary: 'bg-primary/5'
}

export function Section({
  children,
  title,
  subtitle,
  className,
  containerSize = 'lg',
  background = 'default'
}: SectionProps) {
  return (
    <section className={cn('py-12 md:py-16 lg:py-20', backgroundClasses[background], className)}>
      <Container size={containerSize}>
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>}
            {subtitle && <p className="text-xl text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}