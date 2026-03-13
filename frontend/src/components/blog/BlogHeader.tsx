'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

interface BlogHeaderProps {
  title?: string
  subtitle?: string
}

export function BlogHeader({ title, subtitle }: BlogHeaderProps) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const getTitle = () => {
    if (title) return title
    
    if (segments[1] === 'categoria') {
      return `Categoria: ${segments[2]}`
    }
    if (segments[1] === 'tag') {
      return `Tag: #${segments[2]}`
    }
    if (segments[1] === 'autor') {
      return `Artigos por ${segments[2]}`
    }
    
    return 'Blog IHO'
  }

  const getSubtitle = () => {
    if (subtitle) return subtitle
    
    if (segments[1] === 'categoria') {
      return `Todos os artigos da categoria ${segments[2]}`
    }
    if (segments[1] === 'tag') {
      return `Artigos com a tag #${segments[2]}`
    }
    if (segments[1] === 'autor') {
      return `Artigos escritos por ${segments[2]}`
    }
    
    return 'Conteúdos sobre gestão de equipamentos, manutenção e IHO'
  }

  return (
    <div className="bg-secondary/20 py-12 mb-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          {segments.length > 1 && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium capitalize">
                {segments[1]}: {decodeURIComponent(segments[2])}
              </span>
            </>
          )}
        </nav>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {getTitle()}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          {getSubtitle()}
        </p>
      </div>
    </div>
  )
}