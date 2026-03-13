'use client'

import React, { useState } from 'react'
import { Copy, Check, ChevronRight, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface JsonViewerProps {
  data: any
  expanded?: boolean
  showLineNumbers?: boolean
  showCopy?: boolean
  searchable?: boolean
  maxHeight?: string | number
  className?: string
}

export function JsonViewer({
  data,
  expanded = true,
  showLineNumbers = true,
  showCopy = true,
  searchable = false,
  maxHeight = '500px',
  className
}: JsonViewerProps) {
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandAll, setExpandAll] = useState(expanded)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlightText = (text: string) => {
    if (!searchTerm) return text

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span>
      ) : (
        part
      )
    )
  }

  const renderValue = (value: any): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value.toString()
    if (Array.isArray(value)) return `Array(${value.length})`
    if (typeof value === 'object') return `Object`
    return String(value)
  }

  const getValueColor = (value: any): string => {
    if (value === null || value === undefined) return 'text-gray-500'
    if (typeof value === 'string') return 'text-green-600 dark:text-green-400'
    if (typeof value === 'number') return 'text-blue-600 dark:text-blue-400'
    if (typeof value === 'boolean') return 'text-purple-600 dark:text-purple-400'
    return 'text-foreground'
  }

  const JsonNode = ({ node, path = '', level = 0 }: { node: any; path?: string; level?: number }) => {
    const [isOpen, setIsOpen] = useState(expandAll)
    const isObject = node && typeof node === 'object' && !Array.isArray(node)
    const isArray = Array.isArray(node)
    const isEmpty = isObject && Object.keys(node).length === 0 || isArray && node.length === 0

    if (!isObject && !isArray) {
      return (
        <span className={getValueColor(node)}>
          {highlightText(renderValue(node))}
        </span>
      )
    }

    if (isEmpty) {
      return (
        <span className="text-gray-500 italic">
          {isArray ? '[]' : '{}'}
        </span>
      )
    }

    return (
      <div className="select-none">
        <div
          className="flex items-center cursor-pointer hover:bg-muted/50 rounded px-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">
            {isArray ? `Array[${node.length}]` : 'Object'}
          </span>
        </div>

        {isOpen && (
          <div className="ml-4 border-l pl-4 border-border">
            {Object.entries(node).map(([key, value], index) => (
              <div key={key} className="py-1">
                <span className="text-primary font-medium">{key}</span>
                <span className="text-muted-foreground mx-2">:</span>
                <JsonNode node={value} path={`${path}.${key}`} level={level + 1} />
                {index < Object.keys(node).length - 1 && ','}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('border rounded-lg bg-card', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandAll(!expandAll)}
          >
            {expandAll ? 'Recolher' : 'Expandir'} tudo
          </Button>

          {searchable && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 w-64"
              />
            </div>
          )}
        </div>

        {showCopy && (
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </>
            )}
          </Button>
        )}
      </div>

      {/* JSON Content */}
      <div
        className="p-4 font-mono text-sm overflow-auto"
        style={{ maxHeight }}
      >
        {showLineNumbers ? (
          <div className="flex">
            <div className="text-right pr-4 text-muted-foreground select-none border-r border-border">
              {JSON.stringify(data, null, 2).split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 pl-4">
              <pre className="whitespace-pre-wrap">
                <JsonNode node={data} />
              </pre>
            </div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap">
            <JsonNode node={data} />
          </pre>
        )}
      </div>
    </div>
  )
}

// Versão simples (apenas pré-formatado)
JsonViewer.Simple = function SimpleJsonViewer({
  data,
  className
}: Omit<JsonViewerProps, 'showLineNumbers' | 'showCopy' | 'searchable'>) {
  return (
    <pre className={cn('p-4 bg-muted rounded-lg overflow-auto text-sm', className)}>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}