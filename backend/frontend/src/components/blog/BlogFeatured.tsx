'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

import { api } from '@/lib/api'

export function BlogFeatured() {
  const [posts, setPosts] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPosts()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [posts.length])

  const carregarPosts = async () => {
    try {
      const response = await api.get('/blog/featured')
      setPosts(response.data)
    } catch (error) {
      console.error('Erro ao carregar posts em destaque:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
  }

  if (loading || posts.length === 0) {
    return null
  }

  const currentPost = posts[currentIndex]

  return (
    <div className="relative h-[500px] rounded-xl overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentPost.imagem}
          alt={currentPost.titulo}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
        <Badge className="mb-4 bg-primary hover:bg-primary/90">
          {currentPost.categoria}
        </Badge>

        <Link href={`/blog/${currentPost.slug}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 hover:text-primary transition-colors">
            {currentPost.titulo}
          </h2>
        </Link>

        <p className="text-lg text-gray-200 mb-6 max-w-3xl">
          {currentPost.resumo}
        </p>

        <div className="flex items-center gap-6 text-sm text-gray-300 mb-6">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(currentPost.dataPublicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <span className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            {currentPost.autor}
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {currentPost.tempoLeitura} min de leitura
          </span>
        </div>

        <Link href={`/blog/${currentPost.slug}`}>
          <Button size="lg" variant="secondary">
            Ler artigo completo
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      {posts.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {posts.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}