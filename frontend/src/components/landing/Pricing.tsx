'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Check, X, HelpCircle } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: Array<{
    name: string
    included: boolean
    tooltip?: string
  }>
  cta: {
    text: string
    href: string
  }
  highlight?: boolean
  badge?: string
}

interface PricingProps {
  title: string
  subtitle: string
  plans: Plan[]
  yearlyDiscount?: number
  showYearlyToggle?: boolean
  showGuarantee?: boolean
  className?: string
}

export function Pricing({
  title,
  subtitle,
  plans,
  yearlyDiscount = 20,
  showYearlyToggle = true,
  showGuarantee = true,
  className
}: PricingProps) {
  const [isYearly, setIsYearly] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <section className={cn('py-20', className)}>
      <Container size="lg">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground">{subtitle}</p>

          {showYearlyToggle && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={cn('text-sm', !isYearly && 'font-medium')}>Mensal</span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className={cn('text-sm', isYearly && 'font-medium')}>
                Anual
                <Badge variant="secondary" className="ml-2">
                  Economize {yearlyDiscount}%
                </Badge>
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative transition-all hover:shadow-lg',
                plan.highlight && 'border-primary shadow-lg scale-105'
              )}
            >
              {plan.badge && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  variant={plan.highlight ? 'default' : 'secondary'}
                >
                  {plan.badge}
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <span className="text-4xl font-bold">
                    {formatCurrency(isYearly ? plan.price.yearly : plan.price.monthly)}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    /{isYearly ? 'ano' : 'mês'}
                  </span>
                  {isYearly && plan.price.monthly > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Economia de {formatCurrency(plan.price.monthly * 12 - plan.price.yearly)}/ano
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={cn(
                        'text-sm',
                        !feature.included && 'text-muted-foreground'
                      )}>
                        {feature.name}
                      </span>
                      {feature.tooltip && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm max-w-xs">{feature.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Link href={plan.cta.href} className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta.text}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {showGuarantee && (
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Todos os planos incluem garantia de satisfação de 30 dias.
              Cancele a qualquer momento.
            </p>
          </div>
        )}
      </Container>
    </section>
  )
}