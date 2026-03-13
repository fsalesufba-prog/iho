import { Container } from '@/components/common/Container'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardContent } from '@/components/ui/Card'

export default function PagamentoDetalheLoading() {
  return (
    <div className="min-h-screen py-12">
      <Container size="sm">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          {/* Valor skeleton */}
          <Card>
            <CardContent className="p-6 text-center">
              <Skeleton className="h-4 w-24 mx-auto mb-2" />
              <Skeleton className="h-10 w-40 mx-auto" />
            </CardContent>
          </Card>

          {/* Conteúdo skeleton */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-center">
                <Skeleton className="h-48 w-48" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}