'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useDebounce } from '@/components/hooks/useDebounce'

export function BlogSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchTerm(query)
    }
  }, [searchParams])

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      buscarSugestoes()
    } else {
      setSuggestions([])
    }
  }, [debouncedSearch])

  const buscarSugestoes = async () => {
    // Implementar busca de sugestões
    // Por enquanto, dados mockados
    setSuggestions([
      'Como otimizar manutenção',
      'Indicadores de performance',
      'Gestão de equipamentos',
      'IHO: o que é?',
    ].filter(s => s.toLowerCase().includes(debouncedSearch.toLowerCase())))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/blog?q=${encodeURIComponent(searchTerm.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    router.push(`/blog?q=${encodeURIComponent(suggestion)}`)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setSearchTerm('')
    router.push('/blog')
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="pl-9 pr-20"
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-20"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-1"
            >
              Buscar
            </Button>
          </div>

          {/* Sugestões */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg">
              <ul className="py-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="h-4 w-4 inline mr-2 text-muted-foreground" />
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}