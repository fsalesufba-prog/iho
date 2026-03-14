'use client'

import React, { useState, useEffect } from 'react'

import { BlogCard } from './BlogCard'
import { BlogPagination } from './BlogPagination'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { api } from '@/lib/api'

interface BlogListProps {
  categoria?: string
  tag?: string
  search?: string
  limit?: number
}

export function BlogList({ categoria, tag, search, limit = 9 }: BlogListProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  

  useEffect(() => {
    carregarPosts()
  }, [page, categoria, tag, search])

  const carregarPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page,
        limit,
        ...(categoria && { categoria }),
        ...(tag && { tag }),
        ...(search && { search })
      }

      const response = await api.get('/blog', { params })
      setPosts(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
      setError('Não foi possível carregar os artigos. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <BlogCard.Skeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Nenhum artigo encontrado</h3>
        <p className="text-muted-foreground">
          {search 
            ? `Nenhum resultado encontrado para "${search}"`
            : 'Não há artigos publicados nesta categoria ainda.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <BlogPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}