'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { cn } from '@/lib/utils'

interface HeroProps {
  title: string
  subtitle: string
  description?: string
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  image?: {
    src: string
    alt: string
  }
  video?: {
    url: string
    thumbnail?: string
  }
  stats?: Array<{
    value: string
    label: string
  }>
  showScrollIndicator?: boolean
  className?: string
  variant?: 'default' | 'centered' | 'split' | 'minimal'
}

export function Hero({
  title,
  subtitle,
  description,
  primaryCTA = { text: 'Começar agora', href: '/register' },
  secondaryCTA = { text: 'Ver demonstração', href: '/demo' },
  image,
  video,
  stats,
  showScrollIndicator = true,
  className,
  variant = 'default'
}: HeroProps) {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  if (variant === 'centered') {
    return (
      <section className={cn('relative py-20 overflow-hidden', className)}>
        <Container size="lg">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {subtitle}
            </p>
            {description && (
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                {description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href={primaryCTA.href}>
                <Button size="lg" className="min-w-[200px]">
                  {primaryCTA.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={secondaryCTA.href}>
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  {secondaryCTA.text}
                </Button>
              </Link>
            </div>

            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {image && (
              <div className="mt-16 relative rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        </Container>

        {showScrollIndicator && (
          <button
            onClick={scrollToContent}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </button>
        )}
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section className={cn('relative min-h-screen flex items-center', className)}>
        <Container size="lg">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                {title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {subtitle}
              </p>
              {description && (
                <p className="text-lg text-muted-foreground mb-8">
                  {description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href={primaryCTA.href}>
                  <Button size="lg" className="min-w-[200px]">
                    {primaryCTA.text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {video ? (
                  <Button size="lg" variant="outline" className="min-w-[200px]">
                    <Play className="mr-2 h-4 w-4" />
                    Assistir vídeo
                  </Button>
                ) : (
                  <Link href={secondaryCTA.href}>
                    <Button size="lg" variant="outline" className="min-w-[200px]">
                      {secondaryCTA.text}
                    </Button>
                  </Link>
                )}
              </div>

              {stats && (
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index}>
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              {video ? (
                <div className="relative rounded-xl overflow-hidden shadow-2xl aspect-video">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt="Video thumbnail"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              ) : image ? (
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl"
                />
              ) : null}
            </div>
          </div>
        </Container>

        {showScrollIndicator && (
          <button
            onClick={scrollToContent}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </button>
        )}
      </section>
    )
  }

  // Variante default
  return (
    <section className={cn('relative py-20 overflow-hidden', className)}>
      <Container size="lg">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {subtitle}
          </p>
          {description && (
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              {description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href={primaryCTA.href}>
              <Button size="lg" className="min-w-[200px]">
                {primaryCTA.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={secondaryCTA.href}>
              <Button size="lg" variant="outline" className="min-w-[200px]">
                {secondaryCTA.text}
              </Button>
            </Link>
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-8 mt-12">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {image && (
          <div className="mt-16 relative rounded-xl overflow-hidden shadow-2xl">
            <Image
              src={image.src}
              alt={image.alt}
              width={1200}
              height={600}
              className="w-full h-auto"
            />
          </div>
        )}
      </Container>

      {showScrollIndicator && (
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </button>
      )}
    </section>
  )
}