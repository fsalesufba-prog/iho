'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Post {
  id: number
  titulo: string
  slug: string
  resumo: string
  imagem: string
  autor: string
  categoria: string
  dataPublicacao: string
}

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPosts()
  }, [])

  const carregarPosts = async () => {
    try {
      const response = await api.get('/blog', {
        params: { limit: 3, publicado: true }
      })
      setPosts(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20">
        <Container size="lg">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Blog</h2>
            <p className="text-xl text-muted-foreground">
              Artigos e novidades sobre gestão de equipamentos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="py-20">
      <Container size="lg">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Blog</h2>
          <p className="text-xl text-muted-foreground">
            Artigos e novidades sobre gestão de equipamentos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={post.imagem || '/images/blog/default.jpg'}
                    alt={post.titulo}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4">
                    {post.categoria}
                  </Badge>
                </div>
              </Link>

              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(post.dataPublicacao), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {post.autor}
                  </span>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                    {post.titulo}
                  </h3>
                </Link>

                <p className="text-muted-foreground text-sm line-clamp-3">
                  {post.resumo}
                </p>
              </CardContent>

              <CardFooter className="px-6 pb-4 pt-0">
                <Link href={`/blog/${post.slug}`}>
                  <Button variant="link" className="px-0">
                    Ler mais
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button variant="outline" size="lg">
              Ver todos os artigos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}