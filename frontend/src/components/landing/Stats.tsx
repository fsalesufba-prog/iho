import React from 'react'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface Stat {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
}

interface StatsProps {
  stats: Stat[]
  title?: string
  subtitle?: string
  columns?: 2 | 3 | 4 | 5 | 6
  variant?: 'default' | 'cards' | 'inline'
  className?: string
}

const gridCols = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
}

export function Stats({
  stats,
  title,
  subtitle,
  columns = 4,
  variant = 'default',
  className
}: StatsProps) {
  if (variant === 'cards') {
    return (
      <section className={cn('py-20', className)}>
        <Container size="lg">
          {(title || subtitle) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>}
              {subtitle && <p className="text-xl text-muted-foreground">{subtitle}</p>}
            </div>
          )}

          <div className={cn('grid gap-6', gridCols[columns])}>
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6">
                {stat.icon && (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                    {stat.icon}
                  </div>
                )}
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-medium mb-1">{stat.label}</div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                )}
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-wrap justify-center gap-8', className)}>
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    )
  }

  // Variante default
  return (
    <section className={cn('py-20', className)}>
      <Container size="lg">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>}
            {subtitle && <p className="text-xl text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        <div className={cn('grid gap-8', gridCols[columns])}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              {stat.icon && (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  {stat.icon}
                </div>
              )}
              <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-lg font-medium mb-1">{stat.label}</div>
              {stat.description && (
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}