'use client'

import React from 'react'
import Image from 'next/image'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  image?: string
  badge?: string
  highlight?: boolean
}

interface FeaturesProps {
  title: string
  subtitle: string
  features: Feature[]
  layout?: 'grid' | 'alternating' | 'cards' | 'list'
  columns?: 2 | 3 | 4
  showImages?: boolean
  className?: string
}

export function Features({
  title,
  subtitle,
  features,
  layout = 'grid',
  columns = 3,
  showImages = false,
  className
}: FeaturesProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }

  if (layout === 'alternating') {
    return (
      <section className={cn('py-20', className)}>
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-muted-foreground">{subtitle}</p>
          </div>

          <div className="space-y-24">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={cn(
                  'grid lg:grid-cols-2 gap-12 items-center',
                  index % 2 === 1 && 'lg:flex-row-reverse'
                )}
              >
                <div className={cn(
                  'space-y-4',
                  index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
                )}>
                  {feature.badge && (
                    <Badge variant="secondary">{feature.badge}</Badge>
                  )}
                  <h3 className="text-2xl md:text-3xl font-bold">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground">{feature.description}</p>
                </div>

                <div className={cn(
                  'relative rounded-xl overflow-hidden shadow-2xl',
                  index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
                )}>
                  {feature.image ? (
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-primary">{feature.icon}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  if (layout === 'cards') {
    return (
      <section className={cn('py-20', className)}>
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-muted-foreground">{subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className={cn(
                  'transition-all hover:shadow-lg',
                  feature.highlight && 'border-primary shadow-lg'
                )}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  {feature.badge && (
                    <Badge variant="secondary" className="mt-2">
                      {feature.badge}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  if (layout === 'list') {
    return (
      <section className={cn('py-20', className)}>
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl text-muted-foreground">{subtitle}</p>
          </div>

          <div className="max-w-3xl mx-auto divide-y">
            {features.map((feature) => (
              <div key={feature.id} className="py-6 flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  // Layout grid padrão
  return (
    <section className={cn('py-20', className)}>
      <Container size="lg">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground">{subtitle}</p>
        </div>

        <div className={cn('grid gap-8', gridCols[columns])}>
          {features.map((feature) => (
            <div key={feature.id} className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
              {feature.badge && (
                <Badge variant="secondary">{feature.badge}</Badge>
              )}
              {showImages && feature.image && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={400}
                    height={300}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}