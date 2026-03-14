'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface FAQItem {
  id: string
  question: string
  answer: string
  category?: string
}

interface FAQProps {
  title: string
  subtitle: string
  items: FAQItem[]
  categories?: string[]
  showSearch?: boolean
  showCategories?: boolean
  className?: string
}

export function FAQ({
  title,
  subtitle,
  items,
  categories = [],
  showSearch = true,
  showCategories = true,
  className
}: FAQProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggleItem = (id: string) => {
    const newOpen = new Set(openItems)
    if (newOpen.has(id)) {
      newOpen.delete(id)
    } else {
      newOpen.add(id)
    }
    setOpenItems(newOpen)
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <section className={cn('py-20', className)}>
      <Container size="lg">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-muted-foreground">{subtitle}</p>
        </div>

        {(showSearch || showCategories) && (
          <div className="max-w-2xl mx-auto mb-12">
            {showSearch && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar perguntas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {showCategories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Todos
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma pergunta encontrada. Tente outros termos de busca.
              </p>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => toggleItem(item.id)}
                >
                  <div>
                    <h3 className="text-lg font-semibold">{item.question}</h3>
                    {item.category && (
                      <Badge variant="secondary" className="mt-2">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  {openItems.has(item.id) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                
                {openItems.has(item.id) && (
                  <div className="px-6 pb-6 pt-2 border-t">
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </Container>
    </section>
  )
}