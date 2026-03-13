'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderOpen, ChevronRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

interface Category {
  nome: string
  slug: string
  count: number
}

export function BlogCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/blog/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentCategory = pathname?.split('/').pop()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FolderOpen className="h-5 w-5 mr-2" />
          Categorias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>
            <Link
              href="/blog"
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                !currentCategory || currentCategory === 'blog'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-secondary'
              }`}
            >
              <span>Todos os artigos</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/blog/categoria/${category.slug}`}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  currentCategory === category.slug
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-secondary'
                }`}
              >
                <span>{category.nome}</span>
                <Badge variant="secondary">{category.count}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}