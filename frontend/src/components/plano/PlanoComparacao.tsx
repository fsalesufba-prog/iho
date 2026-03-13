import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle } from 'lucide-react'

interface PlanoComparacaoProps {
  planos: Array<{
    id: number
    nome: string
    valorImplantacao: number
    valorMensal: number
    limiteAdm: number
    limiteControlador: number
    limiteApontador: number
    limiteEquipamentos: number
    recursos: string[]
  }>
}

export function PlanoComparacao({ planos }: PlanoComparacaoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Coletar todos os recursos únicos
  const todosRecursos = Array.from(
    new Set(
      planos.flatMap(plano => plano.recursos)
    )
  ).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Planos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Características</TableHead>
                {planos.map(plano => (
                  <TableHead key={plano.id} className="text-center min-w-[150px]">
                    <div className="space-y-1">
                      <div className="font-bold text-lg">{plano.nome}</div>
                      <Badge variant="secondary">
                        {formatCurrency(plano.valorMensal)}/mês
                      </Badge>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Implantação */}
              <TableRow>
                <TableCell className="font-medium">Taxa de Implantação</TableCell>
                {planos.map(plano => (
                  <TableCell key={plano.id} className="text-center">
                    {formatCurrency(plano.valorImplantacao)}
                  </TableCell>
                ))}
              </TableRow>

              {/* Limites de Usuários */}
              <TableRow>
                <TableCell className="font-medium">Administradores</TableCell>
                {planos.map(plano => (
                  <TableCell key={plano.id} className="text-center">
                    {plano.limiteAdm}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Controladores</TableCell>
                {planos.map(plano => (
                  <TableCell key={plano.id} className="text-center">
                    {plano.limiteControlador}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Apontadores</TableCell>
                {planos.map(plano => (
                  <TableCell key={plano.id} className="text-center">
                    {plano.limiteApontador}
                  </TableCell>
                ))}
              </TableRow>

              {/* Equipamentos */}
              <TableRow>
                <TableCell className="font-medium">Equipamentos</TableCell>
                {planos.map(plano => (
                  <TableCell key={plano.id} className="text-center">
                    {plano.limiteEquipamentos}
                  </TableCell>
                ))}
              </TableRow>

              {/* Recursos */}
              {todosRecursos.map(recurso => (
                <TableRow key={recurso}>
                  <TableCell className="font-medium">{recurso}</TableCell>
                  {planos.map(plano => (
                    <TableCell key={plano.id} className="text-center">
                      {plano.recursos.includes(recurso) ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}