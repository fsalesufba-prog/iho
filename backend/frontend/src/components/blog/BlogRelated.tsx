'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { BlogCard } from './BlogCard'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

interface BlogRelatedProps {
  categoria: string
  currentSlug: string
}

export function BlogRelated({ categoria, currentSlug }: BlogRelatedProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPosts()
  }, [categoria, currentSlug])

  const carregarPosts = async () => {
    try {
      const response = await api.get('/blog', {
        params: {
          categoria,
          limit: 3,
          exclude: currentSlug
        }
      })
      setPosts(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar posts relacionados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || posts.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Artigos relacionados</h3>
        <Link href={`/blog/categoria/${categoria.toLowerCase()}`}>
          <Button variant="ghost">
            Ver todos
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}