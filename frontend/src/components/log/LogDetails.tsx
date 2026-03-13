'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { JsonViewer } from '@/components/data-display/JsonViewer'
import {
  Calendar,
  User,
  FileText,
  Monitor,
  Globe,
  Clock,
  Building2,
  Fingerprint
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LogDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: any
}

export function LogDetails({ open, onOpenChange, log }: LogDetailsProps) {
  const getAcaoBadge = (acao: string) => {
    const acaoLower = acao.toLowerCase()
    
    if (acaoLower.includes('login') || acaoLower.includes('logout')) {
      return <Badge variant="secondary">{acao}</Badge>
    }
    if (acaoLower.includes('criar') || acaoLower.includes('create')) {
      return <Badge className="bg-green-100 text-green-800">{acao}</Badge>
    }
    if (acaoLower.includes('atualizar') || acaoLower.includes('update')) {
      return <Badge className="bg-blue-100 text-blue-800">{acao}</Badge>
    }
    if (acaoLower.includes('excluir') || acaoLower.includes('delete')) {
      return <Badge variant="destructive">{acao}</Badge>
    }
    if (acaoLower.includes('erro') || acaoLower.includes('error')) {
      return <Badge variant="destructive">{acao}</Badge>
    }
    
    return <Badge variant="outline">{acao}</Badge>
  }

  const parseDados = (dados?: string) => {
    if (!dados) return null
    try {
      return JSON.parse(dados)
    } catch {
      return dados
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Detalhes do Log</span>
            {getAcaoBadge(log.acao)}
          </DialogTitle>
          <DialogDescription>
            ID: {log.id} | {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Usuário:</span>
                    <span className="text-sm">{log.usuarioNome || 'Sistema'}</span>
                  </div>
                  
                  {log.empresaNome && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Empresa:</span>
                      <span className="text-sm">{log.empresaNome}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Entidade:</span>
                    <Badge variant="outline" className="capitalize">
                      {log.entidade}
                      {log.entidadeId && ` #${log.entidadeId}`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">IP:</span>
                    <span className="text-sm">{log.ip || '-'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">User Agent:</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {log.userAgent || '-'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">ID do Registro:</span>
                    <span className="text-sm">{log.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dados Antigos e Novos */}
          {(log.dadosAntigos || log.dadosNovos) && (
            <div className="grid grid-cols-2 gap-4">
              {log.dadosAntigos && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Dados Antigos
                    </h4>
                    <JsonViewer 
                      data={parseDados(log.dadosAntigos)}
                      className="max-h-96"
                    />
                  </CardContent>
                </Card>
              )}

              {log.dadosNovos && (
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Dados Novos
                    </h4>
                    <JsonViewer 
                      data={parseDados(log.dadosNovos)}
                      className="max-h-96"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Metadados Adicionais */}
          <Card>
            <CardContent className="pt-4">
              <h4 className="text-sm font-medium mb-3">Metadados</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Data de Criação:</span>
                  <p className="font-medium">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo de Ação:</span>
                  <p className="font-medium capitalize">{log.acao}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>
                  <p className="font-medium">{new Date(log.createdAt).getTime()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}