'use client'

import React, { useState, useEffect } from 'react'
<<<<<<< HEAD
import Image from 'next/image'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import Link from 'next/link'
import { Twitter, Linkedin, Github, Mail } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'

interface BlogAuthorProps {
  author: string
}

export function BlogAuthor({ author }: BlogAuthorProps) {
  const [authorData, setAuthorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarAutor()
  }, [author])

  const carregarAutor = async () => {
    try {
      const response = await api.get(`/blog/authors/${author}`)
      setAuthorData(response.data)
    } catch (error) {
      console.error('Erro ao carregar autor:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={authorData?.avatar} />
            <AvatarFallback className="text-lg">
              {getInitials(authorData?.nome || author)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">
              {authorData?.nome || author}
            </h3>
            <p className="text-muted-foreground mb-3">
              {authorData?.bio || 'Autor do blog IHO'}
            </p>

            {authorData?.social && (
              <div className="flex items-center space-x-2">
                {authorData.social.twitter && (
                  <Link href={authorData.social.twitter} target="_blank">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {authorData.social.linkedin && (
                  <Link href={authorData.social.linkedin} target="_blank">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {authorData.social.github && (
                  <Link href={authorData.social.github} target="_blank">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Github className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {authorData.social.email && (
                  <Link href={`mailto:${authorData.social.email}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          <Link href={`/blog/autor/${author}`}>
            <Button variant="outline">
              Ver todos os artigos
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}