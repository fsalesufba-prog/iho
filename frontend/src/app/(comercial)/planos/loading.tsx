import { Container } from '@/components/common/Container'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardContent } from '@/components/ui/Card'

export default function PlanosLoading() {
  return (
    <div className="min-h-screen">
      {/* Header skeleton */}
      <section className="py-20">
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto">
            <Skeleton className="h-8 w-32 mx-auto mb-4" />
            <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-16 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-8" />
            
            {/* Toggle skeleton */}
            <div className="flex items-center justify-center gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-7 w-14 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </Container>
      </section>

      {/* Planos skeleton */}
      <section className="py-12">
        <Container size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-6" />
                  
                  <Skeleton className="h-10 w-40 mb-4" />
                  
                  <div className="space-y-2 mb-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Tabela comparativa skeleton */}
      <section className="py-20 bg-muted/30">
        <Container size="lg">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Container>
      </section>
    </div>
  )
}