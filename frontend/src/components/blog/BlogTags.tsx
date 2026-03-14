'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Tag } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

interface TagProps {
  tags?: string[]
  showTitle?: boolean
}

<<<<<<< HEAD
export function BlogTags({ tags, showTitle = true }: TagProps) {
=======
export function BlogTags({ tags }: TagProps) {
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const [allTags, setAllTags] = useState<Array<{ nome: string; count: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tags) {
      carregarTags()
    }
  }, [])

  const carregarTags = async () => {
    try {
      const response = await api.get('/blog/tags')
      setAllTags(response.data)
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
    } finally {
      setLoading(false)
    }
  }

  if (tags) {
    // Render tags específicas do post
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag} href={`/blog/tag/${tag.toLowerCase()}`}>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
              #{tag}
            </Badge>
          </Link>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-16" />
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
          <Tag className="h-5 w-5 mr-2" />
          Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Link key={tag.nome} href={`/blog/tag/${tag.nome.toLowerCase()}`}>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/20 text-sm"
              >
                #{tag.nome}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({tag.count})
                </span>
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}