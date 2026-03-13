'use client'

import React, { useState, useEffect } from 'react'
import { Filter, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface LogFiltersProps {
  filters: {
    acao: string
    entidade: string
    usuario: string
    dataInicio: string
    dataFim: string
  }
  onFilterChange: (filters: any) => void
  onApply: () => void
  className?: string
}

export function LogFilters({ filters, onFilterChange, onApply, className }: LogFiltersProps) {
  const [open, setOpen] = useState(false)
  const [acoes, setAcoes] = useState<string[]>([])
  const [entidades, setEntidades] = useState<string[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])

  useEffect(() => {
    carregarOpcoes()
  }, [])

  const carregarOpcoes = async () => {
    try {
      const [acoesRes, entidadesRes, usuariosRes] = await Promise.all([
        api.get('/logs/acoes'),
        api.get('/logs/entidades'),
        api.get('/usuarios', { params: { limit: 100 } })
      ])
      setAcoes(acoesRes.data)
      setEntidades(entidadesRes.data)
      setUsuarios(usuariosRes.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar opções:', error)
    }
  }

  const activeFiltersCount = Object.values(filters).filter(v => 
    v && v !== '' && v !== 'todas' && v !== 'todos'
  ).length

  const clearFilters = () => {
    onFilterChange({
      acao: 'todas',
      entidade: 'todas',
      usuario: 'todos',
      dataInicio: '',
      dataFim: ''
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('relative', className)}>
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 px-1 min-w-[20px] flex items-center justify-center"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtrar Logs</h4>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ação</label>
              <Select
                value={filters.acao}
                onValueChange={(value) => onFilterChange({ ...filters, acao: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as ações</SelectItem>
                  {acoes.map((acao) => (
                    <SelectItem key={acao} value={acao}>
                      {acao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Entidade</label>
              <Select
                value={filters.entidade}
                onValueChange={(value) => onFilterChange({ ...filters, entidade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as entidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as entidades</SelectItem>
                  {entidades.map((entidade) => (
                    <SelectItem key={entidade} value={entidade}>
                      {entidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário</label>
              <Select
                value={filters.usuario}
                onValueChange={(value) => onFilterChange({ ...filters, usuario: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os usuários</SelectItem>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">De</label>
                  <Input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => onFilterChange({ ...filters, dataInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Até</label>
                  <Input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => onFilterChange({ ...filters, dataFim: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={() => { onApply(); setOpen(false); }}>
              Aplicar filtros
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}