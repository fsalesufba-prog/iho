'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, User, Clock, Eye } from 'lucide-react'

import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

interface BlogCardProps {
  post: {
    id: number
    titulo: string
    slug: string
    resumo: string
    imagem: string
    autor: string
    categoria: string
    tags: string[]
    dataPublicacao: string
    tempoLeitura: number
    visualizacoes: number
  }
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
            <Clock className="h-3 w-3 mr-1" />
            {post.tempoLeitura} min
          </span>
          <span className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {post.visualizacoes}
          </span>
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
            {post.titulo}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {post.resumo}
        </p>

        <div className="flex items-center text-sm">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{post.autor}</span>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {post.tags?.slice(0, 3).map((tag) => (
            <Link key={tag} href={`/blog/tag/${tag.toLowerCase()}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

BlogCard.Skeleton = function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-6">
        <div className="flex gap-4 mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 rounded-full mr-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-4 pt-0">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardFooter>
    </Card>
  )
}